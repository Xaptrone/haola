"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { NavIcon, type NavIconName } from "@/components/nav/NavIcons";

export type NavItem = {
  href: string;
  label: string;
  key: string;
  icon: NavIconName;
  badge?: number;
  primary?: boolean;
};

function hrefWithPreview(href: string, params: URLSearchParams) {
  const next = new URL(href, "https://fxgen.local");
  const preview = params.get("preview");
  const as = params.get("as");
  if (preview && !next.searchParams.has("preview")) {
    next.searchParams.set("preview", preview);
  }
  if (as && next.pathname.startsWith("/work/studio") && !next.searchParams.has("as")) {
    next.searchParams.set("as", as);
  }
  return `${next.pathname}${next.search}`;
}

export function BottomNav({
  items,
  active,
  contained = false,
}: {
  items: NavItem[];
  active: string;
  contained?: boolean;
}) {
  const params = useSearchParams();
  return (
    <nav
      className={
        contained
          ? "absolute inset-x-0 bottom-0 z-40 overflow-visible border-t border-line bg-surface"
          : "fixed inset-x-0 bottom-0 z-40 overflow-visible border-t border-line bg-surface/95 backdrop-blur-md lg:hidden"
      }
      style={contained ? undefined : { paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="grid h-16 grid-cols-5 px-1">
        {items.map((item) => {
          const on = active === item.key;
          const href = hrefWithPreview(item.href, params);
          if (item.primary) {
            return (
              <li key={item.key} className="flex items-start justify-center">
                <Link
                  href={href}
                  aria-label={item.label}
                  aria-current={on ? "page" : undefined}
                  className="nav-fab relative z-10 -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-ink transition-[transform] duration-[var(--duration-press)] ease-[var(--ease-out)] active:scale-[0.97]"
                >
                  <NavIcon name="create" size={26} />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </li>
            );
          }
          return (
            <li key={item.key} className="flex items-center justify-center">
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                className={`relative flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 transition-[color] duration-[var(--duration-press)] ease-[var(--ease-out)] ${
                  on ? "text-ink" : "text-muted"
                }`}
              >
                <NavIcon name={item.icon} active={on} />
                <span className="text-[10px] tracking-wide">{item.label}</span>
                {item.badge ? (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] text-ink">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

