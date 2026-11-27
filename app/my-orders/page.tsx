import Link from "next/link";
import { cookies } from "next/headers";
import { CUSTOMER_ORDER_COOKIE, hashCustomerOrderDevice, isCustomerOrderDevice } from "@/lib/customer-order-device";
import { supabaseAdmin } from "@/lib/supabase";
import { CustomerOrderTracking } from "@/components/brand/customer-order-tracking";

export const dynamic = "force-dynamic";
export const metadata = { title: "我的订单", robots: { index: false, follow: false } };

const statusLabels: Record<string, string> = {
  PENDING: "待付款",
  AWAITING_PAYMENT_CONFIRMATION: "待确认付款",
  RESERVED: "待配送",
  PAID: "已付款",
  FULFILLED: "已发货",
  CANCELLED: "已完成"
};

const currency = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" });
const historyLimit = 50;

export default async function MyOrdersPage() {
  const device = (await cookies()).get(CUSTOMER_ORDER_COOKIE)?.value;
  const hasDevice = isCustomerOrderDevice(device);
  const result = hasDevice && supabaseAdmin
    ? await supabaseAdmin.from("orders")
      .select("order_number, customer_order_date, delivery_date, delivery_slot, status, product_name, amount")
      .eq("customer_device_hash", hashCustomerOrderDevice(device))
      .order("created_at", { ascending: false })
      .order("order_number", { ascending: false })
      .limit(historyLimit + 1)
    : null;
  const orders = result?.data ?? [];

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink md:px-8 md:py-12">
      <section className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl md:text-4xl">我的订单</h1>
        {hasDevice && (!result || result.error) ? (
          <p className="text-sm text-graphite" role="alert">订单暂时无法加载，请稍后刷新。</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-graphite">这台设备的当前浏览器暂无订单记录。</p>
        ) : (
          <ul className="divide-y divide-ink/15 border-y border-ink/15">
            {orders.slice(0, historyLimit).map((order) => {
              const slot = order.delivery_slot;
              return (
                <li key={order.order_number} className="space-y-3 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="break-all font-mono text-sm">{order.order_number}</h2>
                    <p className="text-sm text-graphite">{statusLabels[order.status] ?? "处理中"}</p>
                  </div>
                  <p className="break-words">{order.product_name}</p>
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-sm">
                    <dt className="text-graphite">下单日</dt><dd>{order.customer_order_date ?? "未记录"}</dd>
                    <dt className="text-graphite">配送日</dt><dd>{order.delivery_date ?? "待安排"}{slot ? ` · ${slot}` : ""}</dd>
                    <dt className="text-graphite">订单金额</dt><dd>{currency.format(Number(order.amount))}</dd>
                  </dl>
                  <CustomerOrderTracking orderNumber={order.order_number} completed={order.status === "CANCELLED"} />
                </li>
              );
            })}
          </ul>
        )}
        {orders.length > historyLimit ? <p className="text-sm text-graphite">显示最近 {historyLimit} 笔订单</p> : null}
        <Link href="/coffee" className="inline-flex min-h-11 items-center border border-ink px-4 text-sm">返回菜单</Link>
      </section>
    </main>
  );
}
