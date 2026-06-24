"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "待付款" },
  { value: "RESERVED", label: "待发货" },
  { value: "PAID", label: "已付款" },
  { value: "FULFILLED", label: "已发货" },
  { value: "CANCELLED", label: "已完成" }
] as const;

type StatusOptionValue = (typeof STATUS_OPTIONS)[number]["value"];

export function OrderStatusForm({
  orderId,
  currentStatus
}: {
  orderId: string;
  currentStatus: StatusOptionValue;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusOptionValue>(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error("保存失败");
      }

      setMessage("状态已更新");
      router.refresh();
    } catch (error) {
      setMessage("保存状态失败，请稍后重试");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="grid gap-4 border border-ink/15 bg-paper p-5">
      <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
        订单状态
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusOptionValue)}
          className="h-12 border border-ink/20 bg-white px-3 text-base"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={isSaving}
        className="h-12 bg-ink text-sm uppercase tracking-[0.18em] text-paper disabled:opacity-40"
      >
        {isSaving ? "保存中..." : "保存状态"}
      </button>
      {message ? <p className="text-sm text-graphite">{message}</p> : null}
    </form>
  );
}
