"use client";

import { useState } from "react";
import { PAYMENT_LINKS } from "@/lib/config";

type PaymentActionsProps = {
  orderNumber?: string;
};

const WECHAT_PAYMENT_URL = PAYMENT_LINKS.wechat;
const ALIPAY_PAYMENT_URL = PAYMENT_LINKS.alipay;
const WECHAT_PAYMENT_INSTRUCTION = "#付款:Cadence咖啡生活(ZYCZYC103)/收款/001";

export function PaymentActions({ orderNumber }: PaymentActionsProps) {
  const [hasOpenedPayment, setHasOpenedPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "AWAITING_PAYMENT_CONFIRMATION" | "PAID">("PENDING");
  const [message, setMessage] = useState("");

  function isWeChatBrowser() {
    return /MicroMessenger/i.test(window.navigator.userAgent);
  }

  function openWeChatPayment() {
    const isWechat = isWeChatBrowser();

    if (isWechat) {
      window.location.href = WECHAT_PAYMENT_INSTRUCTION;
      setHasOpenedPayment(true);
      return;
    }

    window.alert("请点击右上角 → 在微信中打开本页面，然后点击微信支付。");
  }

  function openAlipayPayment(url: string) {
    if (!url) {
      setMessage("支付链接未配置，请联系管理员。");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
    setHasOpenedPayment(true);
    setMessage("");
  }

  async function confirmPayment() {
    if (!orderNumber) {
      setMessage("订单编号缺失，请返回重试。");
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
        throw new Error(result.error ?? "提交支付确认失败，请稍后重试。");
      }

      const status = result?.order?.status as string | undefined;
      if (status === "PAID") {
        setPaymentStatus("PAID");
      } else {
        setPaymentStatus("AWAITING_PAYMENT_CONFIRMATION");
      }
      setIsConfirmed(true);
      setMessage("支付确认已提交，客服将尽快完成核对。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交支付确认失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-2 grid gap-4">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-graphite">
        支付状态：
        {paymentStatus === "PAID" ? "已支付" : paymentStatus === "AWAITING_PAYMENT_CONFIRMATION" ? "待确认付款" : "待支付"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={openWeChatPayment}
          className="h-12 border border-ink/20 bg-white px-4 text-sm text-ink"
        >
          微信支付
        </button>
        <button
          type="button"
          onClick={() => openAlipayPayment(ALIPAY_PAYMENT_URL)}
          className="h-12 border border-ink/20 bg-white px-4 text-sm text-ink"
        >
          支付宝支付
        </button>
      </div>

      {hasOpenedPayment ? (
        <p className="text-sm text-graphite">
          请在微信或支付宝中输入与订单一致的付款金额。
        </p>
      ) : null}

      <button
        type="button"
        onClick={confirmPayment}
        disabled={!orderNumber || isSubmitting || isConfirmed}
        className="h-14 bg-ink px-4 text-base text-paper disabled:opacity-40"
      >
        {isSubmitting ? "提交中..." : isConfirmed ? "已提交支付确认" : "我已完成支付"}
      </button>

      {message ? <p className="text-sm text-graphite">{message}</p> : null}
    </div>
  );
}