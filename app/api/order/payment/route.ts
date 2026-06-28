import { supabaseAdmin } from "@/lib/supabase";

type PaymentConfirmationPayload = {
  orderNumber?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as PaymentConfirmationPayload;
  const orderNumber = body.orderNumber?.trim();

  if (!orderNumber) {
    return new Response(JSON.stringify({ error: "订单号不能为空" }), { status: 400 });
  }

  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: "数据库不可用" }), { status: 503 });
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("order_number", orderNumber)
      .single();

    if (error || !order) {
      return new Response(JSON.stringify({ error: "订单不存在" }), { status: 404 });
    }

    if (order.status === "PENDING") {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("orders")
        .update({ status: "AWAITING_PAYMENT_CONFIRMATION" })
        .eq("id", order.id)
        .select("id, status")
        .single();

      if (updateError || !updated) {
        throw updateError ?? new Error("更新订单状态失败");
      }

      return new Response(JSON.stringify({ order: updated }), { status: 200 });
    }

    if (order.status === "AWAITING_PAYMENT_CONFIRMATION" || order.status === "PAID") {
      return new Response(
        JSON.stringify({
          order,
          message: "订单状态已更新"
        }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ error: "当前订单状态无法提交支付确认" }), { status: 409 });
  } catch (error) {
    console.error("提交支付确认失败", error);
    return new Response(JSON.stringify({ error: "提交支付确认失败" }), { status: 500 });
  }
}
