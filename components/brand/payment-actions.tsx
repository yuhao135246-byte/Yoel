"use client";

import { useState } from "react";
import { PAYMENT_LINKS } from "@/lib/config";

type PaymentActionsProps = {
  orderNumber?: string;
};

const WECHAT_PAYMENT_URL = PAYMENT_LINKS.wechat;
const ALIPAY_PAYMENT_URL = PAYMENT_LINKS.alipay;

export function PaymentActions({ orderNumber }: PaymentActionsProps) {
  const [hasOpenedPayment, setHasOpenedPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "AWAITING_PAYMENT_CONFIRMATION" | "PAID">("PENDING");
  const [message, setMessage] = useState("");
  const [isWechatModalOpen, setIsWechatModalOpen] = useState(false);
  const [isCopyingLink, setIsCopyingLink] = useState(false);

  function isWeChatBrowser() {
    return /MicroMessenger/i.test(window.navigator.userAgent);
  }

  function openWeChatPayment() {
    const target = WECHAT_PAYMENT_URL.trim();

    if (!target) {
      setMessage("支付链接未配置，请联系管理员。");
      return;
    }

    const isWechat = isWeChatBrowser();

    if (isWechat) {
      window.location.href = target;
      setHasOpenedPayment(true);
      return;
    }

    setMessage("");
    setIsWechatModalOpen(true);
  }

  async function copyWeChatPaymentLink() {
    const target = WECHAT_PAYMENT_URL.trim();

    if (!target) {
      setMessage("支付链接未配置，请联系管理员。");
      return;
    }

    setIsCopyingLink(true);

    try {
      await window.navigator.clipboard.writeText(target);
      setMessage("支付链接已复制，请打开微信粘贴并访问完成支付。");
      setIsWechatModalOpen(false);
    } catch {
      setMessage("复制失败，请手动复制支付链接后在微信中打开。");
    } finally {
      setIsCopyingLink(false);
    }
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

      {isWechatModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md border border-ink/15 bg-paper p-6 text-ink shadow-xl">
            <h2 className="text-xl leading-tight">请使用微信完成支付</h2>
            <p className="mt-4 text-sm leading-6 text-graphite">
              微信经营收款链接只能在微信内打开。请点击下面按钮复制链接，然后发送到微信聊天，点击即可完成支付。
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={copyWeChatPaymentLink}
                disabled={isCopyingLink}
                className="h-12 flex-1 border border-ink/20 bg-white px-4 text-sm text-ink disabled:opacity-40"
              >
                {isCopyingLink ? "复制中..." : "复制支付链接"}
              </button>
              <button
                type="button"
                onClick={() => setIsWechatModalOpen(false)}
                className="h-12 border border-ink/20 bg-white px-4 text-sm text-ink"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}