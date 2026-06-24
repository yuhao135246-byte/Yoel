export const DELIVERY_FEE = 2;

type PricedItem = {
  price: number;
  quantity: number;
};

export function calculateSubtotal(items: PricedItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateDeliveryFee(subtotal: number) {
  return subtotal > 0 ? DELIVERY_FEE : 0;
}

export function calculateOrderTotal(subtotal: number) {
  return subtotal + calculateDeliveryFee(subtotal);
}