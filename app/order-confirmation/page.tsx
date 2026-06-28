import Link from "next/link";
import { PaymentActions } from "@/components/brand/payment-actions";

export default async function OrderConfirmationPage({
  searchParams
}: {
  searchParams: Promise<{
    orderNumber?: string;
    deliveryDate?: string;
    deliveryArea?: string;
    deliverySlot?: string;
    subtotal?: string;
    deliveryFee?: string;
    total?: string;
  }>;
}) {
  const params = await searchParams;
  const deliveryDate = params.deliveryDate;
  const deliveryArea = params.deliveryArea;
  const deliverySlot = params.deliverySlot;
  const subtotal = Number(params.subtotal ?? "0");
  const deliveryFee = Number(params.deliveryFee ?? "0");
  const total = Number(params.total ?? "0");
  const hasPricing = Number.isFinite(total) && total > 0;
  const amountDue = hasPricing ? total : 0;

  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">付款页面</p>
        <h1 className="mt-6 text-4xl leading-tight md:text-6xl">订单创建成功</h1>

        <div className="mt-10 grid gap-4 rounded border border-ink/15 bg-white p-5 md:p-6">
          <div className="flex items-center justify-between text-sm text-graphite">
            <span>订单编号</span>
            <span className="font-mono text-ink">{params.orderNumber ?? "-"}</span>
          </div>
          <div className="border-y border-ink/10 py-5">
            <p className="text-xs uppercase tracking-[0.16em] text-graphite">应付金额</p>
            <p className="mt-2 font-mono text-4xl leading-none text-ink md:text-5xl">RMB {amountDue}</p>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-graphite">配送日期</span>
              <span className="font-mono">{deliveryDate ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-graphite">配送区域</span>
              <span className="font-mono">{deliveryArea ?? "-"}</span>
            </div>
            {deliverySlot ? (
              <div className="flex items-center justify-between">
                <span className="text-graphite">配送时间段</span>
                <span className="font-mono">{deliverySlot}</span>
              </div>
            ) : null}
          </div>

          <PaymentActions orderNumber={params.orderNumber} />
        </div>

        {hasPricing ? (
          <p className="mt-4 text-sm text-graphite">商品金额：RMB {subtotal} · 配送费：RMB {deliveryFee}</p>
        ) : null}

        <Link href="/coffee" className="mt-10 inline-flex border border-ink px-5 py-4 text-sm uppercase tracking-[0.18em]">
          返回菜单
        </Link>
      </section>
    </main>
  );
}
