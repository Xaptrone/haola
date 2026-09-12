"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, type DemoPreset } from "@/lib/session";

const presets: { id: DemoPreset; label: string; href: string }[] = [
  { id: "guest", label: "Landing", href: "/" },
  { id: "creator-new", label: "Creator · new (phone)", href: "/work/studio?as=new&preview=1" },
  { id: "creator-active", label: "Creator · Aisha (phone)", href: "/work/studio?as=aisha&preview=1" },
  { id: "business-new", label: "Business · first login", href: "/work/business?preview=1" },
  { id: "business-draft", label: "Business · from landing", href: "/work/business?preview=1" },
  { id: "business-ready", label: "Business · ready", href: "/work/business?preview=1" },
  { id: "manager", label: "Manager dashboard", href: "/oversight/manager?preview=1" },
];

export function RoleSwitcher() {
  const { loadPreset, session } = useSession();
  const router = useRouter();
  const allowed = useSearchParams().get("preview") === "1";
  const [open, setOpen] = useState(false);

  if (!allowed) return null;

  return (
    <div className="fixed bottom-[calc(84px+var(--safe-bottom))] left-4 z-50 lg:bottom-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="min-h-10 rounded-full border border-line bg-surface px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
      >
        Preview
      </button>
      {open ? (
        <ul className="absolute bottom-12 left-0 w-56 overflow-hidden rounded-[12px] border border-line bg-surface py-1">
          {presets.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="flex min-h-10 w-full items-center px-3 text-left text-[13px] text-ink hover:bg-elevated"
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
          <li className="border-t border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            {session.role}
          </li>
        </ul>
      ) : null}
    </div>
  );
}
