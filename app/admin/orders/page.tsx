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
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin / Orders</p>
        <h1 className="mt-6 text-5xl leading-none md:text-7xl">订单管理</h1>
        <div className="mt-10 overflow-hidden border border-ink/15">
          <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_1.3fr_1fr_0.6fr_0.8fr_0.9fr] border-b border-ink/15 bg-bone px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
            <span>订单号</span>
            <span>配送日期</span>
            <span>姓名</span>
            <span>电话</span>
            <span>地址</span>
            <span>商品</span>
            <span>数量</span>
            <span>金额</span>
            <span>状态</span>
          </div>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_1.3fr_1fr_0.6fr_0.8fr_0.9fr] border-b border-ink/10 px-4 py-4 text-sm text-left hover:bg-bone"
            >
              <span className="font-mono">{order.number}</span>
              <span className="font-mono">{order.deliveryDate ?? "-"}</span>
              <span>{order.customer}</span>
              <span>{order.phone}</span>
              <span>{order.address}</span>
              <span>{order.product}</span>
              <span>{order.quantity}</span>
              <span>RMB {order.amount}</span>
              <span>{order.status}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
