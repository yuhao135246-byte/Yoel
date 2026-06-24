import Image from "next/image";
import Link from "next/link";

export default async function OrderConfirmationPage({
  searchParams
}: {
  searchParams: Promise<{
    orderNumber?: string;
    deliveryArea?: string;
    deliverySlot?: string;
    subtotal?: string;
    deliveryFee?: string;
    total?: string;
  }>;
}) {
  const params = await searchParams;
  const deliveryArea = params.deliveryArea;
  const deliverySlot = params.deliverySlot;
  const subtotal = Number(params.subtotal ?? "0");
  const deliveryFee = Number(params.deliveryFee ?? "0");
  const total = Number(params.total ?? "0");
  const hasPricing = Number.isFinite(total) && total > 0;

  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">付款方式</p>
        <h1 className="mt-6 max-w-4xl text-6xl leading-none md:text-8xl">订单已提交</h1>
        <p className="mt-8 font-mono text-xl">{params.orderNumber ?? "CADENCE 订单"}</p>
        <p className="mt-4 max-w-xl text-sm leading-7 text-graphite">
          订单已提交，请扫码完成支付。页面展示微信支付二维码和支付宝支付二维码。
          支付状态将在确认后更新。
        </p>
        {hasPricing ? (
          <div className="mt-6 grid max-w-md gap-3 rounded border border-ink/15 p-4 text-sm">
            {deliveryArea ? (
              <div className="flex items-center justify-between">
                <span>配送区域</span>
                <span className="font-mono">{deliveryArea}</span>
              </div>
            ) : null}
            {deliverySlot ? (
              <div className="flex items-center justify-between">
                <span>预计配送时间</span>
                <span className="font-mono">{deliverySlot}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span>商品金额</span>
              <span className="font-mono">RMB {subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>配送费</span>
              <span className="font-mono">RMB {deliveryFee}</span>
            </div>
            <div className="flex items-center justify-between text-base">
              <span>订单总额</span>
              <span className="font-mono">RMB {total}</span>
            </div>
          </div>
        ) : null}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded border border-ink/15 p-4 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">微信支付</p>
            <Image
              src="/assets/wechat-pay.jpg"
              alt="WeChat payment QR code"
              width={260}
              height={260}
              className="mx-auto mt-4 h-auto w-full max-w-[260px]"
            />
          </div>
          <div className="rounded border border-ink/15 p-4 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">支付宝支付</p>
            <Image
              src="/assets/alipay-pay.jpg"
              alt="Alipay payment QR code"
              width={260}
              height={260}
              className="mx-auto mt-4 h-auto w-full max-w-[260px]"
            />
          </div>
        </div>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-graphite">支付状态：待确认</p>
        <Link href="/coffee" className="mt-10 inline-flex border border-ink px-5 py-4 text-sm uppercase tracking-[0.18em]">
          返回本周菜单
        </Link>
      </section>
    </main>
  );
}
