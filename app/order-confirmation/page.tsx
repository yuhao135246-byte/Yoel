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
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Payment</p>
        <h1 className="mt-6 text-4xl leading-tight md:text-6xl">Order Created Successfully</h1>

        <div className="mt-10 grid gap-4 rounded border border-ink/15 bg-white p-5 md:p-6">
          <div className="flex items-center justify-between text-sm text-graphite">
            <span>Order Number</span>
            <span className="font-mono text-ink">{params.orderNumber ?? "-"}</span>
          </div>
          <div className="border-y border-ink/10 py-5">
            <p className="text-xs uppercase tracking-[0.16em] text-graphite">Amount Due</p>
            <p className="mt-2 font-mono text-4xl leading-none text-ink md:text-5xl">RMB {amountDue}</p>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-graphite">Delivery Date</span>
              <span className="font-mono">{deliveryDate ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-graphite">Delivery Area</span>
              <span className="font-mono">{deliveryArea ?? "-"}</span>
            </div>
            {deliverySlot ? (
              <div className="flex items-center justify-between">
                <span className="text-graphite">Delivery Slot</span>
                <span className="font-mono">{deliverySlot}</span>
              </div>
            ) : null}
          </div>

          <PaymentActions orderNumber={params.orderNumber} />
        </div>

        {hasPricing ? (
          <p className="mt-4 text-sm text-graphite">Subtotal: RMB {subtotal} · Delivery Fee: RMB {deliveryFee}</p>
        ) : null}

        <Link href="/coffee" className="mt-10 inline-flex border border-ink px-5 py-4 text-sm uppercase tracking-[0.18em]">
          Back To Menu
        </Link>
      </section>
    </main>
  );
}
