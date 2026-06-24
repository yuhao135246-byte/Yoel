import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr] md:px-8">
        <div>
          <p className="text-4xl italic">Cadence</p>
          <p className="mt-5 max-w-md text-sm leading-7 text-paper/70">
            冷萃研究与味觉记录。关注产地、处理法、发酵与冷萃萃取之间的关系。
          </p>
        </div>
        <div className="text-sm leading-8 text-paper/70">
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
        <div className="text-sm leading-8 text-paper/70">
          <p>微信支付 / 支付宝</p>
          <p>上海 | 早晨配送</p>
        </div>
      </div>
    </footer>
  );
}
