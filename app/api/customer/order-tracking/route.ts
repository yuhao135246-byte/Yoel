import { cookies } from "next/headers";
import { amap, getDrivingLeg, normalizePoint, readStaticMap } from "@/lib/amap-delivery";
import { CUSTOMER_ORDER_COOKIE, hashCustomerOrderDevice, isCustomerOrderDevice } from "@/lib/customer-order-device";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
const freshnessMs = 60_000;
const enRouteStatuses = ["PAID", "RESERVED", "FULFILLED"];

function reply(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

function mapZoom(origin: string, destination: string) {
  const [lng, lat] = origin.split(",").map(Number);
  const [endLng, endLat] = destination.split(",").map(Number);
  const span = Math.max(Math.abs(lng - endLng), Math.abs(lat - endLat) * 2, 0.001);
  return String(Math.max(9, Math.min(16, Math.floor(Math.log2(320 / span)))));
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const number = query.get("order");
  const device = (await cookies()).get(CUSTOMER_ORDER_COOKIE)?.value;
  if (!number || number.length > 64 || !isCustomerOrderDevice(device)) return reply({}, 404);
  const db = supabaseAdmin;
  if (!db) return reply({}, 503);

  const { data: order, error } = await db.from("orders")
    .select("id, status, delivery_date")
    .eq("order_number", number)
    .eq("customer_device_hash", hashCustomerOrderDevice(device))
    .maybeSingle();
  if (error) return reply({}, 503);
  if (!order) return reply({}, 404);
  if (order.status === "CANCELLED") return reply({ state: "complete" });
  if (!enRouteStatuses.includes(order.status) || !order.delivery_date) return reply({ state: "waiting" });

  const stop = () => db.from("delivery_tracking")
    .select("active_destination, active_since, updated_at, longitude, latitude")
    .eq("delivery_date", order.delivery_date)
    .eq("active_order_id", String(order.id))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  const { data: tracking, error: trackingError } = await stop();
  if (trackingError) return reply({}, 503);
  if (!tracking?.active_since || !tracking.active_destination) return reply({ state: "waiting" });
  if (Date.parse(tracking.updated_at) <= Date.parse(tracking.active_since) ||
      Date.now() - Date.parse(tracking.updated_at) >= freshnessMs) return reply({ state: "stale" });

  const version = `${tracking.active_since}/${tracking.updated_at}`;
  if (query.get("version") === version) return reply({ state: "unchanged" });

  try {
    const gps = normalizePoint(`${tracking.longitude},${tracking.latitude}`);
    const destination = normalizePoint(tracking.active_destination);
    if (!gps || !destination) return reply({ state: "stale" });
    const converted = await amap("/v3/assistant/coordinate/convert", { locations: gps, coordsys: "gps" });
    const origin = normalizePoint((await converted.json()).locations ?? "");
    if (!origin) return reply({ state: "unavailable" });

    const [map, leg] = await Promise.allSettled([
      readStaticMap({ size: "720*440", location: origin, zoom: mapZoom(origin, destination), markers: `mid,0x333333,D:${destination}` }),
      getDrivingLeg(origin, destination)
    ]);
    // A slow map call must not expose a location after dispatch moves to another stop.
    const [current, freshOrder] = await Promise.all([
      stop(),
      db.from("orders").select("status").eq("id", order.id).maybeSingle()
    ]);
    if (current.error || freshOrder.error) return reply({}, 503);
    if (freshOrder.data?.status === "CANCELLED") return reply({ state: "complete" });
    if (current.data?.active_since !== tracking.active_since || !enRouteStatuses.includes(freshOrder.data?.status)) {
      return reply({ state: "waiting" });
    }
    const freshForMs = freshnessMs - (Date.now() - Date.parse(tracking.updated_at));
    if (freshForMs <= 0) return reply({ state: "stale" });
    const image = map.status === "fulfilled" ? map.value : undefined;
    const distance = leg.status === "fulfilled" ? leg.value.distanceMeters : undefined;
    return reply({ state: "live", version: image && typeof distance === "number" ? version : undefined,
      image, distanceMeters: distance, updatedAt: tracking.updated_at, freshForMs });
  } catch {
    return reply({ state: "unavailable" });
  }
}
