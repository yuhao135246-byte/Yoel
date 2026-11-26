import { createHash, randomBytes } from "node:crypto";

export const CUSTOMER_ORDER_COOKIE = "cadence_order_device";
export const CUSTOMER_ORDER_COOKIE_AGE = 60 * 60 * 24 * 365;

export function isCustomerOrderDevice(value?: string): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

export function createCustomerOrderDevice() {
  return randomBytes(32).toString("hex");
}

export function hashCustomerOrderDevice(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
