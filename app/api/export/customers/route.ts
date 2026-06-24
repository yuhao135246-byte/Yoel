import { customers } from "@/lib/data";

export function GET() {
  const rows = [
    ["name", "phone", "tags", "spend", "orders"],
    ...customers.map((customer) => [
      customer.name,
      customer.phone,
      customer.tags.join("|"),
      String(customer.spend),
      String(customer.orders)
    ])
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=cadence-customers.csv"
    }
  });
}
