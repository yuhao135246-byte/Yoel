import { supabaseAdmin } from "@/lib/supabase";

const STATUS_VALUES = [
  "PENDING",
  "AWAITING_PAYMENT_CONFIRMATION",
  "RESERVED",
  "PAID",
  "FULFILLED",
  "CANCELLED"
] as const;

type StatusValue = (typeof STATUS_VALUES)[number];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const body = await request.json();
  const status = body.status as StatusValue | undefined;

  if (!status || !STATUS_VALUES.includes(status)) {
    return new Response(JSON.stringify({ error: "无效状态" }), { status: 400 });
  }

  if (!supabaseAdmin) {
    return new Response(JSON.stringify({ error: "数据库不可用" }), { status: 503 });
  }

  try {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", resolvedParams.id)
      .select()
      .single();

    if (error || !order) {
      throw error ?? new Error("更新失败");
    }

    return new Response(JSON.stringify({ order }), { status: 200 });
  } catch (error) {
    console.error("更新订单状态失败", error);
    return new Response(JSON.stringify({ error: "更新失败" }), { status: 500 });
  }
}
