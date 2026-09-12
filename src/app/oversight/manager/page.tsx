"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AdminTopup, LedgerList } from "@/components/credits/LedgerPanel";
import { OversightShell } from "@/components/shells/OversightShell";
import { useMarketplace } from "@/lib/marketplace";

function ManagerHome() {
  const tab = useSearchParams().get("tab") ?? "queue";
  const { reviews, ledger } = useMarketplace();
  const open = reviews.filter((j) => j.waitingOn !== "done");
  const escalated = reviews.filter((j) => j.waitingOn === "admin");

  if (tab === "credits") {
    return (
      <OversightShell title="Credits">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,360px)_1fr]">
          <AdminTopup />
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Ledger
            </p>
            <LedgerList entries={ledger} />
          </div>
        </div>
      </OversightShell>
    );
  }

  return (
    <OversightShell title="Queue">
      <div className="grid gap-4 lg:grid-cols-3">
        <Metric href="/work/review" label="Needs review" value={String(open.length)} />
        <Metric href="/oversight/manager?tab=credits" label="Credits" value="Ledger" />
        <Metric href="/work/review" label="Escalated" value={String(escalated.length)} />
      </div>
      <ul className="mt-8 space-y-3">
        {open.map((j) => (
          <li key={j.id}>
            <Link
              href={`/work/review?id=${j.id}`}
              className="block rounded-[16px] border border-line bg-surface p-4"
            >
              <p className="font-medium">
                {j.kolName} · {j.title}
              </p>
              <p className="mt-1 text-sm text-muted">
                {j.businessName} · {j.step} · {j.waitingOn}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </OversightShell>
  );
}

function Metric({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string;
}) {
  return (
    <Link href={href} className="rounded-[16px] border border-line bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-2xl font-medium tracking-tight">{value}</p>
    </Link>
  );
}

export default function ManagerOversightPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
      <ManagerHome />
    </Suspense>
  );
}
