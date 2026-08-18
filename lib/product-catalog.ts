import { products as fallbackProducts, type Product } from "@/lib/data";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export type CatalogProduct = Product & {
  is_active?: boolean;
  is_available?: boolean;
  initial_stock?: number;
  sort_order?: number;
  origin?: string | null;
  farm?: string | null;
  variety?: string | null;
  process?: string | null;
  altitude?: string | null;
  tasting_notes?: string | null;
  details?: string[];
  tags?: string[];
  inventory_items?: { slug: string; quantity: number }[];
  option_groups?: unknown[];
};

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry : String(entry ?? "")))
      .filter((entry) => entry.trim().length > 0);
  }

  if (typeof value === "string") {
    return value
      .split("|")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function readInventoryItems(value: unknown): { slug: string; quantity: number }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as Record<string, unknown>;
      const slug = typeof row.slug === "string" ? row.slug : "";
      const quantity = Number(row.quantity ?? 1);
      if (!slug) {
        return null;
      }

      return {
        slug,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1
      };
    })
    .filter((item): item is { slug: string; quantity: number } => Boolean(item));
}

function mapLegacyProducts(): CatalogProduct[] {
  return fallbackProducts.map((product, index) => ({
    ...product,
    is_active: product.available !== false,
    is_available: product.available ?? true,
    initial_stock: 0,
    sort_order: index,
    details: product.details ?? [],
    tags: product.tags ?? [],
    inventory_items: product.inventoryItems ?? [],
    option_groups: product.optionGroups ?? []
  }));
}

function normalizeProductRow(row: Record<string, unknown>): CatalogProduct {
  const details = readStringArray(row.details);
  const tags = readStringArray(row.tags);
  const product = {
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    category: (String(row.category ?? "COFFEE") as Product["category"]) || "COFFEE",
    layer: typeof row.layer === "string" ? row.layer : "",
    subtitle: typeof row.subtitle === "string" ? row.subtitle : undefined,
    score: typeof row.score === "number" ? row.score : undefined,
    price: Number(row.price ?? 0),
    currency: typeof row.currency === "string" ? row.currency : "¥",
    available: row.is_available !== false && row.available !== false,
    unit: typeof row.unit === "string" ? row.unit : "",
    availability: typeof row.availability === "string" ? row.availability : "Available",
    description: typeof row.description === "string" ? row.description : "",
    details,
    image: typeof row.image === "string" ? row.image : "",
    tags,
    inventoryItems: readInventoryItems(row.inventory_items),
    optionGroups: Array.isArray(row.option_groups) ? row.option_groups : [],
    is_active: row.is_active !== false,
    is_available: row.is_available !== false,
    initial_stock: Number(row.initial_stock ?? 0),
    sort_order: Number(row.sort_order ?? 0),
    origin: typeof row.origin === "string" ? row.origin : null,
    farm: typeof row.farm === "string" ? row.farm : null,
    variety: typeof row.variety === "string" ? row.variety : null,
    process: typeof row.process === "string" ? row.process : null,
    altitude: typeof row.altitude === "string" ? row.altitude : null,
    tasting_notes: typeof row.tasting_notes === "string" ? row.tasting_notes : null,
    inventory_items: readInventoryItems(row.inventory_items),
    option_groups: Array.isArray(row.option_groups) ? row.option_groups : []
  } satisfies CatalogProduct;

  return product;
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  const client = supabaseAdmin ?? supabase;
  if (!client) {
    return mapLegacyProducts();
  }

  try {
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) {
      return mapLegacyProducts();
    }

    return rows.map((row) => normalizeProductRow(row as Record<string, unknown>));
  } catch (error) {
    console.warn("[product-catalog] Supabase product query failed, using legacy fallback", error);
    return mapLegacyProducts();
  }
}

export async function getActiveCatalogProducts(): Promise<Product[]> {
  const catalog = await getCatalogProducts();

  return catalog
    .filter((product) => product.is_active !== false)
    .map((product) => ({
      ...product,
      available: product.is_available !== false,
      details: product.details ?? [],
      tags: product.tags ?? [],
      inventoryItems: product.inventoryItems ?? [],
      optionGroups: product.optionGroups ?? []
    }));
}

export async function getCatalogProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const catalog = await getCatalogProducts();
  return catalog.find((product) => product.slug === slug) ?? null;
}

export async function getCatalogProductsForInventory(): Promise<CatalogProduct[]> {
  const catalog = await getCatalogProducts();
  return catalog.filter((product) => product.category === "COFFEE" || product.category === "OBJECT");
}

export async function getProductCatalogCount(): Promise<number> {
  return (await getCatalogProducts()).length;
}

export async function getProductCatalogSeed(): Promise<CatalogProduct[]> {
  return mapLegacyProducts();
}
