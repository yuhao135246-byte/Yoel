import Image from "next/image";
import Link from "next/link";

export default async function OrderConfirmationPage({
  searchParams
}: {
  searchParams: Promise<{ orderNumber?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Order Confirmation</p>
        <h1 className="mt-6 max-w-4xl text-6xl leading-none md:text-8xl">Order received.</h1>
        <p className="mt-8 font-mono text-xl">{params.orderNumber ?? "CADENCE order"}</p>
        <p className="mt-4 max-w-xl text-sm leading-7 text-graphite">
          Order Submitted. Please scan the QR code below to pay with 微信支付 or 支付宝支付.
          Admin will manually confirm payment status as Pending or Paid.
        </p>
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
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-graphite">Payment Status: Pending</p>
        <Link href="/coffee" className="mt-10 inline-flex border border-ink px-5 py-4 text-sm uppercase tracking-[0.18em]">
          Back to Coffee
        </Link>
      </section>
    </main>
  );
}
