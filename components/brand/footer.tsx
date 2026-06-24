import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr] md:px-8">
        <div>
          <p className="text-4xl italic">Cadence</p>
          <p className="mt-5 max-w-md text-sm leading-7 text-paper/70">
            A design studio and lifestyle brand. Weekly coffee first, member retention second,
            Unit objects third, journal as brand memory.
          </p>
        </div>
        <div className="text-sm leading-8 text-paper/70">
          <Link href="/coffee" className="block text-paper">
            Weekly Drop
          </Link>
          <Link href="/objects" className="block">
            Unit Series
          </Link>
          <Link href="/journal" className="block">
            Studies
          </Link>
        </div>
        <div className="text-sm leading-8 text-paper/70">
          <Link href="/admin" className="block text-paper">
            Admin
          </Link>
          <p>WeChat private traffic ordering</p>
          <p>Shanghai delivery windows</p>
        </div>
      </div>
    </footer>
  );
}
