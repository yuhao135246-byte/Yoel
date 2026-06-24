export async function GET() {
  return new Response(JSON.stringify({ error: "未启用的 API 路径" }), {
    status: 404,
    headers: { "content-type": "application/json" }
  });
}
