import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/brand/footer";
import { Header } from "@/components/brand/header";

export const metadata: Metadata = {
  title: "CADENCE | 冷萃研究与菜单",
  description:
    "Cadence 是一个以冷萃为核心的研究项目，记录产地、发酵、处理与风味之间的关系。",
  appleWebApp: {
    capable: true,
    title: "CADENCE",
    statusBarStyle: "black-translucent"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b0b0a"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
