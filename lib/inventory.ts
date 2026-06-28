import { products } from "@/lib/data";
import { addDays, getDefaultDeliveryDate, toDateKey } from "@/lib/delivery";
import type { SupabaseClient } from "@supabase/supabase-js";

export type InventoryStatus = "Available" | "Sold Out";

export type InventoryRecord = {
  productId: string;
  deliveryDate: string;
  totalStock: number;
  soldQuantity: number;
  remainingStock: number;
  status: InventoryStatus;
};

export type InventorySummary = {
  productId: string;
  productName: string;
  totalStock: number;
  soldQuantity: number;
  remainingStock: number;
  status: InventoryStatus;
};

export const INVENTORY_DEFAULT_STOCK: Record<string, number> = {
  "stitch-cold-brew": 20,
  "tanat-peach": 15,
  "tanat-ombligon": 15,
  "fruit-lemon-tea": 30
};

function getDefaultStockForProduct(productId: string) {
  return INVENTORY_DEFAULT_STOCK[productId] ?? 10;
}

export function getInventoryDateRange(days = 7, today = new Date()) {
  return Array.from({ length: days }, (_, index) => toDateKey(addDays(today, index)));
}

function normalizeStatus(remainingStock: number): InventoryStatus {
  return remainingStock > 0 ? "Available" : "Sold Out";
}

export async function ensureInventoryForNextDays(supabase: SupabaseClient, days = 7) {
  const coffeeProducts = products.filter((product) => product.category === "COFFEE");
  const dates = getInventoryDateRange(days);
  const rows = dates.flatMap((deliveryDate) =>
    coffeeProducts.map((product) => {
      const totalStock = getDefaultStockForProduct(product.slug);
      return {
        product_id: product.slug,
        delivery_date: deliveryDate,
        total_stock: totalStock,
        sold_quantity: 0,
        remaining_stock: totalStock,
        status: normalizeStatus(totalStock)
      };
    })
  );

  const { error } = await supabase
    .from("inventory")
    .upsert(rows, { onConflict: "product_id,delivery_date", ignoreDuplicates: true });

  if (error) {
    throw error;
  }
}

export async function getInventoryByDate(
  supabase: SupabaseClient,
  deliveryDate: string
): Promise<InventorySummary[]> {
  await ensureInventoryForNextDays(supabase, 7);

  const { data, error } = await supabase
    .from("inventory")
    .select("product_id, delivery_date, total_stock, sold_quantity, remaining_stock, status")
    .eq("delivery_date", deliveryDate);

  if (error) {
    throw error;
  }

  const inventoryMap = new Map(
    (data ?? []).map((row) => [
      row.product_id,
      {
        totalStock: Number(row.total_stock ?? 0),
        soldQuantity: Number(row.sold_quantity ?? 0),
        remainingStock: Number(row.remaining_stock ?? 0),
        status: (row.status as InventoryStatus | null) ?? normalizeStatus(Number(row.remaining_stock ?? 0))
      }
    ])
  );

  return products
    .filter((product) => product.category === "COFFEE")
    .map((product) => {
      const record = inventoryMap.get(product.slug);
      const totalStock = record?.totalStock ?? getDefaultStockForProduct(product.slug);
      const soldQuantity = record?.soldQuantity ?? 0;
      const remainingStock = record?.remainingStock ?? Math.max(totalStock - soldQuantity, 0);
      return {
        productId: product.slug,
        productName: product.name,
        totalStock,
        soldQuantity,
        remainingStock,
        status: record?.status ?? normalizeStatus(remainingStock)
      };
    });
}

export async function updateInventoryTotalStock(params: {
  supabase: SupabaseClient;
  deliveryDate: string;
  productId: string;
  totalStock: number;
}) {
  const { data, error } = await params.supabase.rpc("set_inventory_total_stock", {
    p_product_id: params.productId,
    p_delivery_date: params.deliveryDate,
    p_total_stock: params.totalStock
  });

  if (error) {
    console.error("[inventory] set_inventory_total_stock RPC error:", error.message, JSON.stringify(error));
    throw new Error(error.message || JSON.stringify(error));
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) {
    throw new Error("库存更新失败");
  }

  return {
    productId: row.product_id as string,
    deliveryDate: row.delivery_date as string,
    totalStock: Number(row.total_stock),
    soldQuantity: Number(row.sold_quantity),
    remainingStock: Number(row.remaining_stock),
    status: row.status as InventoryStatus
  } satisfies InventoryRecord;
}

export async function reserveInventoryForOrder(params: {
  supabase: SupabaseClient;
  deliveryDate: string;
  orderId: string;
  items: { slug?: string; name: string; quantity: number }[];
}) {
  const payload = params.items
    .map((item) => ({
      product_id: item.slug,
      quantity: Math.max(1, Number(item.quantity))
    }))
    .filter((item) => typeof item.product_id === "string" && item.product_id.length > 0);

  if (payload.length === 0) {
    throw new Error("订单缺少有效商品，无法扣减库存");
  }

  const { data, error } = await params.supabase.rpc("reserve_inventory_items", {
    p_order_id: params.orderId,
    p_delivery_date: params.deliveryDate,
    p_items: payload
  });

  if (error) {
    // Backward compatibility for older SQL function signatures.
    const fallback = await params.supabase.rpc("reserve_inventory_items", {
      p_delivery_date: params.deliveryDate,
      p_items: payload
    });

    if (fallback.error) {
      throw fallback.error;
    }

    return Array.isArray(fallback.data) ? fallback.data : [];
  }

  return Array.isArray(data) ? data : [];
}

export function getDefaultInventoryDeliveryDate() {
  return getDefaultDeliveryDate();
}
