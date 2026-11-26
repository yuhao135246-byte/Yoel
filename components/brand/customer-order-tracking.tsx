"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Tracking = {
  state: "waiting" | "stale" | "live" | "complete" | "unavailable" | "unchanged";
  version?: string;
  image?: string;
  distanceMeters?: number;
  updatedAt?: string;
  freshForMs?: number;
};

const timestamp = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
});

export function CustomerOrderTracking({ orderNumber, completed }: { orderNumber: string; completed: boolean }) {
  const [open, setOpen] = useState(false);
  const [tracking, setTracking] = useState<Tracking | null>(completed ? { state: "complete" } : null);

  useEffect(() => {
    if (!open || completed) return;
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;
    let expiry: ReturnType<typeof setTimeout>;
    let version: string | undefined;
    const controller = new AbortController();
    async function refresh() {
      try {
        if (document.visibilityState !== "visible") return;
        const query = new URLSearchParams({ order: orderNumber });
        if (version) query.set("version", version);
        const response = await fetch(`/api/customer/order-tracking?${query}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Tracking unavailable");
        const next = await response.json() as Tracking;
        if (!active || next.state === "unchanged") return;
        clearTimeout(expiry);
        version = next.version;
        setTracking(next);
        if (next.state === "live" && next.freshForMs) {
          expiry = setTimeout(() => {
            version = undefined;
            setTracking({ state: "stale" });
          }, next.freshForMs);
        }
        if (next.state === "complete") active = false;
      } catch {
        if (active) {
          clearTimeout(expiry);
          version = undefined;
          setTracking({ state: "unavailable" });
        }
      } finally {
        if (active) timeout = setTimeout(refresh, 15_000);
      }
    }
    void refresh();
    return () => {
      active = false;
      clearTimeout(timeout);
      clearTimeout(expiry);
      controller.abort();
    };
  }, [completed, open, orderNumber]);

  const state = tracking?.state;
  const distance = tracking?.distanceMeters;
  return (
    <details className="border-t border-ink/10 pt-2" onToggle={(event) => {
      const nextOpen = event.currentTarget.open;
      setOpen(nextOpen);
      if (!nextOpen && state !== "complete") setTracking(null);
    }}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm underline">
        <span>配送追踪</span>
        <Image src="/assets/cadence-yellow-van.svg" width={36} height={29} alt="" />
      </summary>
      <div className="space-y-2 py-2">
        <p className="text-sm text-graphite" role="status">
          {state === "complete" ? "订单已送达" : state === "live" ? "正在为你配送" :
            state === "stale" ? "等待车辆更新位置" : state === "unavailable" ? "暂时无法获取配送位置" :
              state === "waiting" ? "配送到你这一站时，地图会显示车辆位置。" : "正在读取配送进度…"}
        </p>
        {state === "live" && tracking?.image ? (
          <figure className="relative aspect-[18/11] w-full max-w-[640px] overflow-hidden border border-ink/10 bg-bone">
            {/* The vehicle is the requested center of the server-rendered map. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tracking.image} alt="车辆与配送地点地图" width={720} height={440} className="h-full w-full" />
            <Image src="/assets/cadence-yellow-van.svg" width={46} height={37} alt="CADENCE 小黄车"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full" />
          </figure>
        ) : null}
        {state === "live" && tracking?.updatedAt ? (
          <p className="text-xs text-graphite">
            {typeof distance === "number" ? `剩余车程 ${distance < 1000 ? `${Math.round(distance)} 米` : `${(distance / 1000).toFixed(1)} 公里`}` : "距离暂不可用"}
            {" · "}{timestamp.format(new Date(tracking.updatedAt))} 更新
          </p>
        ) : null}
      </div>
    </details>
  );
}
