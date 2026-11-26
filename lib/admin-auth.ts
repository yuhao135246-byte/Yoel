import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "cadence_admin_token";
const ADMIN_SESSION_SECONDS = 86400;

function signExpiry(expiry: string, secret: string) {
  return createHmac("sha256", secret).update(`cadence-admin:${expiry}`).digest("hex");
}

export function getAdminSecret() {
  return process.env.ADMIN_SECRET?.trim();
}

export async function isAdminAuthenticated() {
  const secret = getAdminSecret();
  if (!secret) {
    return false;
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!value || !/^\d+\.[a-f0-9]{64}$/.test(value)) {
    return false;
  }
  const [expiry, signature] = value.split(".");
  return Number(expiry) > Math.floor(Date.now() / 1000) &&
    timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(signExpiry(expiry, secret), "hex"));
}

export async function requireAdminAuth() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    throw new Error("UNAUTHORIZED");
  }
}

export function buildAdminCookieHeader(secret: string) {
  const secureFlag = process.env.NODE_ENV === "production" ? "Secure" : "";
  const expiry = String(Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS);
  return [
    `${ADMIN_COOKIE_NAME}=${expiry}.${signExpiry(expiry, secret)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${ADMIN_SESSION_SECONDS}`,
    secureFlag
  ]
    .filter(Boolean)
    .join("; ");
}

export function buildExpiredAdminCookieHeader() {
  return `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${process.env.NODE_ENV === "production" ? "Secure" : ""}`
    .replace(/;\s*$/, "")
    .trim();
}
