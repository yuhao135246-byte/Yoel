import { requireAdminAuth } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeJsonArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry) => typeof entry === "string" || typeof entry === "number");
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : String(entry ?? "").trim()))
    .filter((entry) => entry.length > 0);
}

function isValidCategory(value: unknown) {
  return value === "COFFEE" || value === "OBJECT" || value === "RESEARCH";
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdminAuth();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  }

  try {
    const { slug } = await params;
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return Response.json({ error: "商品不存在" }, { status: 404 });
    }

    return Response.json({ product: data });
  } catch (error) {
    console.error("[admin/products/[slug] GET] failed", error);
    return Response.json({ error: "读取商品失败" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdminAuth();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  }

  try {
    const { slug } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    if (typeof body.slug === "string" && body.slug.trim() && body.slug.trim() !== slug) {
      return Response.json({ error: "slug 是不可变字段，不能修改" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (typeof body.name !== "undefined" && !name) {
      return Response.json({ error: "名称不能为空" }, { status: 400 });
    }

    if (typeof body.price !== "undefined") {
      const parsedPrice = Number(body.price);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return Response.json({ error: "价格必须是大于等于 0 的有效数字" }, { status: 400 });
      }
    }

    if (typeof body.category !== "undefined" && !isValidCategory(body.category)) {
      return Response.json({ error: "category 不合法" }, { status: 400 });
    }

    if (typeof body.slug === "string" && !body.slug.trim()) {
      return Response.json({ error: "slug 不能为空" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if (typeof body.name === "string") patch.name = name;
    if (typeof body.price !== "undefined") patch.price = Number(body.price);
    if (typeof body.image === "string") patch.image = body.image.trim() || null;
    if (typeof body.description === "string") patch.description = body.description.trim();
    if (typeof body.layer === "string") patch.layer = body.layer;
    if (typeof body.subtitle === "string") patch.subtitle = body.subtitle;
    if (typeof body.category === "string") patch.category = body.category;
    if (typeof body.currency === "string") patch.currency = body.currency;
    if (typeof body.unit === "string") patch.unit = body.unit;
    if (typeof body.availability === "string") patch.availability = body.availability;
    if (typeof body.sort_order !== "undefined") patch.sort_order = Number(body.sort_order ?? 0);
    if (typeof body.is_active !== "undefined") patch.is_active = body.is_active === true;
    if (typeof body.is_available !== "undefined") patch.is_available = body.is_available === true;
    if (typeof body.initial_stock !== "undefined") patch.initial_stock = Number(body.initial_stock ?? 0);
    if (typeof body.origin === "string") patch.origin = body.origin || null;
    if (typeof body.farm === "string") patch.farm = body.farm || null;
    if (typeof body.variety === "string") patch.variety = body.variety || null;
    if (typeof body.process === "string") patch.process = body.process || null;
    if (typeof body.altitude === "string") patch.altitude = body.altitude || null;
    if (typeof body.tasting_notes === "string") patch.tasting_notes = body.tasting_notes || null;
    if (typeof body.details !== "undefined") patch.details = normalizeStringArray(body.details);
    if (typeof body.tags !== "undefined") patch.tags = normalizeStringArray(body.tags);
    if (typeof body.inventory_items !== "undefined") patch.inventory_items = Array.isArray(body.inventory_items) ? body.inventory_items : [];
    if (typeof body.option_groups !== "undefined") {
      if (!Array.isArray(body.option_groups)) {
        return Response.json({ error: "option_groups 必须是 JSON 数组" }, { status: 400 });
      }
      patch.option_groups = body.option_groups;
    }

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "没有需要更新的字段" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(patch)
      .eq("slug", slug)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ product: data });
  } catch (error) {
    console.error("[admin/products/[slug] PATCH] failed", error);
    return Response.json({ error: "更新商品失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdminAuth();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  }

  try {
    const { slug } = await params;
    const payload = (await request.json().catch(() => ({}))) as { is_active?: boolean; confirm?: boolean };
    const isActive = payload.is_active === true;
    const confirmed = payload.confirm === true;

    if (!confirmed) {
      return Response.json({ error: "未确认下架操作" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("slug", slug)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ product: data, action: isActive ? "restored" : "unpublished" });
  } catch (error) {
    console.error("[admin/products/[slug] DELETE] failed", error);
    return Response.json({ error: "更新商品状态失败" }, { status: 500 });
  }
}
