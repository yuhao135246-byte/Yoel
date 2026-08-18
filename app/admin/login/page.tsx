"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ secret })
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || "登录失败");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "登录失败");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-xl border border-ink/15 p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin Login</p>
        <h1 className="mt-5 text-4xl leading-none md:text-6xl">Admin access</h1>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-graphite">
            Admin Secret
            <input
              type="password"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="请输入 ADMIN_SECRET"
              className="h-12 border border-ink/20 bg-paper px-3 text-base text-ink"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="h-12 border border-ink bg-ink px-5 text-sm uppercase tracking-[0.18em] text-paper disabled:opacity-50"
          >
            {pending ? "登录中" : "登录"}
          </button>
        </form>
      </section>
    </main>
  );
}
