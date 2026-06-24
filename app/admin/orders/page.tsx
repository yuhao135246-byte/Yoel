import { orders as sampleOrders } from "@/lib/data";
import { runtimeOrders } from "@/lib/order-store";
import { prisma } from "@/lib/prisma";

type AdminOrder = {
  number: string;
  customer: string;
  item: string;
  total: number;
  status: string;
  delivery: string;
  paymentStatus: string;
};

async function getOrders() {
  if (!process.env.DATABASE_URL) {
    return [
      ...runtimeOrders,
      ...sampleOrders.map((order) => ({ ...order, paymentStatus: "Pending" }))
    ] satisfies AdminOrder[];
  }

  try {
    const dbOrders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return dbOrders.map((order) => ({
      number: order.orderNumber,
      customer: order.customer.name,
      item: order.items.map((item) => item.product.name).join(", ") || "CADENCE order",
      total: Number(order.total),
      status: order.status,
      delivery: order.deliverySlot ?? "Made to order",
      paymentStatus: order.paymentStatus === "PAID" ? "Paid" : "Pending"
    })) satisfies AdminOrder[];
  } catch {
    return [
      ...runtimeOrders,
      ...sampleOrders.map((order) => ({ ...order, paymentStatus: "Pending" }))
    ] satisfies AdminOrder[];
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin / Orders</p>
        <h1 className="mt-6 text-5xl leading-none md:text-7xl">Orders</h1>
        <div className="mt-10 overflow-hidden border border-ink/15">
          <div className="grid grid-cols-[1.2fr_1fr_1.2fr_0.7fr_0.8fr_0.9fr] border-b border-ink/15 bg-bone px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
            <span>Order</span>
            <span>Customer</span>
            <span>Item</span>
            <span>Total</span>
            <span>Status</span>
            <span>Payment</span>
          </div>
          {orders.map((order) => (
            <div
              key={order.number}
              className="grid grid-cols-[1.2fr_1fr_1.2fr_0.7fr_0.8fr_0.9fr] border-b border-ink/10 px-4 py-4 text-sm last:border-b-0"
            >
              <span className="font-mono">{order.number}</span>
              <span>{order.customer}</span>
              <span>{order.item}</span>
              <span>RMB {order.total}</span>
              <span>{order.status}</span>
              <span>{order.paymentStatus}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
