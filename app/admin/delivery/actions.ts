"use server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getChinaNow, toDateKey } from "@/lib/delivery";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "node:crypto";

const MAX_STOPS = 20;
const HEATING_MINUTES = 15;
const TRACKING_LIFETIME_MS = 8 * 60 * 60 * 1000;
const TRACKING_ERROR = "无法读取或更新车辆定位，请检查数据库配置。";

function isToday(date: string) {
  return date === toDateKey(getChinaNow());
}

function validLocation(longitude: number, latitude: number) {
  return Number.isFinite(longitude) && Number.isFinite(latitude) &&
    Math.abs(longitude) <= 180 && Math.abs(latitude) <= 90;
}

export async function startDeliveryTracking(date: string, longitude: number, latitude: number) {
  if (!await isAdminAuthenticated()) return { error: "请重新登录后台。" };
  if (!isToday(date) || !validLocation(longitude, latitude)) return { error: "只能为今天开启定位，请检查手机位置。" };
  if (!supabaseAdmin) return { error: TRACKING_ERROR };
  const now = new Date();
  const tripId = randomUUID();
  const { error: cleanupError } = await supabaseAdmin.from("delivery_tracking")
    .delete().lt("expires_at", now.toISOString());
  if (cleanupError) return { error: TRACKING_ERROR };
  const { error } = await supabaseAdmin.from("delivery_tracking").insert({
    delivery_date: date, trip_id: tripId,
    started_at: now.toISOString(), updated_at: now.toISOString(),
    expires_at: new Date(now.getTime() + TRACKING_LIFETIME_MS).toISOString(),
    longitude, latitude
  });
  if (error) return { error: error.code === "23505" ? "已有配送正在共享位置，请先结束原配送。" : TRACKING_ERROR };
  return { tripId, startedAt: now.toISOString() };
}

export async function updateDeliveryTracking(date: string, tripId: string, longitude: number, latitude: number) {
  if (!await isAdminAuthenticated()) return { error: "请重新登录后台。" };
  if (!isToday(date) || !validLocation(longitude, latitude)) return { error: "定位已过期或坐标无效。", ended: true };
  if (!supabaseAdmin) return { error: TRACKING_ERROR };
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin.from("delivery_tracking")
    .update({ longitude, latitude, updated_at: now })
    .eq("delivery_date", date).eq("trip_id", tripId).gt("expires_at", now)
    .select("trip_id").maybeSingle();
  if (error) return { error: TRACKING_ERROR };
  if (!data) return { error: "配送定位已结束。", ended: true };
  return { ok: true };
}

export async function stopDeliveryTracking(date: string, tripId: string) {
  if (!await isAdminAuthenticated()) return { error: "请重新登录后台。" };
  if (!supabaseAdmin) return { error: TRACKING_ERROR };
  const { error } = await supabaseAdmin.from("delivery_tracking")
    .delete().eq("delivery_date", date).eq("trip_id", tripId);
  return error ? { error: TRACKING_ERROR } : { ok: true };
}

export async function readDeliveryTracking(date: string, lastMapUpdate?: string) {
  if (!await isAdminAuthenticated()) return { error: "请重新登录后台。" };
  if (!isToday(date)) return { tracking: null };
  if (!supabaseAdmin) return { error: TRACKING_ERROR };
  const { data, error } = await supabaseAdmin.from("delivery_tracking")
    .select("trip_id, started_at, updated_at, longitude, latitude")
    .eq("delivery_date", date).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (error) return { error: TRACKING_ERROR };
  if (!data) return { tracking: null };
  const tracking = { tripId: String(data.trip_id), startedAt: String(data.started_at), updatedAt: String(data.updated_at) };
  let mapImage: string | undefined;
  if (tracking.updatedAt !== lastMapUpdate && process.env.AMAP_WEB_SERVICE_KEY?.trim()) {
    try {
      const coordinates = `${Number(data.longitude).toFixed(6)},${Number(data.latitude).toFixed(6)}`;
      const conversion = await amap("/v3/assistant/coordinate/convert", { locations: coordinates, coordsys: "gps" });
      const location = normalizePoint((await conversion.json()).locations ?? "");
      if (location) mapImage = await readStaticMap({ location, zoom: "15", markers: `mid,0x28705A,V:${location}` });
    } catch {
      // The last update time is still useful when the map service is unavailable.
    }
  }
  return { tracking, mapImage, serverNow: Date.now() };
}

function normalizePoint(value: string) {
  if (typeof value !== "string" || !/^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/.test(value.trim())) return null;
  const [lng, lat] = value.split(",").map(Number);
  return Math.abs(lng) <= 180 && Math.abs(lat) <= 90
    ? `${lng.toFixed(6)},${lat.toFixed(6)}`
    : null;
}

