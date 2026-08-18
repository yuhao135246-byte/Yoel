import { requireAdminAuth } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getSlugPattern() {
  return /^[a-z0-9-]+$/;
}

function normalizeJsonArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry) => typeof entry === "string" || typeof entry === "number");
}

function normalizeInitialStock(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET() {
  try {
    await requireAdminAuth();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return Response.json({ products: data ?? [] });
  } catch (error) {
    console.error("[admin/products GET] failed", error);
    return Response.json({ error: "读取商品失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminAuth();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return Response.json({ error: "Supabase 未配置" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const category = typeof body.category === "string" ? body.category : "COFFEE";
    const price = toNumber(body.price, 0);
    const image = typeof body.image === "string" ? body.image.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const sortOrder = Number(body.sort_order ?? 0);
    const isActive = body.is_active !== false;
    const isAvailable = body.is_available !== false;
    const initialStock = normalizeInitialStock(body.initial_stock);

    if (!name) {
      return Response.json({ error: "商品名称不能为空" }, { status: 400 });
    }

    if (!slug || !getSlugPattern().test(slug)) {
      return Response.json({ error: "slug 必须为 a-z0-9- 形式" }, { status: 400 });
    }

    if (!['COFFEE', 'OBJECT', 'RESEARCH'].includes(category)) {
      return Response.json({ error: "category 不合法" }, { status: 400 });
    }

    if (price < 0) {
      return Response.json({ error: "价格必须大于等于 0" }, { status: 400 });
    }

    if (initialStock < 0) {
      return Response.json({ error: "初始库存必须大于等于 0" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("products")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      return Response.json({ error: "商品 slug 已存在" }, { status: 409 });
    }

    const payload = {
      slug,
      name,
      category,
      layer: typeof body.layer === "string" ? body.layer : null,
      subtitle: typeof body.subtitle === "string" ? body.subtitle : null,
      price,
      currency: typeof body.currency === "string" ? body.currency : "¥",
      unit: typeof body.unit === "string" ? body.unit : null,
      availability: typeof body.availability === "string" ? body.availability : "Available",
      description,
      image: image || null,
      is_active: isActive,
      is_available: isAvailable,
      initial_stock: initialStock,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      origin: typeof body.origin === "string" ? body.origin : null,
      farm: typeof body.farm === "string" ? body.farm : null,
      variety: typeof body.variety === "string" ? body.variety : null,
      process: typeof body.process === "string" ? body.process : null,
      altitude: typeof body.altitude === "string" ? body.altitude : null,
      tasting_notes: typeof body.tasting_notes === "string" ? body.tasting_notes : null,
      details: normalizeJsonArray(body.details),
      tags: normalizeJsonArray(body.tags),
      inventory_items: Array.isArray(body.inventory_items) ? body.inventory_items : [],
      option_groups: Array.isArray(body.option_groups) ? body.option_groups : []
    };

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert([payload])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error("[admin/products POST] failed", error);
    return Response.json({ error: "创建商品失败" }, { status: 500 });
  }
}
