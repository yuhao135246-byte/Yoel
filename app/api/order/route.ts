import { formatOrderNumber } from "@/lib/order-number";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderNotification } from "@/lib/mailer";
import {
  getBookingDateOptions,
  getDefaultBookingDate,
  DELIVERY_AREAS,
  getDeliverySlotForArea,
  isDeliveryArea,
  type DeliveryDateOption,
  type DeliveryArea
} from "@/lib/delivery";
import {
  calculateDeliveryFee,
  calculateOrderTotal,
  calculateSubtotal
} from "@/lib/order-pricing";
import {
  ensureInventoryForNextDays,
  getInventoryByDate,
  reserveInventoryForOrder
} from "@/lib/inventory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  deliveryDate?: string;
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
  delivery_date?: string;
  delivery_area?: string;
  delivery_slot?: string;
  subtotal?: number;
  delivery_fee?: number;
  total?: number;
};

type DeliveryAvailability = {
  date: string;
  isFull: false;
  areas: {
    area: DeliveryArea;
    slot: string;
    booked: number;
    remaining: number;
    isAvailable: true;
  }[];
};

type DeliveryAvailabilityResponse = DeliveryAvailability & {
  dateOptions: DeliveryDateOption[];
  defaultDeliveryDate: string;
};

function buildProductSummary(items: ApiOrderItem[]) {
  if (items.length === 1) {
    return items[0].name;
  }

  return items.map((item) => `${item.name} x${item.quantity}`).join("、");
}

function aggregateOrderItems(items: ApiOrderItem[]) {
  const quantityBySlug = new Map<string, number>();

  for (const item of items) {
    if (!item.slug) {
      continue;
    }

    quantityBySlug.set(item.slug, (quantityBySlug.get(item.slug) ?? 0) + Math.max(1, item.quantity));
  }

  return Array.from(quantityBySlug.entries()).map(([slug, quantity]) => ({ slug, quantity }));
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

function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function getDeliveryAvailability(dateKey: string): Promise<DeliveryAvailability> {
  return {
    date: dateKey,
    isFull: false,
    areas: DELIVERY_AREAS.map(({ area, slot }) => {
      return {
        area,
        slot,
        booked: 0,
        remaining: 9999,
        isAvailable: true
      };
    })
  };
}

async function buildDeliveryAvailabilityResponse(selectedDateKey?: string): Promise<DeliveryAvailabilityResponse> {
  const dateOptions = getBookingDateOptions();
  const defaultDeliveryDate = getDefaultBookingDate();
  const availableDates = new Set(dateOptions.map((option) => option.date));

  const selectedDate =
    selectedDateKey && isValidDateKey(selectedDateKey) && availableDates.has(selectedDateKey)
      ? selectedDateKey
      : defaultDeliveryDate;
  const activeAvailability = await getDeliveryAvailability(selectedDate);

  return {
    ...activeAvailability,
    dateOptions,
    defaultDeliveryDate
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

  const {
    subtotal: _subtotal,
    delivery_fee: _deliveryFee,
    total: _total,
    ...legacyRecord
  } = record;

  return supabaseAdmin!
    .from("orders")
    .insert([legacyRecord])
    .select("id")
    .single();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const selectedDate = url.searchParams.get("deliveryDate") ?? undefined;

  if (!supabaseAdmin) {
    const defaultDeliveryDate = getDefaultBookingDate();
    const dateOptions = getBookingDateOptions();
    const availableDates = new Set(dateOptions.map((option) => option.date));
    const activeDate = selectedDate && availableDates.has(selectedDate) ? selectedDate : defaultDeliveryDate;

    return Response.json({
      date: activeDate,
      isFull: false,
      dateOptions,
      defaultDeliveryDate,
      areas: DELIVERY_AREAS.map(({ area, slot }) => ({
        area,
        slot,
        booked: 0,
        remaining: 9999,
        isAvailable: true
      }))
    });
  }

  try {
    const availability = await buildDeliveryAvailabilityResponse(selectedDate);
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
  const deliveryDate = body.deliveryDate?.trim();
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

  if (!deliveryDate || !isValidDateKey(deliveryDate)) {
    return new Response(JSON.stringify({ error: "请选择有效的配送日期。" }), {
      status: 400
    });
  }

  const activeDateOptions = getBookingDateOptions();
  if (!activeDateOptions.some((option) => option.date === deliveryDate)) {
    return new Response(JSON.stringify({ error: "当前时段仅支持可选配送日期，请刷新后重试。" }), {
      status: 409
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
    console.log("Step 1 ensureInventory");
    await ensureInventoryForNextDays(supabaseAdmin, 2);
    console.log("Step 1 OK");

    console.log("Step 2 getInventory");
    const inventoryForDate = await getInventoryByDate(supabaseAdmin, deliveryDate);
    console.log("Step 2 OK");
    const inventoryMap = new Map(inventoryForDate.map((item) => [item.productId, item]));
    const requestedItems = aggregateOrderItems(items);

    for (const requested of requestedItems) {
      const stock = inventoryMap.get(requested.slug);
      if (!stock) {
        return new Response(JSON.stringify({ error: `商品库存不存在：${requested.slug}` }), { status: 409 });
      }

      if (requested.quantity > stock.remainingStock) {
        return new Response(
          JSON.stringify({ error: `库存不足：${stock.productName}，当前剩余 ${stock.remainingStock}` }),
          { status: 409 }
        );
      }
    }

    console.log("Step 3 createOrderNumber");
    const orderNumber = await createOrderNumber();
    console.log("Step 3 OK");
    const productName = buildProductSummary(items);
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);

    console.log("Step 4 insertOrder");
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
      delivery_date: deliveryDate,
      delivery_area: deliveryArea,
      delivery_slot: deliverySlot,
      subtotal,
      delivery_fee: deliveryFee,
      total
    });

    if (error || !order) {
      console.error("Supabase Error:", error);
      throw error ?? new Error("订单保存失败");
    }

    console.log("Step 4 OK");

    try {
      console.log("Step 5 reserveInventory");
      await reserveInventoryForOrder({
        supabase: supabaseAdmin,
        deliveryDate,
        orderId: order.id,
        items
      });
      console.log("Step 5 OK");
    } catch (stockError) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      const stockMessage = stockError instanceof Error ? stockError.message : "库存不足";
      return new Response(JSON.stringify({ error: stockMessage }), { status: 409 });
    }

    try {
      console.log("Step 6 sendMail");
      await sendOrderNotification({
        orderNumber,
        name,
        phone,
        address,
        notes,
        items,
        deliveryDate,
        deliveryArea,
        deliverySlot,
        subtotal,
        deliveryFee,
        total
      });
      console.log("Step 6 OK");
    } catch (mailError) {
      console.error("订单已保存，但邮件发送失败", mailError);
    }

    return new Response(
      JSON.stringify({
        orderNumber,
        orderId: order.id,
        deliveryDate,
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

    const message = error instanceof Error ? error.message : JSON.stringify(error);
    const stack =
      process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? error.stack
          : undefined
        : undefined;

    return new Response(
      JSON.stringify({
        error: message,
        stack
      }),
      { status: 500 }
    );
  }
}
