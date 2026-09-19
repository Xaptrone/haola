"use client";

import { Suspense, useState } from "react";
import { OversightShell } from "@/components/shells/OversightShell";
import { StaffGate } from "@/components/auth/StaffGate";
import { useMarketplace } from "@/lib/marketplace";
import { creatorOversight } from "@/lib/oversight-metrics";
import { rm } from "@/lib/credits";

function CreatorPerformance() {
  const { parties, reviews, ready } = useMarketplace();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const creators = creatorOversight(parties, reviews);
  const selected = creators.find((c) => c.id === selectedId) ?? null;

  if (!ready) {
    return <OversightShell title="Creator performance">{null}</OversightShell>;
  }

  return (
    <OversightShell title={selected ? selected.name : "Creator performance"}>
      {!selected ? (
        <>
          <p className="text-sm text-muted">
            Studio is the canvas. This page is numbers only.
          </p>
          {creators.length ? (
            <ul className="mt-6 space-y-3">
              {creators.map((creator) => (
                <li key={creator.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(creator.id)}
                    className="w-full rounded-[16px] border border-line bg-surface p-5 text-left transition-colors duration-150 hover:border-accent/40"
                  >
                    <p className="font-medium text-ink">{creator.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {creator.liveCampaigns} live campaign
                      {creator.liveCampaigns === 1 ? "" : "s"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted">
              No creator performance yet. Numbers land here after studios accept
              matches.
            </p>
          )}
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

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Creator
            </p>
            <h2 className="mt-2 text-2xl font-medium tracking-tight text-ink">
              {selected.name}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {selected.liveCampaigns} live campaign
              {selected.liveCampaigns === 1 ? "" : "s"}
            </p>
          </div>

          <section>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Campaigns
            </h3>
            {selected.jobs.length ? (
              <ul className="mt-3 divide-y divide-line rounded-[16px] border border-line bg-surface">
                {selected.jobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex items-start justify-between gap-4 px-5 py-4"
                  >
                    <div>
                      <p className="font-medium text-ink">{job.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {job.businessName} · {job.waitingOn}
                      </p>
                    </div>
                    <p className="font-mono text-[13px] text-ink">
                      {rm(job.priceCredits)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">No campaigns yet.</p>
            )}
          </section>
        </div>
      )}
    </OversightShell>
  );
}

export default function CreatorPerformancePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
      <StaffGate>
        <CreatorPerformance />
      </StaffGate>
    </Suspense>
  );
}
