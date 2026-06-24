import Image from "next/image";
import { journalNotes } from "@/lib/data";

export default function JournalPage() {
  return (
    <main className="bg-paper text-ink">
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-warm">研究项目</p>
        <h1 className="mt-6 max-w-4xl text-6xl leading-none md:text-8xl">研究日志</h1>
        <p className="mt-8 max-w-2xl text-sm leading-7 text-graphite">
          冷萃实验、物件观察与风味记录。
        </p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 md:grid-cols-[0.9fr_1.1fr] md:px-8">
        <div className="grid gap-6">
          {journalNotes.map((note) => (
            <article key={note.code} className="border-t border-ink/15 pt-5">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-warm">{note.code}</p>
              <h2 className="mt-3 text-3xl">{note.title}</h2>
              <p className="mt-4 text-sm leading-7 text-graphite">{note.summary}</p>
            </article>
          ))}
        </div>
        <Image
          src="/assets/unit01-detail.png"
          alt="Object study detail"
          width={1200}
          height={1200}
          className="aspect-square w-full object-cover"
        />
      </section>
    </main>
  );
}
