import { formatOrderNumber } from "@/lib/order-number";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { sendOrderNotification } from "@/lib/mailer";
import {
  toDateKey,
  getChinaNow,
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
  getInventoryByDateReadonly,
  reserveInventoryForOrder
} from "@/lib/inventory";
import { products } from "@/lib/data";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ApiOrderItem = {
  slug?: string;
  name: string;
  price: number;
  quantity: number;
  variant?: {
    baseColor?: string;
  };
  selectedOptions?: {
    groupKey: string;
    groupLabel: string;
    value: string;
    label: string;
  }[];
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

type DbClient = SupabaseClient;

function getProjectRefFromUrl(projectUrl?: string) {
  if (!projectUrl) {
    return null;
  }

  try {
    return new URL(projectUrl).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

const LEGACY_TO_CANONICAL_PRODUCT_ID: Record<string, string> = {
  "stitch-cold-brew": "the-naughty-dog-special-edition-cold-batch-brew"
};

function buildProductSummary(items: ApiOrderItem[]) {
  const lineItems = items.map((item) => {
    const optionText = (item.selectedOptions ?? [])
      .map((option) => `${option.groupLabel}：${option.label}`)
      .join("，");
    return optionText ? `${item.name} x${item.quantity}（${optionText}）` : `${item.name} x${item.quantity}`;
  });

  if (lineItems.length === 1) {
    return lineItems[0];
  }

  return lineItems.join("、");
}

function toCanonicalProductId(productId: string) {
  return LEGACY_TO_CANONICAL_PRODUCT_ID[productId] ?? productId;
}

function getLegacyProductIds(canonicalProductId: string) {
  return Object.entries(LEGACY_TO_CANONICAL_PRODUCT_ID)
    .filter(([, canonical]) => canonical === canonicalProductId)
    .map(([legacy]) => legacy);
}

function buildInventoryReservationItems(items: ApiOrderItem[]) {
  const quantityBySlug = new Map<string, number>();
  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  for (const item of items) {
    if (!item.slug) {
      continue;
    }

    const quantity = Math.max(1, item.quantity);
    const product = productBySlug.get(item.slug);
    const components = product?.inventoryItems ?? [];
    const selectedOptions = item.selectedOptions ?? [];
    const optionComponents = selectedOptions.flatMap((selectedOption) => {
      const group = product?.optionGroups?.find((item) => item.key === selectedOption.groupKey);
      const option = group?.options.find((item) => item.value === selectedOption.value);
      return option?.inventoryItems ?? [];
    });
    const allComponents = [...components, ...optionComponents];

    if (allComponents.length > 0) {
      for (const component of allComponents) {
        quantityBySlug.set(
          component.slug,
          (quantityBySlug.get(component.slug) ?? 0) + quantity * Math.max(1, component.quantity)
        );
      }
      continue;
    }

    quantityBySlug.set(item.slug, (quantityBySlug.get(item.slug) ?? 0) + quantity);
  }

  return Array.from(quantityBySlug.entries()).map(([slug, quantity]) => ({ slug, quantity }));
}

async function createOrderNumber(client: DbClient) {
  const today = getChinaNow();
  const prefix = `CD-${today.toISOString().slice(0, 10).replaceAll("-", "")}-`;
  const { data, error } = await client
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

async function insertOrder(client: DbClient, record: InsertOrderRecord) {
  const fullInsert = await client
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

  return client
    .from("orders")
    .insert([legacyRecord])
    .select("id")
    .single();
}

function getSupabaseErrorText(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeCode = "code" in error ? String((error as Record<string, unknown>).code ?? "") : "";
    const maybeMessage = "message" in error ? String((error as Record<string, unknown>).message ?? "") : "";
    const maybeHint = "hint" in error ? String((error as Record<string, unknown>).hint ?? "") : "";
    return [maybeCode, maybeMessage, maybeHint].filter((part) => part.length > 0).join(" | ");
  }

  return String(error);
}

function isUnregisteredApiKeyError(error: unknown) {
  const text = getSupabaseErrorText(error).toLowerCase();
  return text.includes("unregistered api key") || text.includes("unauthorized_unregistered_api_key");
}

function isInventoryConflictError(error: unknown) {
  const text = getSupabaseErrorText(error);
  return text.includes("库存不足") || text.includes("库存不存在");
}

function isInventoryMissingError(error: unknown) {
  const text = getSupabaseErrorText(error);
  return text.includes("库存不存在") || text.includes("Inventory not found") || text.includes("P0001");
}

function getDateAtChinaMidnight(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

async function ensureInventoryForDeliveryDate(client: DbClient, deliveryDate: string) {
  const date = getDateAtChinaMidnight(deliveryDate);
  if (!date) {
    return;
  }

  const todayDate = getDateAtChinaMidnight(toDateKey(getChinaNow()));
  if (!todayDate) {
    return;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const dayDiff = Math.round((date.getTime() - todayDate.getTime()) / msPerDay);

  if (dayDiff < 0) {
    return;
  }

  await ensureInventoryForNextDays(client, dayDiff + 1);
}

async function ensureInventoryRowsForRequestedItems(params: {
  client: DbClient;
  deliveryDate: string;
  requestedItems: { slug: string; quantity: number }[];
  inventoryMap: Map<string, { totalStock: number; remainingStock: number }>;
}) {
  const requestedSlugs = Array.from(new Set(params.requestedItems.map((item) => item.slug)));
  if (requestedSlugs.length === 0) {
    return;
  }

  const { data, error } = await params.client
    .from("inventory")
    .select("product_id")
    .eq("delivery_date", params.deliveryDate)
    .in("product_id", requestedSlugs);

  if (error) {
    throw error;
  }

  const existing = new Set((data ?? []).map((row) => String(row.product_id)));
  const rowsToInsert = requestedSlugs
    .filter((slug) => !existing.has(slug))
    .map((slug) => {
      const totalStock = Math.max(0, Number(params.inventoryMap.get(slug)?.totalStock ?? 10));
      return {
        product_id: slug,
        delivery_date: params.deliveryDate,
        total_stock: totalStock,
        sold_quantity: 0,
        remaining_stock: totalStock,
        status: totalStock > 0 ? "Available" : "Sold Out"
      };
    });

  if (rowsToInsert.length === 0) {
    return;
  }

  const { error: upsertError } = await params.client
    .from("inventory")
    .upsert(rowsToInsert, { onConflict: "product_id,delivery_date", ignoreDuplicates: true });

  if (upsertError) {
    throw upsertError;
  }
}

async function migrateLegacyInventoryRowsForRequestedItems(params: {
  client: DbClient;
  deliveryDate: string;
  requestedItems: { slug: string; quantity: number }[];
}) {
  const requestedCanonicalSlugs = Array.from(
    new Set(params.requestedItems.map((item) => toCanonicalProductId(item.slug)))
  );

  for (const canonicalSlug of requestedCanonicalSlugs) {
    const legacyIds = getLegacyProductIds(canonicalSlug);
    if (legacyIds.length === 0) {
      continue;
    }

    const candidateIds = [canonicalSlug, ...legacyIds];
    const { data, error } = await params.client
      .from("inventory")
      .select("id, product_id")
      .eq("delivery_date", params.deliveryDate)
      .in("product_id", candidateIds);

    if (error) {
      throw error;
    }

    const rows = data ?? [];
    const canonicalRow = rows.find((row) => String(row.product_id) === canonicalSlug);
    const legacyRows = rows.filter((row) => legacyIds.includes(String(row.product_id)));

    if (legacyRows.length === 0) {
      continue;
    }

    if (!canonicalRow) {
      const [firstLegacy, ...extraLegacy] = legacyRows;
      const { error: renameError } = await params.client
        .from("inventory")
        .update({ product_id: canonicalSlug })
        .eq("id", firstLegacy.id);

      if (renameError) {
        throw renameError;
      }

      if (extraLegacy.length > 0) {
        const { error: deleteExtrasError } = await params.client
          .from("inventory")
          .delete()
          .in(
            "id",
            extraLegacy.map((row) => row.id)
          );

        if (deleteExtrasError) {
          throw deleteExtrasError;
        }
      }

      continue;
    }

    const { error: deleteLegacyError } = await params.client
      .from("inventory")
      .delete()
      .eq("delivery_date", params.deliveryDate)
      .in("product_id", legacyIds);

    if (deleteLegacyError) {
      throw deleteLegacyError;
    }
  }
}

function logReserveInventoryDebug(params: {
  client: DbClient;
  deliveryDate: string;
  requestedItems: { slug: string; quantity: number }[];
}) {
  const rpcPayload = params.requestedItems.map((item) => ({
    product_id: item.slug,
    quantity: item.quantity
  }));

  console.log("[order POST] reserveInventoryForOrder debug", {
    deliveryDate: params.deliveryDate,
    requestedItems: params.requestedItems,
    rpcPayload,
    client: params.client === supabaseAdmin ? "supabaseAdmin" : "supabase",
    projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseActive: Boolean(supabase),
    supabaseAdminActive: Boolean(supabaseAdmin)
  });
}

export async function GET(request: Request) {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log("[order API env debug]", {
    projectUrl,
    projectRef: getProjectRefFromUrl(projectUrl),
    supabaseActive: Boolean(supabase),
    supabaseAdminActive: Boolean(supabaseAdmin),
    serviceRoleKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  });

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
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log("[order API env debug]", {
    projectUrl,
    projectRef: getProjectRefFromUrl(projectUrl),
    supabaseActive: Boolean(supabase),
    supabaseAdminActive: Boolean(supabaseAdmin),
    serviceRoleKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  });

  const body = (await request.json()) as ApiOrderPayload;
  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const address = body.address?.trim();
  const notes = body.notes?.trim();
  const deliveryDate = body.deliveryDate?.trim();
  const deliveryArea = body.deliveryArea?.trim();
  const items = Array.isArray(body.items)
    ? body.items.map((item) => ({
        slug: item.slug ? toCanonicalProductId(String(item.slug)) : undefined,
        name: item.name,
        price: Number(item.price),
        quantity: Math.max(1, Number(item.quantity)),
        variant:
          item.variant && typeof item.variant === "object"
            ? {
                baseColor:
                  typeof item.variant.baseColor === "string" ? item.variant.baseColor : undefined
              }
            : undefined,
        selectedOptions: Array.isArray(item.selectedOptions)
          ? item.selectedOptions
              .map((option) => ({
                groupKey: String(option.groupKey ?? ""),
                groupLabel: String(option.groupLabel ?? ""),
                value: String(option.value ?? ""),
                label: String(option.label ?? "")
              }))
              .filter((option) => option.groupKey.length > 0 && option.value.length > 0)
          : undefined
      }))
    : [];
  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  console.log("Order received", {
    name,
    phone,
    deliveryDate,
    deliveryArea,
    itemsCount: items.length
  });

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

  for (const item of items) {
    if (!item.slug) {
      continue;
    }

    const product = productBySlug.get(item.slug);
    const requiredGroups = (product?.optionGroups ?? []).filter((group) => group.required !== false);
    const selectedOptions = item.selectedOptions ?? [];

    for (const group of requiredGroups) {
      const selected = selectedOptions.find((option) => option.groupKey === group.key);
      const hasValidOption = Boolean(
        selected &&
          group.options.some((option) => option.value === selected.value)
      );

      if (!hasValidOption) {
        return new Response(JSON.stringify({ error: `${item.name} 缺少必选项：${group.label}` }), {
          status: 400
        });
      }
    }
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

  const clients = [supabaseAdmin, supabase].filter((client): client is DbClient => Boolean(client));

  if (clients.length === 0) {
    return new Response(JSON.stringify({ error: "Supabase 服务未配置，无法保存订单。" }), { status: 500 });
  }

  try {
    const getClientLabel = (client: DbClient) => (client === supabaseAdmin ? "service-role" : "anon");
    let activeClient: DbClient | null = null;

    async function runStepWithFallback<T>(
      stepName: string,
      operation: (client: DbClient) => Promise<T>
    ): Promise<T> {
      const primaryClient = activeClient ?? clients[0];

      try {
        const result = await operation(primaryClient);
        activeClient = primaryClient;
        return result;
      } catch (primaryError) {
        const primaryText = getSupabaseErrorText(primaryError);
        console.error(`[order POST] ${stepName} failed on ${getClientLabel(primaryClient)}`, primaryText, primaryError);
        if (primaryError instanceof Error && primaryError.stack) {
          console.error(primaryError.stack);
        }

        const fallbackClient = clients.find((client) => client !== primaryClient);
        const shouldFallback = Boolean(
          fallbackClient &&
            primaryClient === supabaseAdmin &&
            fallbackClient === supabase &&
            isUnregisteredApiKeyError(primaryError)
        );

        if (!shouldFallback || !fallbackClient) {
          throw primaryError;
        }

        console.error(
          `[order POST] ${stepName} retrying with anon client because SUPABASE_SERVICE_ROLE_KEY is invalid.`
        );

        const result = await operation(fallbackClient);
        activeClient = fallbackClient;
        return result;
      }
    }

    console.log("Step 1 ensureInventory");
    await runStepWithFallback("ensureInventoryForNextDays", async (client) => {
      if (client === supabaseAdmin) {
        await ensureInventoryForDeliveryDate(client, deliveryDate);
      }
    });
    console.log("Step 1 OK");

    const migrationClient = activeClient ?? clients[0];
    if (migrationClient === supabaseAdmin) {
      console.log("Step 1.5 migrateLegacyInventoryRowsForRequestedItems");
      const requestedItemsForMigration = buildInventoryReservationItems(items);
      await migrateLegacyInventoryRowsForRequestedItems({
        client: migrationClient,
        deliveryDate,
        requestedItems: requestedItemsForMigration
      });
      console.log("Step 1.5 OK");
    }

    console.log("Step 2 getInventory");
    const inventoryForDate = await runStepWithFallback("getInventoryByDate", async (client) => {
      if (client === supabaseAdmin) {
        return getInventoryByDate(client, deliveryDate);
      }

      return getInventoryByDateReadonly(client, deliveryDate);
    });
    console.log("Step 2 OK");
    const inventoryMap = new Map(inventoryForDate.map((item) => [item.productId, item]));
    const requestedItems = buildInventoryReservationItems(items);

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

    const seedClient = activeClient ?? clients[0];
    if (seedClient === supabaseAdmin) {
      console.log("Step 2.5 ensureInventoryRowsForRequestedItems");
      await ensureInventoryRowsForRequestedItems({
        client: seedClient,
        deliveryDate,
        requestedItems,
        inventoryMap
      });
      console.log("Step 2.5 OK");
    }

    console.log("Step 3 createOrderNumber");
    const orderNumber = await runStepWithFallback("createOrderNumber", (client) => createOrderNumber(client));
    console.log("Step 3 OK");
    const productName = buildProductSummary(items);
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);

    console.log("Step 4 insertOrder");
    const { data: order, error } = await runStepWithFallback("insertOrder", (client) =>
      insertOrder(client, {
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
        created_at: getChinaNow().toISOString(),
        delivery_date: deliveryDate,
        delivery_area: deliveryArea,
        delivery_slot: deliverySlot,
        subtotal,
        delivery_fee: deliveryFee,
        total
      })
    );

    if (error || !order) {
      console.error("Supabase Error:", error);
      throw error ?? new Error("订单保存失败");
    }

    console.log("Order saved", {
      orderId: order.id,
      orderNumber,
      deliveryDate,
      deliveryArea,
      subtotal,
      deliveryFee,
      total
    });

    console.log("Step 4 OK");

    let reservedWithLegacyAlias = false;

    try {
      console.log("Step 5 reserveInventory");
      await runStepWithFallback("reserveInventoryForOrder", (client) =>
        ((() => {
          logReserveInventoryDebug({
            client,
            deliveryDate,
            requestedItems
          });

          return reserveInventoryForOrder({
            supabase: client,
            deliveryDate,
            orderId: order.id,
            items: requestedItems.map((item) => ({
              slug: item.slug,
              name: item.slug,
              quantity: item.quantity
            }))
          });
        })())
      );
      console.log("Step 5 OK");
    } catch (stockError) {
      if (isInventoryMissingError(stockError)) {
        const legacyRequestedItems = requestedItems.map((item) => {
          const legacyIds = getLegacyProductIds(item.slug);
          return {
            ...item,
            slug: legacyIds[0] ?? item.slug
          };
        });

        const hasAliasFallback = legacyRequestedItems.some((item, index) => item.slug !== requestedItems[index]?.slug);
        if (hasAliasFallback) {
          try {
            console.log("Step 5 retry reserveInventoryForOrder with legacy aliases");
            await runStepWithFallback("reserveInventoryForOrderLegacyAlias", (client) =>
              ((() => {
                logReserveInventoryDebug({
                  client,
                  deliveryDate,
                  requestedItems: legacyRequestedItems
                });

                return reserveInventoryForOrder({
                  supabase: client,
                  deliveryDate,
                  orderId: order.id,
                  items: legacyRequestedItems.map((item) => ({
                    slug: item.slug,
                    name: item.slug,
                    quantity: item.quantity
                  }))
                });
              })())
            );
            reservedWithLegacyAlias = true;
            console.log("Step 5 legacy alias reserve OK");
          } catch (legacyReserveError) {
            console.error("[order POST] legacy alias reserve failed", legacyReserveError);
          }
        }
      }

      if (reservedWithLegacyAlias) {
        // Continue normal response flow after successful alias fallback reservation.
      } else {
      try {
        const rollbackClient = activeClient as DbClient | null;
        if (rollbackClient) {
          await rollbackClient.from("orders").delete().eq("id", order.id);
        }
      } catch (rollbackError) {
        console.error("[order POST] rollback order failed", rollbackError);
      }

      if (isInventoryConflictError(stockError)) {
        const stockMessage = getSupabaseErrorText(stockError);
        return new Response(JSON.stringify({ error: stockMessage || "库存不足" }), { status: 409 });
      }

      throw stockError;
      }
    }

    try {
      console.log("Sending email...", {
        orderId: order.id,
        orderNumber
      });
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
      console.log("Email sent successfully", {
        orderId: order.id,
        orderNumber
      });
      console.log("Step 6 OK");
    } catch (mailError) {
      console.error("Email failed", mailError);
      console.error("订单已保存，但邮件发送失败", {
        orderNumber,
        orderId: order.id,
        error: mailError instanceof Error ? mailError.message : String(mailError),
        stack: mailError instanceof Error ? mailError.stack : undefined
      });
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
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }

    const message = isUnregisteredApiKeyError(error)
      ? "SUPABASE_SERVICE_ROLE_KEY 无效（Unregistered API key）"
      : getSupabaseErrorText(error);
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
