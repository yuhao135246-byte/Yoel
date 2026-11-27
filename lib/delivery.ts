export const BOOKING_OPEN_HOUR = 12;
const BOOKING_CLOSE_HOUR = 22;
export const BOOKING_CLOSED_MESSAGE = `配送预订暂未开放。每天北京时间 ${BOOKING_OPEN_HOUR}:00 至 ${BOOKING_CLOSE_HOUR}:00 可预订次日上午配送。`;
export const AREA_DAILY_CAPACITY = 5;
export const GLOBAL_DAILY_CAPACITY = 15;

export const DELIVERY_AREA_SLOTS = {
  "惠济区": "07:00-07:30",
  "金水及东区": "08:00-12:30"
} as const;

export type DeliveryArea = keyof typeof DELIVERY_AREA_SLOTS;

export const DELIVERY_AREAS = Object.entries(DELIVERY_AREA_SLOTS).map(([area, slot]) => ({
  area: area as DeliveryArea,
  slot
}));

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

export type BookingDateContext = {
  todayKey: string;
  tomorrowKey: string;
  isBookingOpen: boolean;
  defaultBookingDate: string;
  dateOptions: DeliveryDateOption[];
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

export function getChinaNow() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Shanghai"
    })
  );
}

export function getBookingDateContext(now = getChinaNow()): BookingDateContext {
  const todayKey = toDateKey(now);
  const tomorrowKey = toDateKey(addDays(now, 1));
  const hour = now.getHours();
  const isBookingOpen = hour >= BOOKING_OPEN_HOUR && hour < BOOKING_CLOSE_HOUR;

  return {
    todayKey,
    tomorrowKey,
    isBookingOpen,
    defaultBookingDate: tomorrowKey,
    dateOptions: isBookingOpen
      ? [
          {
            date: tomorrowKey,
            label: `明天（${tomorrowKey}）`,
            isToday: false,
            isAvailable: true
          }
        ]
      : []
  };
}

export function getDefaultBookingDate(now = getChinaNow()) {
  return getBookingDateContext(now).defaultBookingDate;
}

export function getBookingDateOptions(now = getChinaNow()) {
  return getBookingDateContext(now).dateOptions;
}

export function getDefaultDeliveryDate(today = getChinaNow()) {
  return getDefaultBookingDate(today);
}

export function buildRollingDeliveryDateOptions(config: {
  today?: Date;
  days?: number;
  isTodayAvailable: boolean;
}) {
  return getBookingDateOptions(config.today).map((option) => ({
    ...option,
    isAvailable: option.isToday ? config.isTodayAvailable : true
  }));
}

export function formatDeliveryDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function isDeliveryArea(value: string): value is DeliveryArea {
  return Object.hasOwn(DELIVERY_AREA_SLOTS, value);
}

export function normalizeDeliveryArea(value?: string): DeliveryArea | undefined {
  if (value === "金水区" || value === "郑东新区") return "金水及东区";
  return value && isDeliveryArea(value) ? value : undefined;
}

export function getDeliverySlotForArea(area: DeliveryArea) {
  return DELIVERY_AREA_SLOTS[area];
}
