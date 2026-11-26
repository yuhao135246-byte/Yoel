import Image from "next/image";
import Link from "next/link";

const nav = [
  ["本周冷萃", "/coffee"],
  ["设计档案", "/objects"],
  ["研究日志", "/journal"],
  ["我的订单", "/my-orders"]
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-7">
        <Link href="/" className="inline-flex shrink-0 items-center">
          <Image
            src="/assets/cadence-logo.png"
            alt="CADENCE logo"
            width={360}
            height={96}
            className="h-auto w-16 min-[375px]:w-24 md:h-28 md:w-auto"
          />
        </Link>
        <nav className="flex items-center gap-2 whitespace-nowrap text-[10px] text-graphite md:gap-7 md:text-[11px]">
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
