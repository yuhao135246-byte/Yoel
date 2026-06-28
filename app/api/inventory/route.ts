import { products } from "@/lib/data";
import { getBookingDateOptions, getDefaultBookingDate } from "@/lib/delivery";
import {
  getInventoryByDate,
  getInventoryDateRange,
  INVENTORY_DEFAULT_STOCK
} from "@/lib/inventory";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryDate = url.searchParams.get("deliveryDate") ?? "";
  const defaultDeliveryDate = getDefaultBookingDate();
  const dateOptions = getBookingDateOptions();
  const availableDates = new Set(dateOptions.map((option) => option.date));
  const deliveryDate = isValidDateKey(queryDate) && availableDates.has(queryDate) ? queryDate : defaultDeliveryDate;

  if (!supabaseAdmin) {
    const records = products
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

    return Response.json({
      deliveryDate,
      defaultDeliveryDate,
      dateOptions,
      rangeDates: getInventoryDateRange(2),
      records
    });
  }

  try {
    const records = await getInventoryByDate(supabaseAdmin, deliveryDate);
    return Response.json({
      deliveryDate,
      defaultDeliveryDate,
      dateOptions,
      rangeDates: getInventoryDateRange(2),
      records
    });
  } catch (error) {
    console.error("读取库存失败", error);
    return new Response(JSON.stringify({ error: "读取库存失败，请先执行 supabase/inventory-v1.sql" }), {
      status: 500
    });
  }
}
