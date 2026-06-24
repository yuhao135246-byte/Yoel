export const DELIVERY_WINDOW = "07:00 - 12:00";
export const AREA_DAILY_CAPACITY = 5;
export const GLOBAL_DAILY_CAPACITY = 15;

export const DELIVERY_AREA_SLOTS = {
  "惠济区": "07:00-08:30",
  "郑东新区": "08:30-10:30",
  "金水区": "10:30-12:00"
} as const;

export type DeliveryArea = keyof typeof DELIVERY_AREA_SLOTS;

export const DELIVERY_AREAS = Object.entries(DELIVERY_AREA_SLOTS).map(([area, slot]) => ({
  area: area as DeliveryArea,
  slot
}));

export const DELIVERY_SLOTS = [
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00"
];

export type DeliveryStatus = "AVAILABLE" | "FULL" | "CLOSED";

export type DeliveryDate = {
  date: string;
  capacity: number;
  booked: number;
  status: DeliveryStatus;
};

export const deliveryDates: DeliveryDate[] = [
  { date: "2026-06-24", capacity: 18, booked: 11, status: "AVAILABLE" },
  { date: "2026-06-25", capacity: 18, booked: 18, status: "FULL" },
  { date: "2026-06-26", capacity: 20, booked: 4, status: "AVAILABLE" },
  { date: "2026-06-27", capacity: 0, booked: 0, status: "CLOSED" }
];

export function getDeliveryStatus(date: DeliveryDate): DeliveryStatus {
  if (date.status === "CLOSED") {
    return "CLOSED";
  }

  return date.booked >= date.capacity ? "FULL" : date.status;
}

export function getAvailableDeliveryDates() {
  return deliveryDates.filter((date) => getDeliveryStatus(date) === "AVAILABLE");
}

export function formatDeliveryDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function isDeliveryArea(value: string): value is DeliveryArea {
  return value in DELIVERY_AREA_SLOTS;
}

export function getDeliverySlotForArea(area: DeliveryArea) {
  return DELIVERY_AREA_SLOTS[area];
}
