import Image from "next/image";
import Link from "next/link";

const nav = [
  ["本周冷萃", "/coffee"],
  ["UNIT 系列", "/objects"],
  ["研究日志", "/journal"],
  ["关于", "/about"]
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-7">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/assets/cadence-logo.png"
            alt="CADENCE logo"
            width={360}
            height={96}
            className="h-14 w-auto md:h-28"
          />
        </Link>
        <nav className="flex max-w-[62vw] items-center gap-3 overflow-x-auto whitespace-nowrap text-[10px] uppercase tracking-[0.16em] text-graphite [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:max-w-none md:gap-7 md:text-[11px]">
          {nav.map(([label, href]) => (
            <Link key={href + label} href={href} className="hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
