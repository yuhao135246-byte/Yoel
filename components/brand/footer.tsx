import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1.5fr_1fr_1fr] md:gap-10 md:px-8 md:py-12">
        <div>
          <Image
            src="/assets/cadence-logo2.png"
            alt="Cadence"
            width={2399}
            height={1095}
            style={{ width: "140px", height: "auto" }}
            priority
          />
          <p className="mt-4 max-w-md text-base leading-7 text-paper/70">
            冷萃研究与味觉记录。关注产地、处理法、发酵与冷萃萃取之间的关系。
          </p>
        </div>
        <div className="text-base leading-7 text-paper/70 md:text-sm md:leading-8">
          <Link href="/coffee" className="block text-paper">
            本周菜单
          </Link>
          <Link href="/journal" className="block">
            研究日志
          </Link>
          <Link href="/about" className="block">
            关于
          </Link>
        </div>
        <div className="text-base leading-7 text-paper/70 md:text-sm md:leading-8">
          <p>微信支付 / 支付宝</p>
          <p>郑州 | 早晨配送</p>
        </div>
      </div>
    </footer>
  );
}
