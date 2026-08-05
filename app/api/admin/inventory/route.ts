import {
  getDefaultInventoryDeliveryDate,
  getInventoryByDate,
  getInventoryByDateReadonly,
  updateInventoryTotalStock
} from "@/lib/inventory";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type UpdateInventoryPayload = {
  productId?: string;
  deliveryDate?: string;
  totalStock?: number;
};

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

function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryDate = url.searchParams.get("deliveryDate") ?? "";
  const deliveryDate = isValidDateKey(queryDate) ? queryDate : getDefaultInventoryDeliveryDate();

  if (!supabaseAdmin && !supabase) {
    return new Response(JSON.stringify({ error: "Supabase 服务未配置" }), { status: 503 });
  }

  try {
    if (supabaseAdmin) {
      const records = await getInventoryByDate(supabaseAdmin, deliveryDate);
      return Response.json({ deliveryDate, records });
    }

    const records = await getInventoryByDateReadonly(supabase!, deliveryDate);
    return Response.json({ deliveryDate, records });
  } catch (error) {
    const message = getErrorText(error);
    console.error("[admin inventory GET] 读取库存失败", message, error);

    if (supabase) {
      try {
        const records = await getInventoryByDateReadonly(supabase, deliveryDate);
        return Response.json({ deliveryDate, records, warning: message || "管理端已回退只读库存" });
      } catch (fallbackError) {
        const fallbackMessage = getErrorText(fallbackError);
        console.error("[admin inventory GET] 只读回退失败", fallbackMessage, fallbackError);
      }
    }

    return new Response(
      JSON.stringify({ error: message || "读取库存失败，请先执行 supabase/inventory-v1.sql" }),
      {
        status: 500
      }
    );
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as UpdateInventoryPayload;
  const productId = body.productId?.trim();
  const deliveryDate = body.deliveryDate?.trim();
  const totalStock = Number(body.totalStock);

  if (!productId || !deliveryDate || !isValidDateKey(deliveryDate) || !Number.isFinite(totalStock) || totalStock < 0) {
    return new Response(JSON.stringify({ error: "参数错误" }), { status: 400 });
  }

  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: "Supabase 服务未配置" }), { status: 503 });
  }

  try {
    const record = await updateInventoryTotalStock({
      supabase: supabaseAdmin,
      productId,
      deliveryDate,
      totalStock
    });

    return Response.json({ record });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as Record<string, unknown>).message)
          : String(error);
    console.error("[inventory PATCH] 更新库存失败:", message, error);
    return new Response(JSON.stringify({ error: message || "更新库存失败" }), {
      status: 500
    });
  }
}
