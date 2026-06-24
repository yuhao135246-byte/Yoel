export function formatOrderNumber(date = new Date(), sequence = 1) {
  const stamp = date.toISOString().slice(0, 10).replaceAll("-", "");
  const padded = String(sequence).padStart(4, "0");
  return `CD-${stamp}-${padded}`;
}

export function createOrderNumber() {
  return formatOrderNumber();
}
