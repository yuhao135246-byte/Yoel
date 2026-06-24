import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/brand/footer";
import { Header } from "@/components/brand/header";

export const metadata: Metadata = {
  title: "CADENCE | Weekly Coffee, Unit Objects, Studies",
  description:
    "CADENCE is a design studio and lifestyle brand built around weekly cold brew, Unit objects, and research notes.",
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
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
