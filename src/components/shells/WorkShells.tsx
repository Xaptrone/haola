"use client";

import Link from "next/link";
import { BottomNav, type NavItem } from "@/components/nav/BottomNav";

export function MobileAppShell({
  title,
  items,
  active,
  children,
  contained = false,
}: {
  title: string;
  items: NavItem[];
  active: string;
  children: React.ReactNode;
  contained?: boolean;
}) {
  return (
    <div
      className={
        contained
          ? "relative flex h-full flex-col overflow-hidden bg-canvas"
          : "workspace-root bg-canvas lg:hidden"
      }
    >
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 px-5 py-3 backdrop-blur-md">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {title}
        </p>
      </header>
      <main className={`flex-1 overflow-auto px-5 pt-6 ${contained ? "pb-24" : "pb-nav"}`}>
        {children}
      </main>
      <BottomNav items={items} active={active} contained={contained} />
    </div>
  );
}

export function StudioShell({
  name,
  children,
  composer,
  actions,
}: {
  name: string;
  children: React.ReactNode;
  composer?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="hidden h-dvh flex-col bg-canvas lg:flex">
      <header className="flex items-center justify-between border-b border-line px-8 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Studio · {name}
        </p>
        <div className="flex items-center gap-6">
          {actions}
          <Link href="/oversight/creator" className="text-sm text-muted hover:text-ink">
            Performance
          </Link>
        </div>
      </header>
      <div className="relative min-h-0 flex-1 overflow-auto">{children}</div>
      {composer ? (
        <div className="border-t border-line px-8 py-4">{composer}</div>
      ) : null}
    </div>
  );
}

export function CommandShell({
  name,
  children,
  composer,
}: {
  name: string;
  children: React.ReactNode;
  composer?: React.ReactNode;
}) {
  return (
    <div className="hidden min-h-dvh flex-col bg-canvas lg:flex">
      <header className="flex items-center justify-between border-b border-line px-8 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {name}
        </p>
        <Link href="/oversight/business" className="text-sm text-muted hover:text-ink">
          Performance
        </Link>
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 px-8 py-10">{children}</div>
      {composer ? (
        <div className="border-t border-line px-8 py-4">{composer}</div>
      ) : null}
    </div>
  );
}
