import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { ProxyAgent, fetch as undiciFetch } from "undici";

const nativeFetch: typeof fetch = globalThis.fetch.bind(globalThis);

function getWindowsSystemProxyUrl(): string {
  if (process.platform !== "win32") {
    return "";
  }

  try {
    const enabled = execFileSync(
      "reg.exe",
      ["query", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "/v", "ProxyEnable"],
      { encoding: "utf8", windowsHide: true, timeout: 5000 }
    );

    if (!/\b0x1\b/i.test(enabled)) {
      return "";
    }

    const server = execFileSync(
      "reg.exe",
      ["query", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "/v", "ProxyServer"],
      { encoding: "utf8", windowsHide: true, timeout: 5000 }
    );

    const match = server.match(/ProxyServer\s+REG_\w+\s+(.+)/i);
    if (!match?.[1]) {
      return "";
    }

    const entries = match[1].trim().split(";");
    let proxy = entries.find((entry) => entry.trim().toLowerCase().startsWith("https="))
      ?.replace(/^https=/i, "")
      .trim();

    if (!proxy) {
      proxy = entries.find((entry) => entry.trim().toLowerCase().startsWith("http="))
        ?.replace(/^http=/i, "")
        .trim();
    }

    if (!proxy) {
      proxy = entries[0]?.trim();
    }

    if (!proxy) {
      return "";
    }

    return /^https?:\/\//i.test(proxy) ? proxy : `http://${proxy}`;
  } catch {
    return "";
  }
}

const proxyUrl =
  process.env.NODE_ENV !== "production"
    ? (
      process.env.HTTP_PROXY ||
      process.env.HTTPS_PROXY ||
      process.env.http_proxy ||
      process.env.https_proxy ||
      getWindowsSystemProxyUrl()
    ).trim()
    : "";

function createProxyAwareFetch(): typeof fetch {
  if (!proxyUrl) {
    return (input, init) =>
      nativeFetch(input, {
        ...init,
        cache: "no-store"
      });
  }

  const dispatcher = new ProxyAgent(proxyUrl);
  return (input, init) => {
    const requestUrl =
      input instanceof Request
        ? input.url
        : typeof input === "string"
          ? input
          : String(input);

    return undiciFetch(requestUrl, {
      dispatcher,
      method: init?.method,
      headers: init?.headers,
      body: typeof init?.body === "string" ? init.body : undefined
    }) as unknown as Promise<Response>;
  };
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const proxyAwareFetch = createProxyAwareFetch();

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        global: {
          fetch: proxyAwareFetch
        }
      })
    : null;
export const supabaseAdmin =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        global: {
          fetch: proxyAwareFetch
        },
        auth: {
          persistSession: false
        }
      })
    : null;
