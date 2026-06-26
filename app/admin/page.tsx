import Link from "next/link";
import { customers, orders, products } from "@/lib/data";
import { deliveryDates, getDeliveryStatus } from "@/lib/delivery";

const stats = [
  ["Orders", orders.length],
  ["Customers", customers.length],
  ["Products", products.length],
  ["Open Dates", deliveryDates.filter((date) => getDeliveryStatus(date) === "AVAILABLE").length]
];

const links = [
  ["Orders", "/admin/orders"],
  ["Customers", "/admin/customers"],
  ["Products", "/admin/products"],
  ["Delivery", "/admin/delivery"],
  ["Inventory", "/admin/inventory"]
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin</p>
        <h1 className="mt-6 max-w-4xl text-6xl leading-none md:text-8xl">Private traffic operations.</h1>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="border border-ink/15 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-warm">{label}</p>
              <p className="mt-5 text-4xl">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-3 md:grid-cols-5">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="border border-ink px-5 py-4 text-sm uppercase tracking-[0.18em]">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
