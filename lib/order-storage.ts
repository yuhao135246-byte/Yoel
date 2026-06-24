import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

export type StoredOrder = {
  orderNumber: string;
  createdAt: string;
  items: {
    slug: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  name: string;
  phone: string;
  address: string;
  notes?: string;
  total: number;
};

const defaultJsonPath = path.join(process.cwd(), "data", "orders.json");
const fallbackJsonPath = path.join(os.tmpdir(), "cadence-orders.json");

async function getOrdersJsonPath() {
  try {
    await fs.mkdir(path.dirname(defaultJsonPath), { recursive: true });
    return defaultJsonPath;
  } catch {
    return fallbackJsonPath;
  }
}

export async function saveOrderToJson(order: StoredOrder) {
  const filePath = await getOrdersJsonPath();
  let orders: StoredOrder[] = [];

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    orders = JSON.parse(raw) as StoredOrder[];
  } catch {
    orders = [];
  }

  orders.unshift(order);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(orders, null, 2), "utf-8");
  return order;
}
