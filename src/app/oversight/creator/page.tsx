"use client";

import { useState } from "react";
import { OversightShell } from "@/components/shells/OversightShell";
import { ProvenanceMark } from "@/components/ui/ProvenanceMark";
import { ScoreRing } from "@/components/ui/ScoreRing";

type CreatorRow = {
  id: string;
  name: string;
  amf: number;
  liveCampaigns: number;
  earnedThisMonth: number;
  pendingPayout: number;
  lifetimeEarned: number;
  campaigns: {
    name: string;
    business: string;
    status: string;
    earned: number;
  }[];
  payouts: { date: string; amount: number; status: string }[];
};

const CREATORS: CreatorRow[] = [
  {
    id: "mei",
    name: "Mei Lin",
    amf: 82,
    liveCampaigns: 1,
    earnedThisMonth: 1850,
    pendingPayout: 500,
    lifetimeEarned: 12400,
    campaigns: [
      {
        name: "Tasting menu reel",
        business: "As I Am by Chef Ton",
        status: "Live",
        earned: 1200,
      },
      {
        name: "SOOD lunch hook",
        business: "SOOD Penang",
        status: "In review",
        earned: 650,
      },
    ],
    payouts: [
      { date: "12 Sep 2026", amount: 500, status: "Pending" },
      { date: "28 Aug 2026", amount: 1350, status: "Paid" },
      { date: "14 Aug 2026", amount: 900, status: "Paid" },
    ],
  },
];

function rm(n: number) {
  return `RM ${n.toLocaleString("en-MY")}`;
}

export default function CreatorPerformancePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = CREATORS.find((c) => c.id === selectedId) ?? null;

  return (
    <OversightShell title={selected ? selected.name : "Creator performance"}>
      {!selected ? (
        <>
          <p className="text-sm text-muted">
            Studio is the canvas. This page is numbers only.
          </p>
          <ul className="mt-6 space-y-3">
            {CREATORS.map((creator) => (
              <li key={creator.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(creator.id)}
                  className="w-full rounded-[16px] border border-line bg-surface p-5 text-left transition-colors duration-150 hover:border-accent/40"
                >
                  <p className="font-medium text-ink">{creator.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    AMF {creator.amf} · Predicted · {creator.liveCampaigns} live
                    campaign
                    {creator.liveCampaigns === 1 ? "" : "s"}
                  </p>
                  <p className="mt-3 font-mono text-[13px] text-ink">
                    {rm(creator.earnedThisMonth)}{" "}
                    <span className="text-muted">this month</span>
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="space-y-8">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="text-sm text-muted hover:text-ink"
          >
            ← All creators
          </button>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Creator
              </p>
              <h2 className="mt-2 text-2xl font-medium tracking-tight text-ink">
                {selected.name}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                AMF {selected.amf}
                <ProvenanceMark kind="predicted" />
                · {selected.liveCampaigns} live campaign
              </p>
            </div>
            <ScoreRing value={selected.amf} label="Avatar Market-Fit · Predicted" />
          </div>

          <section className="grid gap-4 sm:grid-cols-3">
            <Metric label="Earned this month" value={rm(selected.earnedThisMonth)} />
            <Metric label="Pending payout" value={rm(selected.pendingPayout)} accent />
            <Metric label="Lifetime earned" value={rm(selected.lifetimeEarned)} />
          </section>

          <section>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Campaign earnings
            </h3>
            <ul className="mt-3 divide-y divide-line rounded-[16px] border border-line bg-surface">
              {selected.campaigns.map((c) => (
                <li
                  key={c.name}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-ink">{c.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {c.business} · {c.status}
                    </p>
                  </div>
                  <p className="font-mono text-[13px] text-ink">{rm(c.earned)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Payout history
            </h3>
            <ul className="mt-3 divide-y divide-line rounded-[16px] border border-line bg-surface">
              {selected.payouts.map((p) => (
                <li
                  key={`${p.date}-${p.amount}`}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-mono text-[13px] text-ink">{rm(p.amount)}</p>
                    <p className="mt-1 text-sm text-muted">{p.date}</p>
                  </div>
                  <span
                    className={`text-sm ${
                      p.status === "Pending" ? "text-accent" : "text-muted"
                    }`}
                  >
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </OversightShell>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p
        className={`mt-3 text-2xl font-medium tracking-tight ${
          accent ? "text-accent" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
