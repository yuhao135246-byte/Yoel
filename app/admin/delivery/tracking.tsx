"use client";

import { useEffect, useRef, useState } from "react";
import { readDeliveryTracking, startDeliveryTracking, stopDeliveryTracking, updateDeliveryTracking } from "./actions";

type Tracking = { tripId: string; startedAt: string; updatedAt: string };
const REMOTE_REFRESH_MS = 12_000;
const SEND_INTERVAL_MS = 10_000;
const STALE_MS = 60_000;
const beijingTime = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
});

export function DeliveryTracking({ date }: { date: string }) {
  const watcher = useRef<number | null>(null);
  const heartbeat = useRef<ReturnType<typeof setInterval> | null>(null);
  const ownTrip = useRef<string | null>(null);
  const mapTimestamp = useRef<string | undefined>(undefined);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [map, setMap] = useState<{ image: string; timestamp: string } | null>(null);
  const [now, setNow] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");

  function stopWatching() {
    if (watcher.current !== null) navigator.geolocation.clearWatch(watcher.current);
    if (heartbeat.current !== null) clearInterval(heartbeat.current);
    watcher.current = null;
    heartbeat.current = null;
    ownTrip.current = null;
  }

  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;
    async function refresh() {
      try {
        const result = await readDeliveryTracking(date, mapTimestamp.current);
        if (!active) return;
        setReadError(result.error ?? "");
        if (result.error) return;
        const next = result.tracking ?? null;
        setTracking(next);
        setNow(result.serverNow ?? Date.now());
        if (result.mapImage && next) {
          mapTimestamp.current = next.updatedAt;
          setMap({ image: result.mapImage, timestamp: next.updatedAt });
        } else if (!next) {
          mapTimestamp.current = undefined;
          setMap(null);
        }
      } catch {
        if (active) setReadError("暂时无法刷新车辆位置。");
      } finally {
        if (active) {
          setLoaded(true);
          timeout = setTimeout(refresh, REMOTE_REFRESH_MS);
        }
      }
    }
    void refresh();
    return () => {
      active = false;
      clearTimeout(timeout);
      stopWatching();
    };
  }, [date]);

  function start() {
    setError("");
    if (!window.isSecureContext || !navigator.geolocation) {
      setError("请在手机浏览器中通过 HTTPS 打开后台，再开启定位。");
      return;
    }
    setBusy(true);
    let sending = false;
    let lastSent = 0;
    const handlePosition = async ({ coords }: GeolocationPosition) => {
      if (watcher.current !== id || sending || Date.now() - lastSent < SEND_INTERVAL_MS) return;
      sending = true;
      lastSent = Date.now();
      try {
        const trip = ownTrip.current;
        if (!trip) {
          const result = await startDeliveryTracking(date, coords.longitude, coords.latitude);
          if (watcher.current !== id) {
            if (result.tripId) await stopDeliveryTracking(date, result.tripId);
            return;
          }
          if (!result.tripId) {
            stopWatching();
            setError(result.error);
            return;
          }
          const timestamp = result.startedAt;
          ownTrip.current = result.tripId;
          setTracking({ tripId: result.tripId, startedAt: timestamp, updatedAt: timestamp });
          setNow(Date.parse(timestamp));
        } else {
          const result = await updateDeliveryTracking(date, trip, coords.longitude, coords.latitude);
          if (watcher.current !== id) return;
          if (result.ended) stopWatching();
          setError(result.error ?? "");
        }
      } catch {
        if (watcher.current !== id) return;
        if (!ownTrip.current) stopWatching();
        setError("定位上传失败，请检查网络。");
      } finally {
        sending = false;
        if (watcher.current === id || watcher.current === null) setBusy(false);
      }
    };
    const options = { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 };
    const id = navigator.geolocation.watchPosition(handlePosition, (locationError) => {
      if (watcher.current !== id) return;
      if (!ownTrip.current || locationError.code === 1) stopWatching();
      setBusy(false);
      setError(locationError.code === 1 ? "未能取得定位权限，请检查浏览器设置。" : "暂时取不到当前位置。");
    }, options);
    watcher.current = id;
    heartbeat.current = setInterval(() => {
      if (document.visibilityState === "visible" && ownTrip.current && !sending) {
        navigator.geolocation.getCurrentPosition(handlePosition, undefined, options);
      }
    }, 25_000);
  }

  async function end() {
    if (!tracking) return;
    setBusy(true);
    setError("");
    stopWatching();
    try {
      const result = await stopDeliveryTracking(date, tracking.tripId);
      if (result.error) setError(result.error);
      else {
        setTracking(null);
        setMap(null);
      }
    } catch {
      setError("结束配送失败，请重试。");
    } finally {
      setBusy(false);
    }
  }

  const stale = tracking && now - Date.parse(tracking.updatedAt) >= STALE_MS;
  return (
    <section className="space-y-3 border-y border-ink/15 py-4" aria-label="车辆定位">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">车辆定位</h2>
          <p role="status" className="text-sm text-graphite">
            {tracking ? stale ? "位置暂未更新" : "配送中" : busy ? "正在获取手机定位…" : "未开始配送"}
          </p>
        </div>
        {tracking ? (
          <button type="button" disabled={busy} onClick={() => void end()} className="min-h-11 border border-ink/30 px-4 text-sm disabled:opacity-40">结束配送</button>
        ) : (
          <button type="button" disabled={busy || !loaded || Boolean(readError)} onClick={start} className="min-h-11 bg-ink px-4 text-sm text-paper disabled:opacity-40">开始配送</button>
        )}
      </div>
      {tracking ? (
        <p className="text-sm text-graphite">实际开始 {beijingTime.format(new Date(tracking.startedAt))} · 位置更新 {beijingTime.format(new Date(tracking.updatedAt))}（北京时间）</p>
      ) : null}
      {tracking && map?.timestamp === tracking.updatedAt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={map.image} alt={stale ? "车辆最后记录位置" : "车辆最新位置"} width={800} height={480} className="h-auto w-full max-w-[800px]" />
      ) : tracking ? <p className="text-sm text-graphite">等待车辆地图刷新。</p> : null}
      {error || readError ? <p role="alert" className="text-sm text-red-700">{error || readError}</p> : null}
    </section>
  );
}
