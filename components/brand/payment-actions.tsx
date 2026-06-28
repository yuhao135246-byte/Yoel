"use client";

import { useState } from "react";

type PaymentActionsProps = {
  orderNumber?: string;
};

const WECHAT_PAYMENT_URL = process.env.NEXT_PUBLIC_WECHAT_PAYMENT_URL?.trim() ?? "";
const ALIPAY_PAYMENT_URL = process.env.NEXT_PUBLIC_ALIPAY_PAYMENT_URL?.trim() ?? "";

export function PaymentActions({ orderNumber }: PaymentActionsProps) {
  const [hasOpenedPayment, setHasOpenedPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [message, setMessage] = useState("");

  function openPaymentLink(url: string) {
    if (!url) {
      setMessage("Payment link is not configured.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
    setHasOpenedPayment(true);
    setMessage("");
  }

  async function confirmPayment() {
    if (!orderNumber) {
      setMessage("Order number is missing.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/order/payment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to submit payment confirmation.");
      }

      setIsConfirmed(true);
      setMessage("Payment confirmation submitted. Our team will verify it shortly.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to submit payment confirmation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-2 grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => openPaymentLink(WECHAT_PAYMENT_URL)}
          className="h-12 border border-ink/20 bg-white px-4 text-sm text-ink"
        >
          Continue with WeChat
        </button>
        <button
          type="button"
          onClick={() => openPaymentLink(ALIPAY_PAYMENT_URL)}
          className="h-12 border border-ink/20 bg-white px-4 text-sm text-ink"
        >
          Continue with Alipay
        </button>
      </div>

      {hasOpenedPayment ? (
        <p className="text-sm text-graphite">
          Please enter the exact order amount shown above when making payment.
        </p>
      ) : null}

      <button
        type="button"
        onClick={confirmPayment}
        disabled={!orderNumber || isSubmitting || isConfirmed}
        className="h-14 bg-ink px-4 text-base uppercase tracking-[0.12em] text-paper disabled:opacity-40"
      >
        {isSubmitting ? "Submitting..." : isConfirmed ? "Payment Confirmation Submitted" : "I've Completed Payment"}
      </button>

      {message ? <p className="text-sm text-graphite">{message}</p> : null}
    </div>
  );
}