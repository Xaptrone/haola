"use client";

import { useState } from "react";
import type { CampaignTreatment } from "@/lib/campaign-treatment";

export function CampaignStoryboard({
  brand,
  treatment,
}: {
  brand: string;
  treatment: CampaignTreatment;
}) {
  const [beat, setBeat] = useState(0);
  const current = treatment.beats[beat] ?? treatment.beats[0];

  function cycle() {
    setBeat((i) => (i + 1) % treatment.beats.length);
  }

  return (
    <div className="mx-auto w-full max-w-[240px]">
      <button
        type="button"
        onClick={cycle}
        className="block w-full text-left"
        aria-label="Next beat"
      >
        <figure className="relative overflow-hidden rounded-[20px] border border-line bg-canvas">
          <div className="relative" style={{ aspectRatio: "9 / 16" }}>
            {beat === 0 ? (
              <>
                <div className="absolute inset-y-[12%] left-[14%] w-px bg-line" />
                <div className="absolute inset-y-[16%] right-[18%] left-[28%] rounded-[14px] bg-surface" />
              </>
            ) : null}
            {beat === 1 ? (
              <div className="absolute inset-0 bg-elevated" />
            ) : null}
            {beat === 2 ? (
              <>
                <div className="absolute inset-x-8 top-[18%] h-[44%] rounded-[16px] bg-surface" />
                <div className="absolute bottom-[34%] left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-accent" />
              </>
            ) : null}
            <p className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              {current.n} · {current.title}
            </p>
            <div className="absolute inset-x-4 top-[36%] text-center">
              <p className="text-[26px] font-semibold leading-[1.08] tracking-[-0.04em] text-ink">
                {beat === 1 ? brand : current.line}
              </p>
            </div>
            <span className="absolute bottom-5 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-canvas text-ink">
              <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" aria-hidden>
                <path d="M13.5 8L0.75 15.7942V0.205771L13.5 8Z" />
              </svg>
            </span>
          </div>
        </figure>
      </button>
      <div className="mt-4 flex justify-center gap-2">
        {treatment.beats.map((item, i) => (
          <button
            key={item.n}
            type="button"
            aria-label={item.title}
            onClick={() => setBeat(i)}
            className="flex min-h-11 min-w-11 items-center justify-center"
          >
            <span
              className={`block h-2 rounded-full ${
                i === beat ? "w-5 bg-ink" : "w-2 bg-line"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
