import { supabase, supabaseAdmin } from "@/lib/supabase";

function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "").trim();
}

function deduplicateHistory(rows: Array<{ address: string; notes: string; customer_name: string; phone: string; order_number: string; created_at: string }>) {
  const unique = new Map<string, {
    orderNumber: string;
    customerName: string;
    phone: string;
    address: string;
    notes: string;
    createdAt: string;
  }>();

  for (const row of rows) {
    const address = String(row.address ?? "").trim();
    if (!address) {
      continue;
    }

    const notes = String(row.notes ?? "").trim();
    const key = `${address}::${notes}`;

    if (!unique.has(key)) {
      unique.set(key, {
        orderNumber: String(row.order_number ?? ""),
        customerName: String(row.customer_name ?? ""),
        phone: String(row.phone ?? ""),
        address,
        notes,
        createdAt: String(row.created_at ?? "")
      });
    }
  }

  return Array.from(unique.values()).slice(0, 5);
}

export async function POST(request: Request) {
  if (!supabase || !supabaseAdmin) {
    return Response.json(
      { error: "未启用 Supabase Phone Auth，无法验证历史订单信息。" },
      { status: 503 }
    );
  }

  const body = (await request.json()) as {
    action?: "request-otp" | "verify-otp";
    name?: string;
    phone?: string;
    otp?: string;
  };

  const action = body.action;
  const name = normalizeName(String(body.name ?? ""));
  const phone = normalizePhone(String(body.phone ?? ""));
  const otp = String(body.otp ?? "").trim();

  if (!name || !phone) {
    return Response.json({ error: "姓名和手机号不能为空。" }, { status: 400 });
  }

  if (action === "request-otp") {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: "sms",
          shouldCreateUser: false
        }
      });

      if (error) {
        throw error;
      }

      return Response.json({
        ok: true,
        message: "验证码已发送至您的手机号，请在下方输入验证码完成验证。"
      });
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "无法发送短信验证码，请确认 Supabase Phone Auth 已启用，且手机号正确。"
        },
        { status: 400 }
      );
    }
  }

  if (action === "verify-otp") {
    if (!/^\d{6}$/.test(otp)) {
      return Response.json({ error: "请输入 6 位短信验证码。" }, { status: 400 });
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms"
      });

      if (error || !data?.user) {
        throw error ?? new Error("短信验证码校验失败。");
      }

      const verifiedPhone = normalizePhone(String(data.user.phone ?? phone));
      if (!verifiedPhone || verifiedPhone !== phone) {
        return Response.json({ error: "仅允许验证当前手机号对应的历史订单信息。" }, { status: 401 });
      }

      const phoneDigits = phone.replace(/\D/g, "");
      const { data: historicRows, error: historicError } = await supabaseAdmin
        .from("orders")
        .select("id, order_number, customer_name, phone, address, notes, created_at")
        .like("phone", `%${phoneDigits}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (historicError) {
        throw historicError;
      }

      const matches = (historicRows ?? []).filter((row) => normalizeName(String(row.customer_name ?? "")) === name);
      const addresses = deduplicateHistory(
        matches.map((row) => ({
          address: String(row.address ?? ""),
          notes: String(row.notes ?? ""),
          customer_name: String(row.customer_name ?? ""),
          phone: String(row.phone ?? ""),
          order_number: String(row.order_number ?? ""),
          created_at: String(row.created_at ?? "")
        }))
      );

      return Response.json({
        ok: true,
        verified: true,
        customerName: name,
        phone,
        addresses
      });
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "短信验证码校验失败，请重试。"
        },
        { status: 401 }
      );
    }
  }

  return Response.json({ error: "不支持的请求类型。" }, { status: 400 });
}
