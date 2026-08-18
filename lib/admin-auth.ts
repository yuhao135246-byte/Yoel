import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "cadence_admin_token";
export const ADMIN_COOKIE_VALUE = "cadence-admin-authenticated";

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
  return value === ADMIN_COOKIE_VALUE;
}

export async function requireAdminAuth() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    throw new Error("UNAUTHORIZED");
  }
}

export function buildAdminCookieHeader() {
  const secureFlag = process.env.NODE_ENV === "production" ? "Secure" : "";
  return [
    `${ADMIN_COOKIE_NAME}=${ADMIN_COOKIE_VALUE}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=86400",
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
