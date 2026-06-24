import { customers } from "@/lib/data";

export default function CustomersPage() {
  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin / Customers</p>
            <h1 className="mt-6 text-5xl leading-none md:text-7xl">Customers</h1>
          </div>
          <a href="/api/export/customers" className="border border-ink px-5 py-4 text-sm uppercase tracking-[0.18em]">
            Export CSV
          </a>
        </div>
        <div className="mt-10 grid gap-4">
          {customers.map((customer) => (
            <article key={customer.phone} className="grid gap-4 border-t border-ink/15 py-5 md:grid-cols-[1fr_1fr_1fr_0.7fr]">
              <div>
                <h2 className="text-2xl">{customer.name}</h2>
                <p className="mt-2 font-mono text-xs text-graphite">{customer.phone}</p>
              </div>
              <p className="text-sm text-graphite">{customer.tags.join(" / ")}</p>
              <p className="font-mono text-sm">RMB {customer.spend}</p>
              <p className="font-mono text-sm">{customer.orders} orders</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
