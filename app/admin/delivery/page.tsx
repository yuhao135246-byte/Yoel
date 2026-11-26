import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getChinaNow, toDateKey } from "@/lib/delivery";
import { supabaseAdmin } from "@/lib/supabase";
import { DeliveryPlanner, type DeliveryOrder } from "./planner";
import { DeliveryTracking } from "./tracking";

export const dynamic = "force-dynamic";

export default async function DeliveryAdminPage({
  searchParams
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  if (!await isAdminAuthenticated()) redirect("/admin/login?next=delivery");
  const { date } = await searchParams;
  const today = toDateKey(getChinaNow());
  const selectedDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : today;
  const result = supabaseAdmin
    ? await supabaseAdmin.from("orders")
      .select("id, order_number, address, delivery_area")
      .eq("delivery_date", selectedDate)
      .in("status", ["PAID", "RESERVED"])
      .order("created_at")
      .order("id")
    : null;
  const orders: DeliveryOrder[] = (result?.data ?? []).map((row) => ({
    id: String(row.id),
    number: String(row.order_number),
    address: String(row.address ?? ""),
    area: String(row.delivery_area ?? "")
  }));

  return (
    <main className="min-h-screen bg-paper px-5 py-8 text-ink md:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <Link href="/admin" className="text-sm text-graphite underline">返回后台</Link>
        <h1 className="text-3xl md:text-4xl">配送排线</h1>
        <form className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm">
            配送日期（北京时间）
            <input type="date" name="date" required defaultValue={selectedDate} className="min-h-11 border border-ink/20 bg-paper px-3 text-base" />
          </label>
          <button className="min-h-11 border border-ink/20 px-4 text-sm">查看订单</button>
        </form>
        {selectedDate === today ? <DeliveryTracking key={today} date={today} /> : (
          <p className="text-sm text-graphite">仅当天可开启车辆定位。 <Link href="/admin/delivery" className="underline">查看今天</Link></p>
        )}
        {!result || result.error ? (
          <p role="alert">无法读取配送订单，请检查数据库配置或配送日期。</p>
        ) : orders.length === 0 ? (
          <p>当天没有已付款或待发货的订单。</p>
        ) : (
          <DeliveryPlanner key={selectedDate} orders={orders} mapConfigured={Boolean(process.env.AMAP_WEB_SERVICE_KEY?.trim())} />
        )}
      </section>
    </main>
  );
}
