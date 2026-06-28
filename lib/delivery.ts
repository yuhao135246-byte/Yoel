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

export type DeliveryCapacitySnapshot = {
  capacity: number;
  booked: number;
  isClosed?: boolean;
};

export type DeliveryDateOption = {
  date: string;
  label: string;
  isToday: boolean;
  isAvailable: boolean;
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

export function canBookToday(snapshot: DeliveryCapacitySnapshot) {
  if (snapshot.isClosed || snapshot.capacity <= 0) {
    return false;
  }

  return snapshot.booked < snapshot.capacity;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateKey(value: Date) {
  return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
}

export function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function getDefaultDeliveryDate(today = new Date()) {
  const isAfterCutoff = today.getHours() >= 22;
  return toDateKey(isAfterCutoff ? addDays(today, 1) : today);
}

export function buildRollingDeliveryDateOptions(config: {
  today?: Date;
  days?: number;
  isTodayAvailable: boolean;
}) {
  const today = config.today ?? new Date();
  const days = config.days ?? 2;
  const options: DeliveryDateOption[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const date = addDays(today, offset);
    const dateKey = toDateKey(date);
    const isToday = offset === 0;
    const prefix = isToday ? "今天" : "明天";

    options.push({
      date: dateKey,
      label: `${prefix}（${dateKey}）`,
      isToday,
      isAvailable: isToday ? config.isTodayAvailable : true
    });
  }

  return options;
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
