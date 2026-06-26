import { products } from "@/lib/data";
import { addDays, toDateKey } from "@/lib/delivery";
import {
  getDefaultInventoryDeliveryDate,
  getInventoryByDate,
  getInventoryDateRange,
  INVENTORY_DEFAULT_STOCK
} from "@/lib/inventory";
import { supabaseAdmin } from "@/lib/supabase";

function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function buildDateOptions() {
  const today = new Date();
  return [0, 1, 2].map((offset) => {
    const date = toDateKey(addDays(today, offset));
    const label = offset === 0 ? "今天" : offset === 1 ? "明天" : "后天";
    return { date, label: `${label}（${date}）` };
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryDate = url.searchParams.get("deliveryDate") ?? "";
  const deliveryDate = isValidDateKey(queryDate) ? queryDate : getDefaultInventoryDeliveryDate();

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
      defaultDeliveryDate: getDefaultInventoryDeliveryDate(),
      dateOptions: buildDateOptions(),
      rangeDates: getInventoryDateRange(7),
      records
    });
  }

  try {
    const records = await getInventoryByDate(supabaseAdmin, deliveryDate);
    return Response.json({
      deliveryDate,
      defaultDeliveryDate: getDefaultInventoryDeliveryDate(),
      dateOptions: buildDateOptions(),
      rangeDates: getInventoryDateRange(7),
      records
    });
  } catch (error) {
    console.error("读取库存失败", error);
    return new Response(JSON.stringify({ error: "读取库存失败，请先执行 supabase/inventory-v1.sql" }), {
      status: 500
    });
  }
}
