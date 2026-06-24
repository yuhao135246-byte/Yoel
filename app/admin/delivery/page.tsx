import { DELIVERY_SLOTS, DELIVERY_WINDOW, deliveryDates, getDeliveryStatus } from "@/lib/delivery";

const statusClass = {
  AVAILABLE: "bg-ink text-paper",
  FULL: "bg-warm text-ink",
  CLOSED: "bg-bone text-graphite"
};

export default function DeliveryAdminPage() {
  return (
    <main className="min-h-screen bg-paper px-5 py-12 text-ink md:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">Admin / Delivery</p>
        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_0.85fr]">
          <div>
            <h1 className="max-w-3xl text-5xl leading-none md:text-7xl">Morning capacity only.</h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-graphite">
              CADENCE delivers inside one morning window: {DELIVERY_WINDOW}. Customers select an
              available date and one of eight preset delivery batches. When booked orders reach the
              daily capacity, the date becomes unavailable automatically.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {DELIVERY_SLOTS.map((slot) => (
                <span key={slot} className="border border-ink/15 px-3 py-2 font-mono text-xs">
                  {slot}
                </span>
              ))}
            </div>
          </div>
          <form className="grid gap-4 border border-ink/15 p-5">
            <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
              New Available Date
              <input type="date" className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case" />
            </label>
            <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
              Daily Capacity
              <input
                type="number"
                min="0"
                defaultValue="18"
                className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case"
              />
            </label>
            <label className="grid gap-2 text-xs uppercase tracking-[0.16em]">
              Delivery Status
              <select className="h-12 border border-ink/20 bg-paper px-3 text-base normal-case">
                <option>AVAILABLE</option>
                <option>CLOSED</option>
              </select>
            </label>
            <button type="button" className="h-12 bg-ink text-sm uppercase tracking-[0.18em] text-paper">
              Save Delivery Date
            </button>
          </form>
        </div>

        <div className="mt-14 overflow-hidden border border-ink/15">
          <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr] border-b border-ink/15 bg-bone px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-graphite">
            <span>Date</span>
            <span>Capacity</span>
            <span>Booked</span>
            <span>Status</span>
          </div>
          {deliveryDates.map((date) => {
            const status = getDeliveryStatus(date);

            return (
              <div
                key={date.date}
                className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr] items-center border-b border-ink/10 px-4 py-4 text-sm last:border-b-0"
              >
                <span className="font-mono">{date.date}</span>
                <span>{date.capacity}</span>
                <span>{date.booked}</span>
                <span>
                  <span className={`inline-flex px-2 py-1 font-mono text-[10px] ${statusClass[status]}`}>
                    {status}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
