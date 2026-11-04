import { execFile } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const nativeFetch: typeof fetch = globalThis.fetch.bind(globalThis);

function execFileAsync(file: string, args: string[], options: { maxBuffer: number }): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(file, args, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      const stdoutValue = stdout as string | Buffer | undefined;
      const stderrValue = stderr as string | Buffer | undefined;

      resolve({
        stdout: Buffer.isBuffer(stdoutValue) ? stdoutValue.toString("utf-8") : String(stdoutValue ?? ""),
        stderr: Buffer.isBuffer(stderrValue) ? stderrValue.toString("utf-8") : String(stderrValue ?? "")
      });
    });
  });
}

const proxyUrl =
  process.env.NODE_ENV !== "production"
    ? (process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.https_proxy || "").trim()
    : "";

function createProxyAwareFetch(): typeof fetch {
  if (!proxyUrl) {
    return (input, init) =>
      nativeFetch(input, {
        ...init,
        cache: "no-store"
      });
  }

  return async (input, init) => {
    const request = input instanceof Request ? input : new Request(String(input), init);
    const method = (request.method || init?.method || "GET").toUpperCase();
    const headers = new Headers(request.headers ?? {});
    const body = method === "GET" || method === "HEAD" ? undefined : await request.clone().text();

    const args = [
      "--silent",
      "--show-error",
      "--location",
      "--max-time",
      "30",
      "--proxy",
      proxyUrl,
      "--request",
      method,
      "--output",
      "-",
      "--dump-header",
      "-"
    ];

    for (const [key, value] of headers.entries()) {
      args.push("--header", `${key}: ${value}`);
    }

    if (body !== undefined && body.length > 0) {
      args.push("--data-binary", body);
    }

    args.push(request.url);

    try {
      const { stdout } = await execFileAsync("curl.exe", args, { maxBuffer: 10 * 1024 * 1024 });
      const raw = stdout;
      const separatorIndex = raw.search(/\r?\n\r?\n/);
      const headerBlock = separatorIndex >= 0 ? raw.slice(0, separatorIndex) : raw;
      const responseBody = separatorIndex >= 0 ? raw.slice(separatorIndex + 4) : "";
      const statusMatch = headerBlock.match(/^HTTP\/\d+\.\d+\s+(\d{3})/m);
      const status = statusMatch ? Number(statusMatch[1]) : 200;
      const responseHeaders = new Headers();

      for (const line of headerBlock.split(/\r?\n/)) {
        if (!line || /^HTTP\//.test(line)) {
          continue;
        }

        const separator = line.indexOf(":");
        if (separator === -1) {
          continue;
        }

        responseHeaders.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
      }

      return new Response(responseBody, {
        status,
        headers: responseHeaders
      });
    } catch (error) {
      console.warn("[supabase-proxy] local curl fallback failed, using native fetch", error);
      return nativeFetch(input, {
        ...init,
        cache: "no-store"
      });
    }
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
