import { buildAdminCookieHeader, getAdminSecret } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const adminSecret = getAdminSecret();
  if (!adminSecret) {
    return Response.json({ error: "ADMIN_SECRET 未配置" }, { status: 500 });
  }

  let payload: { secret?: string };

  try {
    payload = (await request.json()) as { secret?: string };
  } catch {
    payload = {};
  }

  const secret = typeof payload.secret === "string" ? payload.secret.trim() : "";
  if (secret !== adminSecret) {
    return Response.json({ error: "管理员密钥不正确" }, { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": buildAdminCookieHeader()
    }
  });
}
