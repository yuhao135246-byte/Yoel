import { formatOrderNumber } from "@/lib/order-number";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderNotification } from "@/lib/mailer";
import {
  AREA_DAILY_CAPACITY,
  DELIVERY_AREAS,
  GLOBAL_DAILY_CAPACITY,
  getDeliverySlotForArea,
  isDeliveryArea,
  type DeliveryArea
} from "@/lib/delivery";
import {
  calculateDeliveryFee,
  calculateOrderTotal,
  calculateSubtotal
} from "@/lib/order-pricing";

type ApiOrderItem = {
  slug?: string;
  name: string;
  price: number;
  quantity: number;
};

type ApiOrderPayload = {
  name?: string;
  phone?: string;
  address?: string;
  notes?: string;
  items?: ApiOrderItem[];
  deliveryArea?: string;
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
};

type InsertOrderRecord = {
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  product_name: string;
  quantity: number;
  amount: number;
  status: string;
  notes?: string;
  items: ApiOrderItem[];
  created_at: string;
  delivery_area?: string;
  delivery_slot?: string;
  subtotal?: number;
  delivery_fee?: number;
  total?: number;
};

type DeliveryAvailability = {
  date: string;
  isFull: boolean;
  message?: string;
  areas: {
    area: DeliveryArea;
    slot: string;
    booked: number;
    remaining: number;
    isAvailable: boolean;
    message?: string;
  }[];
};

function buildProductSummary(items: ApiOrderItem[]) {
  if (items.length === 1) {
    return items[0].name;
  }

  return items.map((item) => `${item.name} x${item.quantity}`).join("、");
}

async function createOrderNumber() {
  if (!supabaseAdmin) {
    throw new Error("Supabase 服务未配置");
  }

  const today = new Date();
  const prefix = `CD-${today.toISOString().slice(0, 10).replaceAll("-", "")}-`;
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("order_number")
    .ilike("order_number", `${prefix}%`)
    .order("order_number", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  const latest = data?.[0]?.order_number;
  const nextIndex = latest ? Number(latest.slice(-4)) + 1 : 1;
  return formatOrderNumber(today, nextIndex);
}

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    date: start.toISOString().slice(0, 10),
    start: start.toISOString(),
    end: end.toISOString()
  };
}

async function loadTodayOrders() {
  const todayRange = getTodayRange();
  const result = await supabaseAdmin!
    .from("orders")
    .select("id, delivery_area, created_at")
    .gte("created_at", todayRange.start)
    .lt("created_at", todayRange.end);

  if (!result.error) {
    return {
      date: todayRange.date,
      rows: result.data ?? [],
      supportsDeliveryArea: true
    };
  }

  const legacyResult = await supabaseAdmin!
    .from("orders")
    .select("id, created_at")
    .gte("created_at", todayRange.start)
    .lt("created_at", todayRange.end);

  if (legacyResult.error) {
    throw legacyResult.error;
  }

  return {
    date: todayRange.date,
    rows: (legacyResult.data ?? []).map((row) => ({ ...row, delivery_area: null })),
    supportsDeliveryArea: false
  };
}

async function getDeliveryAvailability(): Promise<DeliveryAvailability> {
  const { date, rows, supportsDeliveryArea } = await loadTodayOrders();
  const totalBooked = rows.length;
  const isFull = totalBooked >= GLOBAL_DAILY_CAPACITY;
  const areaCounts = new Map<DeliveryArea, number>();

  for (const deliveryArea of DELIVERY_AREAS.map((item) => item.area)) {
    areaCounts.set(deliveryArea, 0);
  }

  if (supportsDeliveryArea) {
    for (const row of rows) {
      if (row.delivery_area && isDeliveryArea(row.delivery_area)) {
        areaCounts.set(row.delivery_area, (areaCounts.get(row.delivery_area) ?? 0) + 1);
      }
    }
  }

  return {
    date,
    isFull,
    message: isFull ? "今日晨间配送已满，请预约明日配送" : undefined,
    areas: DELIVERY_AREAS.map(({ area, slot }) => {
      const booked = areaCounts.get(area) ?? 0;
      const remaining = Math.max(AREA_DAILY_CAPACITY - booked, 0);
      const isAvailable = !isFull && remaining > 0;

      return {
        area,
        slot,
        booked,
        remaining,
        isAvailable,
        message: isAvailable ? undefined : "该区域今日配送已满"
      };
    })
  };
}

