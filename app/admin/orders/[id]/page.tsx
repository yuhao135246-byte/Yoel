import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { products } from "@/lib/data";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待付款",
  AWAITING_PAYMENT_CONFIRMATION: "待付款确认",
  RESERVED: "待发货",
  PAID: "已付款",
  FULFILLED: "已发货",
  CANCELLED: "已完成"
};

function formatDate(value: string | Date) {
  return new Date(value).toLocaleString("zh-CN", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  if (!supabaseAdmin) {
    notFound();
  }

  const { data: richOrder, error: richError } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, customer_name, phone, address, notes, status, product_name, quantity, amount, items, created_at, delivery_date, delivery_area, delivery_slot"
    )
    .eq("id", resolvedParams.id)
    .single();

  let order = richOrder;

  if (richError || !richOrder) {
    const message = richError?.message?.toLowerCase() ?? "";
    if (!message.includes("delivery_date")) {
      notFound();
    }

    const { data: legacyOrder, error: legacyError } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, customer_name, phone, address, notes, status, product_name, quantity, amount, items, created_at")
      .eq("id", resolvedParams.id)
      .single();

    if (legacyError || !legacyOrder) {
      notFound();
    }

    order = {
      ...legacyOrder,
      delivery_date: null,
      delivery_area: null,
      delivery_slot: null
    };
  }

  if (!order) {
    notFound();
  }

  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
      slug: String(item?.slug ?? ""),
        name: String(item?.name ?? ""),
        quantity: Number(item?.quantity ?? 1),
        selectedOptions: Array.isArray(item?.selectedOptions)
          ? item.selectedOptions
              .map((option) => ({
                groupKey: String(option?.groupKey ?? ""),
                groupLabel: String(option?.groupLabel ?? ""),
                label: String(option?.label ?? "")
              }))
              .filter((option) => option.groupKey.length > 0)
          : []
      }))
    : order.product_name
    ? [{ name: order.product_name, quantity: order.quantity, price: Number(order.amount) }]
    : [];

  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin / Orders</p>
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-5xl leading-none md:text-7xl">订单详情</h1>
            <p className="mt-3 text-sm text-graphite">订单号：{order.order_number}</p>
          </div>
          <Link href="/admin/orders" className="inline-flex border border-ink px-5 py-4 text-sm uppercase tracking-[0.18em]">
            返回订单列表
          </Link>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="grid gap-6 rounded border border-ink/15 bg-white p-6 text-sm text-ink">
            <div className="grid gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">客户信息</span>
              <p>姓名：{order.customer_name}</p>
              <p>手机号：{order.phone}</p>
              <p>地址：{order.address}</p>
              <p>备注：{order.notes ?? "无"}</p>
              <p>创建时间：{formatDate(order.created_at)}</p>
              <p>配送日期：{order.delivery_date ?? "未填写"}</p>
              <p>配送区域：{order.delivery_area ?? "未填写"}</p>
              <p>预计配送时间：{order.delivery_slot ?? "未填写"}</p>
              <p>状态：{STATUS_LABELS[order.status] ?? order.status}</p>
            </div>

            <div className="grid gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">商品信息</span>
              <div className="grid gap-3 border-t border-ink/10 pt-4">
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="grid grid-cols-[1fr_0.35fr] gap-3">
                      <div>
                        <span>{item.name}</span>
                        {item.selectedOptions?.map((option) => (
                          <p key={`${item.name}-${index}-${option.groupKey}`} className="mt-1 text-xs text-graphite">
                            {option.groupLabel}：{option.label}
                          </p>
                        ))}
                        {(productBySlug.get(item.slug)?.inventoryItems ?? []).map((included, includedIndex) => {
                          const includedProduct = productBySlug.get(included.slug);
                          if (!includedProduct) {
                            return null;
                          }

                          return (
                            <p key={`${item.name}-${index}-included-${includedIndex}`} className="mt-1 text-xs text-graphite">
                              {includedProduct.name} x {included.quantity * item.quantity}
                            </p>
                          );
                        })}
                      </div>
                      <span className="font-mono text-right">x{item.quantity}</span>
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-[1fr_0.35fr] gap-3">
                    <span>{order.product_name}</span>
                    <span className="font-mono text-right">x{order.quantity}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-ink/15 pt-4 font-mono text-base">
              <p>总金额：RMB {Number(order.amount)}</p>
            </div>
          </div>

          <div className="grid gap-6">
            <OrderStatusForm
              orderId={order.id}
              currentStatus={
                order.status as
                  | "PENDING"
                  | "AWAITING_PAYMENT_CONFIRMATION"
                  | "RESERVED"
                  | "PAID"
                  | "FULFILLED"
                  | "CANCELLED"
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}
