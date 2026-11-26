"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { locateDeliveryAddresses, planDeliveryRoute } from "./actions";

export type DeliveryOrder = { id: string; number: string; address: string; area: string };
type Stop = DeliveryOrder & { point: string; issue?: string; label?: string; review?: boolean };
type Plan = Awaited<ReturnType<typeof planDeliveryRoute>>;

function clockLabel(minutes: number) {
  const time = minutes % 1440;
  return `${minutes >= 1440 ? "次日 " : ""}${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;
}

const field = "min-h-11 w-full min-w-0 border border-ink/20 bg-paper px-3 text-base";
const button = "min-h-11 border border-ink/20 px-3 py-1 text-sm disabled:opacity-40";

export function DeliveryPlanner({ orders, mapConfigured }: { orders: DeliveryOrder[]; mapConfigured: boolean }) {
  const [stops, setStops] = useState<Stop[]>(orders.map((order) => ({ ...order, point: "" })));
  const [startAddress, setStartAddress] = useState("");
  const [origin, setOrigin] = useState("");
  const [originReview, setOriginReview] = useState(false);
  const [departure, setDeparture] = useState("07:00");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [busy, run] = useTransition();

  function editStop(id: string, patch: Partial<Stop>) {
    setStops((current) => current.map((stop) => stop.id === id ? { ...stop, ...patch } : stop));
    setPlan(null);
  }

  function move(index: number, change: number) {
    setStops((current) => {
      const next = [...current];
      [next[index], next[index + change]] = [next[index + change], next[index]];
      return next;
    });
    setPlan(null);
  }

  function locate() {
    const pendingStops = stops.filter((stop) => !stop.point && stop.address.trim().length >= 2).slice(0, 20);
    const includeStart = !origin && startAddress.trim().length >= 2;
    const batch = pendingStops.slice(0, includeStart ? 19 : 20);
    const addresses = [...(includeStart ? [startAddress] : []), ...batch.map((stop) => stop.address)];
    setError("");
    if (addresses.length === 0) {
      setError("请先填写出发地址，或清空需要重新定位的坐标。");
      return;
    }
    run(async () => {
      try {
        const result = await locateDeliveryAddresses(addresses);
        if (!result.matches) {
          setError(result.error);
          return;
        }
        if (includeStart) {
          const match = result.matches[0];
          setOrigin(match.point ?? "");
          setOriginReview(Boolean(match.review));
          if (match.issue) setError(`出发地址：${match.issue}`);
        }
        const updates = new Map(batch.map((stop, index) => [stop.id, result.matches[index + Number(includeStart)]]));
        setStops((current) => current.map((stop) => {
          const match = updates.get(stop.id);
          return match ? { ...stop, point: match.point ?? "", issue: match.issue, label: match.label, review: match.review } : stop;
        }));
        setPlan(null);
      } catch {
        setError("地址定位失败，请重试。");
      }
    });
  }

  function calculate() {
    setError("");
    setPlan(null);
    run(async () => {
      try {
        const result = await planDeliveryRoute(origin, departure, stops.map((stop) => stop.point));
        if (result.error) setError(result.error);
        else setPlan(result);
      } catch {
        setError("路线计算失败，请重试。");
      }
    });
  }

  return (
    <fieldset disabled={busy} className="min-w-0 space-y-5">
      {!mapConfigured ? <p role="status" className="text-sm text-graphite">地图未配置。设置高德 Web 服务 Key 后即可定位和计算车程。</p> : null}
      {stops.length > 20 ? <p role="status">每条路线最多 20 站。请移除本趟不配送的订单。</p> : null}
      <div className="grid gap-3 md:grid-cols-[2fr_2fr_1fr]">
        <label className="grid gap-1 text-sm">出发地址
          <input className={field} value={startAddress} onChange={(event) => {
            setStartAddress(event.target.value); setOrigin(""); setOriginReview(false); setPlan(null);
          }} />
        </label>
        <label className="grid gap-1 text-sm">出发坐标（经度,纬度）
          <input className={field} value={origin} onChange={(event) => {
            setOrigin(event.target.value); setOriginReview(false); setPlan(null);
          }} />
        </label>
        <label className="grid gap-1 text-sm">计划出发时间（北京时间）
          <input className={field} type="time" value={departure} onChange={(event) => {
            setDeparture(event.target.value); setPlan(null);
          }} />
        </label>
      </div>
      {originReview ? <button type="button" className={button} onClick={() => setOriginReview(false)}>确认出发坐标</button> : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={!mapConfigured} onClick={locate}>定位未标注地址</button>
        <button type="button" className={button} disabled={!mapConfigured || !origin || originReview ||
          stops.length === 0 || stops.length > 20 || stops.some((stop) => !stop.point || stop.review)}
          onClick={calculate}>计算路线和交付时间</button>
        <button type="button" className={button} onClick={() => {
          setStops(orders.map((order) => ({ ...order, point: "" }))); setPlan(null); setError("");
        }}>恢复订单列表</button>
        <a className={`${button} inline-flex items-center`} href="https://lbs.amap.com/tools/picker" target="_blank" rel="noreferrer">高德坐标拾取</a>
      </div>
      {busy ? <p role="status">正在请求地图服务…</p> : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      {plan?.mapImage ? (
        // The authenticated server action returns the map without exposing the provider key.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={plan.mapImage} alt="配送站点地图，0 为出发点" width={800} height={480} className="h-auto w-full max-w-[800px]" />
      ) : plan?.schedule ? <p role="status">站点地图暂不可用，交付时间已计算。</p> : null}
      <ol className="divide-y divide-ink/15 border-y border-ink/15">
        {stops.map((stop, index) => {
          const leg = plan?.schedule?.[index];
          const marker = (index + 1).toString(36).toUpperCase();
          return (
            <li key={stop.id} className="grid min-w-0 gap-3 py-4 md:grid-cols-[2fr_1fr_1fr]">
              <div className="min-w-0 space-y-1 break-words">
                <Link href={`/admin/orders/${encodeURIComponent(stop.id)}`} className="text-sm underline">{marker} · {stop.number}</Link>
                <p>{stop.area} {stop.address || "缺少地址"}</p>
                {stop.label ? <p className="text-sm text-graphite">地图匹配：{stop.label}</p> : null}
                {stop.issue ? <p className="text-sm text-red-700">{stop.issue}</p> : null}
                {leg ? <p className="text-sm">车程 {leg.driveMinutes} 分钟 / {(leg.distanceMeters / 1000).toFixed(1)} km · 抵达 {clockLabel(leg.arrival)} · 加热后交付 {clockLabel(leg.handoff)}</p> : null}
              </div>
              <div className="space-y-1">
                <label className="grid gap-1 text-sm">站点坐标（经度,纬度）
                  <input className={field} value={stop.point} onChange={(event) => editStop(stop.id, {
                    point: event.target.value, review: false, issue: undefined, label: undefined
                  })} />
                </label>
                {stop.review ? <button type="button" className={button} onClick={() => editStop(stop.id, { review: false })}>确认匹配坐标</button> : null}
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <button type="button" className={button} disabled={index === 0} onClick={() => move(index, -1)}>上移</button>
                <button type="button" className={button} disabled={index === stops.length - 1} onClick={() => move(index, 1)}>下移</button>
                <button type="button" className={button} onClick={() => {
                  setStops((current) => current.filter((item) => item.id !== stop.id)); setPlan(null);
                }}>移出本趟</button>
              </div>
            </li>
          );
        })}
      </ol>
    </fieldset>
  );
}
