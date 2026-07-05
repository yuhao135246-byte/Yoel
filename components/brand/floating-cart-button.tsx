"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const CART_CHANGE_EVENT = "cadence-cart-change";

function readCartCount() {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const raw = window.localStorage.getItem("cadence-cart");
    const items = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(items)) {
      return 0;
    }

    return items.reduce((total, item) => total + Number(item?.quantity ?? 0), 0);
  } catch {
    return 0;
  }
}

function isOrderingRoute(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  return (
    pathname === "/" ||
    pathname.startsWith("/coffee") ||
    pathname.startsWith("/objects") ||
    pathname.startsWith("/cart")
  );
}

export function FloatingCartButton() {
  const pathname = usePathname();
  const [itemCount, setItemCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isBumped, setIsBumped] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setItemCount(readCartCount());

    const syncCartCount = () => {
      const nextCount = readCartCount();
      setItemCount((currentCount) => {
        if (nextCount > currentCount) {
          setIsBumped(true);
        }

        return nextCount;
      });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "cadence-cart") {
        syncCartCount();
      }
    };

    const handleCartChange = () => {
      syncCartCount();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CART_CHANGE_EVENT, handleCartChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CART_CHANGE_EVENT, handleCartChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isBumped) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsBumped(false);
    }, 220);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isBumped]);

  const visible = useMemo(() => isMounted && isOrderingRoute(pathname), [isMounted, pathname]);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-5 z-[9999] pb-[env(safe-area-inset-bottom)]">
      <Link
        href="/cart"
        aria-label={`打开购物车，当前 ${itemCount} 件商品`}
        className={`pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full border border-ink/10 bg-white text-ink shadow-[0_10px_28px_rgba(11,11,10,0.16)] transition duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-[0_12px_32px_rgba(11,11,10,0.18)] active:scale-95 ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        } ${isBumped ? "scale-110" : "scale-100"}`}
      >
        <span className="sr-only">购物车</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="h-6 w-6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 4h2l2.4 9.6a2 2 0 0 0 2 1.4h7.7a2 2 0 0 0 1.95-1.55L21 7H6.2" />
          <circle cx="10" cy="19" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="17" cy="19" r="1.25" fill="currentColor" stroke="none" />
        </svg>
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-white bg-ink px-1 text-[11px] font-medium leading-none text-paper shadow-sm">
          {itemCount}
        </span>
      </Link>
    </div>
  );
}

export function notifyCartChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}