async function amap(path: string, params: Record<string, string>) {
  const key = process.env.AMAP_WEB_SERVICE_KEY?.trim();
  if (!key) throw new Error("请先配置高德 Web 服务 Key。");
  const url = new URL(path, "https://restapi.amap.com");
  url.search = new URLSearchParams({ ...params, key }).toString();
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("地图服务暂时不可用。");
  return response;
}

async function readStaticMap(params: Record<string, string>) {
  const map = await amap("/v3/staticmap", { ...params, size: "800*480" });
  const contentType = map.headers.get("content-type")?.split(";")[0];
  if (contentType === "image/png" || contentType === "image/jpeg") {
    return `data:${contentType};base64,${Buffer.from(await map.arrayBuffer()).toString("base64")}`;
  }
}

async function inBatches<T, R>(items: T[], task: (item: T) => Promise<R>) {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += 4) {
    results.push(...await Promise.all(items.slice(i, i + 4).map(task)));
  }
  return results;
}

export async function locateDeliveryAddresses(addresses: string[]) {
  if (!await isAdminAuthenticated()) return { error: "请重新登录后台。" };
  if (!process.env.AMAP_WEB_SERVICE_KEY?.trim()) return { error: "请先配置高德 Web 服务 Key。" };
  if (!Array.isArray(addresses) || addresses.length < 1 || addresses.length > MAX_STOPS ||
      addresses.some((address) => typeof address !== "string" || address.trim().length < 2 || address.length > 250)) {
    return { error: "每次可定位 1–20 个地址，每个地址需为 2–250 字。" };
  }

  const matches = await inBatches(addresses, async (address) => {
    try {
      const response = await amap("/v3/geocode/geo", { address: address.trim(), city: "410100" });
      const data = await response.json();
      if (data.status !== "1") return { issue: "地图服务未能完成查询，请重试。" };
      const result = data.geocodes?.length === 1 ? data.geocodes[0] : null;
      const point = normalizePoint(result?.location ?? "");
      if (!point || result.city !== "郑州市") return { issue: "未找到唯一的郑州市地址，请手动核对。" };
      const precise = /门牌号|兴趣点|住宅区|楼栋|大厦/.test(result.level ?? "");
      return { point, label: String(result.formatted_address ?? ""), review: !precise };
    } catch {
      return { issue: "地图请求失败，请重试。" };
    }
  });
  return { matches };
}

async function getDrivingLeg(origin: string, destination: string) {
  if (origin === destination) return { driveMinutes: 0, distanceMeters: 0 };
  const response = await amap("/v5/direction/driving", { origin, destination, show_fields: "cost" });
  const data = await response.json();
  const path = data.route?.paths?.[0];
  const seconds = Number(path?.cost?.duration);
  const distanceMeters = Number(path?.distance);
  if (data.status !== "1" || !Number.isFinite(seconds) || seconds <= 0 ||
      !Number.isFinite(distanceMeters) || distanceMeters < 0) {
    throw new Error("No driving route");
  }
  return { driveMinutes: Math.ceil(seconds / 60), distanceMeters };
}

export async function planDeliveryRoute(start: string, departure: string, stops: string[]) {
  if (!await isAdminAuthenticated()) return { error: "请重新登录后台。" };
  if (!process.env.AMAP_WEB_SERVICE_KEY?.trim()) return { error: "请先配置高德 Web 服务 Key。" };
  const origin = normalizePoint(start);
  if (!origin || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(departure) ||
      !Array.isArray(stops) || stops.length < 1 || stops.length > MAX_STOPS) {
    return { error: "请填写出发坐标、时间，并选择 1–20 个配送站点。" };
  }
  const points = stops.map(normalizePoint);
  if (points.some((point) => point === null)) return { error: "请先核对所有站点的坐标。" };
  const destinations = points as string[];

  try {
    const legs = await inBatches(destinations.map((destination, index) => ({
      from: index === 0 ? origin : destinations[index - 1],
      to: destination
    })), ({ from, to }) => getDrivingLeg(from, to));
    const [hour, minute] = departure.split(":").map(Number);
    let clock = hour * 60 + minute;
    const schedule = legs.map((leg) => {
      const arrival = clock + leg.driveMinutes;
      clock = arrival + HEATING_MINUTES;
      return { ...leg, arrival, handoff: clock };
    });

    let mapImage: string | undefined;
    try {
      const markers = [`mid,0x333333,0:${origin}`, ...destinations.map((point, index) =>
        `mid,0x28705A,${(index + 1).toString(36).toUpperCase()}:${point}`
      )].join("|");
      mapImage = await readStaticMap({ markers });
    } catch {
      // Keep the calculated schedule if the map image cannot be loaded.
    }
    return { schedule, mapImage };
  } catch {
    return { error: "未能取得完整驾车路线，请检查坐标后重试。" };
  }
}
