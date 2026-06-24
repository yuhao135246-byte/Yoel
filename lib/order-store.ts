export type RuntimeOrder = {
  number: string;
  customer: string;
  phone: string;
  wechat?: string;
  address: string;
  notes?: string;
  item: string;
  total: number;
  status: string;
  paymentStatus: "Pending" | "Paid";
  delivery: string;
};

const globalForOrders = globalThis as unknown as {
  cadenceOrders?: RuntimeOrder[];
};

export const runtimeOrders = globalForOrders.cadenceOrders ?? [];

if (!globalForOrders.cadenceOrders) {
  globalForOrders.cadenceOrders = runtimeOrders;
}

export function saveRuntimeOrder(order: RuntimeOrder) {
  runtimeOrders.unshift(order);
  return order;
}
