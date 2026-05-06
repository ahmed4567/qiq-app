"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

type PortalNavProps = {
  items: NavItem[];
  variant?: "sidebar" | "mobile";
};

export function PortalNav({ items, variant = "sidebar" }: PortalNavProps) {
  const pathname = usePathname();

  return (
    <nav className={variant === "mobile" ? "grid gap-2 sm:grid-cols-2" : "space-y-2"}>
      {items.map((item) => {
        const active =
          pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              variant === "mobile"
                ? [
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
                    active
                      ? "border-[var(--brand-pink)]/55 bg-[rgba(205,31,141,0.16)] text-white"
                      : "border-white/10 bg-white/5 text-[var(--muted)] hover:border-[var(--brand-pink)]/40 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                : [
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
                    active
                      ? "border-[var(--brand-pink)]/55 bg-[rgba(205,31,141,0.16)] text-white"
                      : "border-white/8 text-[var(--muted)] hover:border-[var(--brand-pink)]/40 hover:bg-white/6 hover:text-white",
                  ].join(" ")
            }
          >
            <span>{item.label}</span>
            <span className={active ? "text-[var(--brand-peach)]" : "text-white/30"}>↗</span>
          </Link>
        );
      })}
    </nav>
  );
}
