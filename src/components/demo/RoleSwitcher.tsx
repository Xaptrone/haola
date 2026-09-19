"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, type DemoPreset } from "@/lib/session";

const presets: { id: DemoPreset; label: string; href: string }[] = [
  { id: "guest", label: "Landing", href: "/?preview=1" },
  { id: "creator-new", label: "Creator · new", href: "/work/studio?as=new&preview=1" },
  { id: "creator-active", label: "Creator · Aisha", href: "/work/studio?as=aisha&preview=1" },
  { id: "business-new", label: "Business · first login", href: "/work/business?preview=1&as=new" },
  { id: "business-draft", label: "Business · from landing", href: "/work/business?preview=1" },
  { id: "business-ready", label: "Business · ready", href: "/work/business?preview=1" },
  {
    id: "business-ready",
    label: "Business · Brand IP",
    href: "/work/business?preview=1&tab=create&intent=brand-ip&step=ip-draft&brand=As%20I%20Am%20by%20Chef%20Ton",
  },
  { id: "manager", label: "Manager", href: "/oversight/manager?preview=1" },
  {
    id: "manager",
    label: "Manager · Brand IP",
    href: "/oversight/manager?preview=1&tab=brand-ip",
  },
];

export function PreviewMenu({
  always = false,
  placement = "down",
  tone = "header",
}: {
  always?: boolean;
  placement?: "up" | "down";
  tone?: "header" | "quiet";
}) {
  return (
    <Suspense fallback={null}>
      <PreviewMenuInner always={always} placement={placement} tone={tone} />
    </Suspense>
  );
}

function PreviewMenuInner({
  always,
  placement,
  tone,
}: {
  always: boolean;
  placement: "up" | "down";
  tone: "header" | "quiet";
}) {
  const { loadPreset, session } = useSession();
  const router = useRouter();
  const preview = useSearchParams().get("preview") === "1";
  const [open, setOpen] = useState(false);

  if (!always && !preview) return null;

  const listClass =
    placement === "up"
      ? "absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 overflow-hidden rounded-[12px] border border-line bg-surface py-1"
      : "absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-[12px] border border-line bg-surface py-1";

  return (
    <div className="relative">
      <button
        type="button"
        className={
          tone === "quiet"
            ? "min-h-11 w-full text-center text-sm text-muted"
            : "text-sm text-muted hover:text-ink"
        }
        onClick={() => setOpen((v) => !v)}
      >
        Preview
      </button>
      {open ? (
        <ul className={listClass}>
          {presets.map((p) => (
            <li key={p.href}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center px-3 text-left text-[13px] text-ink hover:bg-elevated"
                onClick={() => {
                  loadPreset(p.id);
                  setOpen(false);
                  router.push(p.href);
                }}
              >
                {p.label}
              </button>
            </li>
          ))}
          {preview ? (
            <li className="border-t border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              {session.role || "guest"}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