function canRetryWithoutPricingFields(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: string; message?: string };
  const message = maybeError.message?.toLowerCase() ?? "";

  return (
    maybeError.code === "PGRST204" ||
    message.includes("delivery_area") ||
    message.includes("delivery_slot") ||
    message.includes("subtotal") ||
    message.includes("delivery_fee") ||
    message.includes("total")
  );
}

async function insertOrder(record: InsertOrderRecord) {
  const fullInsert = await supabaseAdmin!
    .from("orders")
    .insert([record])
    .select("id")
    .single();

  if (!fullInsert.error || !canRetryWithoutPricingFields(fullInsert.error)) {
    return fullInsert;
  }

  const { subtotal: _subtotal, delivery_fee: _deliveryFee, total: _total, ...legacyRecord } = record;

  return supabaseAdmin!
    .from("orders")
    .insert([legacyRecord])
    .select("id")
    .single();
}

export async function GET() {
  if (!supabaseAdmin) {
    return Response.json({
      date: getTodayRange().date,
      isFull: false,
      areas: DELIVERY_AREAS.map(({ area, slot }) => ({
        area,
        slot,
        booked: 0,
        remaining: AREA_DAILY_CAPACITY,
        isAvailable: true
      }))
    });
  }

  try {
    const availability = await getDeliveryAvailability();
    return Response.json(availability);
  } catch (error) {
    console.error("读取配送容量失败", error);
    return new Response(JSON.stringify({ error: "读取配送容量失败" }), { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as ApiOrderPayload;
  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const address = body.address?.trim();
  const notes = body.notes?.trim();
  const deliveryArea = body.deliveryArea?.trim();
  const items = Array.isArray(body.items)
    ? body.items.map((item) => ({
        slug: item.slug,
        name: item.name,
        price: Number(item.price),
        quantity: Math.max(1, Number(item.quantity))
      }))
    : [];

  if (!name || !phone || !address || items.length === 0) {
    return new Response(JSON.stringify({ error: "姓名、电话、地址和商品不能为空。" }), {
      status: 400
    });
  }

  if (!deliveryArea || !isDeliveryArea(deliveryArea)) {
    return new Response(JSON.stringify({ error: "请选择有效的配送区域。" }), {
      status: 400
    });
  }

  const subtotal = calculateSubtotal(items);
  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = calculateOrderTotal(subtotal);
  const deliverySlot = getDeliverySlotForArea(deliveryArea);

  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: "Supabase 服务未配置，无法保存订单。" }), { status: 500 });
  }

  try {
    const availability = await getDeliveryAvailability();
    if (availability.isFull) {
      return new Response(JSON.stringify({ error: availability.message }), { status: 409 });
    }

    const areaStatus = availability.areas.find((item) => item.area === deliveryArea);
    if (!areaStatus?.isAvailable) {
      return new Response(JSON.stringify({ error: areaStatus?.message ?? "该区域今日配送已满" }), { status: 409 });
    }

    const orderNumber = await createOrderNumber();
    const productName = buildProductSummary(items);
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);

    const { data: order, error } = await insertOrder({
      order_number: orderNumber,
      customer_name: name,
      phone,
      address,
      product_name: productName,
      quantity,
      amount: total,
      status: "PENDING",
      notes,
      items,
      created_at: new Date().toISOString(),
      delivery_area: deliveryArea,
      delivery_slot: deliverySlot,
      subtotal,
      delivery_fee: deliveryFee,
      total
    });

    if (error || !order) {
      throw error ?? new Error("订单保存失败");
    }

    try {
      await sendOrderNotification({
        orderNumber,
        name,
        phone,
        address,
        notes,
        items,
        deliveryArea,
        deliverySlot,
        subtotal,
        deliveryFee,
        total
      });
    } catch (mailError) {
      console.error("订单已保存，但邮件发送失败", mailError);
    }

    return new Response(
      JSON.stringify({
        orderNumber,
        orderId: order.id,
        deliveryArea,
        deliverySlot,
        subtotal,
        deliveryFee,
        total
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("订单保存失败", error);
    return new Response(JSON.stringify({ error: "订单保存失败" }), { status: 500 });
  }
}
