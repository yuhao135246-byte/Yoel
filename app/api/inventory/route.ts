import { products } from "@/lib/data";
import { getBookingDateOptions, getDefaultBookingDate } from "@/lib/delivery";
import {
  getInventoryByDate,
  getInventoryByDateReadonly,
  getInventoryDateRange,
  INVENTORY_DEFAULT_STOCK
} from "@/lib/inventory";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function buildDefaultRecords() {
  return products
    .filter((product) => product.category === "COFFEE")
    .map((product) => {
      const totalStock = INVENTORY_DEFAULT_STOCK[product.slug] ?? 10;
      return {
        productId: product.slug,
        productName: product.name,
        totalStock,
        soldQuantity: 0,
        remainingStock: totalStock,
        status: "Available" as const
      };
    });
}

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeMessage = "message" in error ? String((error as Record<string, unknown>).message) : "";
    const maybeHint = "hint" in error ? String((error as Record<string, unknown>).hint) : "";
    const maybeCode = "code" in error ? String((error as Record<string, unknown>).code) : "";
    return [maybeCode, maybeMessage, maybeHint].filter((item) => item.length > 0).join(" | ");
  }

  return String(error);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryDate = url.searchParams.get("deliveryDate") ?? "";
  const defaultDeliveryDate = getDefaultBookingDate();
  const dateOptions = getBookingDateOptions();
  const availableDates = new Set(dateOptions.map((option) => option.date));
  const deliveryDate = isValidDateKey(queryDate) && availableDates.has(queryDate) ? queryDate : defaultDeliveryDate;

  if (!supabaseAdmin && !supabase) {
    const records = buildDefaultRecords();

    return Response.json({
      deliveryDate,
      defaultDeliveryDate,
      dateOptions,
      rangeDates: getInventoryDateRange(2),
      records
    });
  }

  try {
    if (supabaseAdmin) {
      const records = await getInventoryByDate(supabaseAdmin, deliveryDate);
      return Response.json({
        deliveryDate,
        defaultDeliveryDate,
        dateOptions,
        rangeDates: getInventoryDateRange(2),
        records
      });
    }

    if (supabase) {
      const records = await getInventoryByDateReadonly(supabase, deliveryDate);
      return Response.json({
        deliveryDate,
        defaultDeliveryDate,
        dateOptions,
        rangeDates: getInventoryDateRange(2),
        records
      });
    }

    const records = buildDefaultRecords();
    return Response.json({
      deliveryDate,
      defaultDeliveryDate,
      dateOptions,
      rangeDates: getInventoryDateRange(2),
      records
    });
  } catch (error) {
    const primaryError = getErrorText(error);
    console.error("[inventory GET] Supabase 主查询失败", primaryError, error);

    if (supabase) {
      try {
        const records = await getInventoryByDateReadonly(supabase, deliveryDate);
        return Response.json({
          deliveryDate,
          defaultDeliveryDate,
          dateOptions,
          rangeDates: getInventoryDateRange(2),
          records
        });
      } catch (fallbackError) {
        const fallbackText = getErrorText(fallbackError);
        console.error("[inventory GET] Supabase 只读回退失败", fallbackText, fallbackError);
      }
    }

    const records = buildDefaultRecords();
    return Response.json({
      deliveryDate,
      defaultDeliveryDate,
      dateOptions,
      rangeDates: getInventoryDateRange(2),
      records,
      warning: primaryError || "库存读取失败，已回退默认库存"
    });
  }
}
