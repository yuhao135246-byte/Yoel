import Link from "next/link";
import { orders as sampleOrders } from "@/lib/data";
import { runtimeOrders } from "@/lib/order-store";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type AdminOrder = {
  id: string;
  number: string;
  deliveryDate?: string;
  customer: string;
  phone: string;
  address: string;
  product: string;
  quantity: number;
  amount: number;
  status: string;
  createdAt: string;
  notes?: string;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  AWAITING_PAYMENT_CONFIRMATION: "待付款确认",
  RESERVED: "待发货",
  PAID: "已付款",
  FULFILLED: "已发货",
  CANCELLED: "已完成"
};

async function getOrders() {
  if (!supabaseAdmin) {
    return [
      ...runtimeOrders.map((order) => ({
        id: order.number,
        number: order.number,
        deliveryDate: undefined,
        customer: order.customer,
        phone: order.phone,
        address: order.address,
        product: order.item,
        quantity: 1,
        amount: order.total,
        status: order.status,
        createdAt: new Date().toISOString(),
        notes: order.notes
      })),
      ...sampleOrders.map((order, index) => ({
        id: `sample-${index}`,
        number: order.number,
        deliveryDate: undefined,
        customer: order.customer,
        phone: "未知",
        address: order.delivery,
        product: order.item,
        quantity: 1,
        amount: order.total,
        status: order.status,
        createdAt: new Date().toISOString(),
        notes: ""
      }))
    ] satisfies AdminOrder[];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, delivery_date, customer_name, phone, address, product_name, quantity, amount, status, created_at, notes")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((order) => ({
        id: order.id,
        number: order.order_number,
        deliveryDate: order.delivery_date ?? undefined,
        customer: order.customer_name,
        phone: order.phone,
        address: order.address,
        product: order.product_name,
        quantity: order.quantity,
        amount: Number(order.amount),
        status: STATUS_LABELS[order.status] ?? order.status,
        createdAt: order.created_at ? new Date(order.created_at).toISOString() : new Date().toISOString(),
        notes: order.notes ?? ""
      })) satisfies AdminOrder[];
    }

    const legacyMessage = error?.message?.toLowerCase() ?? "";
    if (!legacyMessage.includes("delivery_date")) {
      throw error ?? new Error("读取订单失败");
    }

    const legacyResult = await supabaseAdmin
      .from("orders")
      .select("id, order_number, customer_name, phone, address, product_name, quantity, amount, status, created_at, notes")
      .order("created_at", { ascending: false });

    if (legacyResult.error || !legacyResult.data) {
      throw legacyResult.error ?? new Error("读取订单失败");
    }

    return legacyResult.data.map((order) => ({
      id: order.id,
      number: order.order_number,
      deliveryDate: undefined,
      customer: order.customer_name,
      phone: order.phone,
      address: order.address,
      product: order.product_name,
      quantity: order.quantity,
      amount: Number(order.amount),
      status: STATUS_LABELS[order.status] ?? order.status,
      createdAt: order.created_at ? new Date(order.created_at).toISOString() : new Date().toISOString(),
      notes: order.notes ?? ""
    })) satisfies AdminOrder[];
  } catch {
    return [
      ...runtimeOrders.map((order) => ({
        id: order.number,
        number: order.number,
        deliveryDate: undefined,
        customer: order.customer,
        phone: order.phone,
        address: order.address,
        product: order.item,
        quantity: 1,
        amount: order.total,
        status: order.status,
        createdAt: new Date().toISOString(),
        notes: order.notes
      })),
      ...sampleOrders.map((order, index) => ({
        id: `sample-${index}`,
        number: order.number,
        deliveryDate: undefined,
        customer: order.customer,
        phone: "未知",
        address: order.delivery,
        product: order.item,
        quantity: 1,
        amount: order.total,
        status: order.status,
        createdAt: new Date().toISOString(),
        notes: ""
      }))
    ] satisfies AdminOrder[];
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <main
      className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", "Microsoft YaHei", sans-serif' }}
    >
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin / Orders</p>
        <h1 className="mt-6 text-5xl leading-none md:text-7xl">订单管理</h1>
        <div className="mt-10 overflow-x-auto border border-ink/15">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[170px_120px_110px_140px_180px_minmax(320px,1fr)_72px_96px_96px] border-b border-ink/15 bg-bone px-4 py-3 text-[12px] font-medium tracking-[0.08em] text-graphite/90">
              <span className="whitespace-nowrap">订单号</span>
              <span className="whitespace-nowrap">配送日期</span>
              <span className="whitespace-nowrap">姓名</span>
              <span className="whitespace-nowrap">电话</span>
              <span>地址</span>
              <span>商品</span>
              <span className="whitespace-nowrap">数量</span>
              <span className="whitespace-nowrap">金额</span>
              <span className="whitespace-nowrap">状态</span>
            </div>
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="grid grid-cols-[170px_120px_110px_140px_180px_minmax(320px,1fr)_72px_96px_96px] border-b border-ink/10 px-4 py-4 text-[13.5px] font-normal leading-[1.6] text-left text-ink hover:bg-bone"
              >
                <span className="font-mono text-[13px] font-medium tracking-[0.02em] whitespace-nowrap">{order.number}</span>
                <span className="whitespace-nowrap">{order.deliveryDate ?? "-"}</span>
                <span className="break-words">{order.customer}</span>
                <span className="whitespace-nowrap">{order.phone}</span>
                <span className="break-words">{order.address}</span>
                <span className="break-words">{order.product}</span>
                <span className="whitespace-nowrap">{order.quantity}</span>
                <span className="whitespace-nowrap">RMB {order.amount}</span>
                <span className="whitespace-nowrap">{order.status}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
