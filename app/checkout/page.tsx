import { CheckoutForm } from "@/components/brand/checkout-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <CheckoutForm />
    </main>
  );
}
