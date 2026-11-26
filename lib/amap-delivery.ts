export function normalizePoint(value: string) {
  if (typeof value !== "string" || !/^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/.test(value.trim())) return null;
  const [lng, lat] = value.split(",").map(Number);
  return Math.abs(lng) <= 180 && Math.abs(lat) <= 90
    ? `${lng.toFixed(6)},${lat.toFixed(6)}`
    : null;
}

export async function amap(path: string, params: Record<string, string>) {
  const key = process.env.AMAP_WEB_SERVICE_KEY?.trim();
  if (!key) throw new Error("请先配置高德 Web 服务 Key。");
  const url = new URL(path, "https://restapi.amap.com");
  url.search = new URLSearchParams({ ...params, key }).toString();
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("地图服务暂时不可用。");
  return response;
}

export async function readStaticMap(params: Record<string, string>) {
  const map = await amap("/v3/staticmap", { size: "800*480", ...params });
  const contentType = map.headers.get("content-type")?.split(";")[0];
  if (contentType === "image/png" || contentType === "image/jpeg") {
    return `data:${contentType};base64,${Buffer.from(await map.arrayBuffer()).toString("base64")}`;
  }
}

export async function getDrivingLeg(origin: string, destination: string) {
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
