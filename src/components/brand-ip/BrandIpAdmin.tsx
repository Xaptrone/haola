"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BrandIpOfferEditor } from "@/components/brand-ip/BrandIpOfferEditor";
import { BrandIpOfferView } from "@/components/brand-ip/BrandIpOfferView";
import { cloneOffer, DEFAULT_IP_TONE, ipCopy, offerHold } from "@/lib/brand-ip";
import { rm, useMarketplace } from "@/lib/marketplace";
import type { BrandIpJob, BrandIpOffer } from "@/lib/types";

export function BrandIpAdmin() {
  const market = useMarketplace();
  const [selectedId, setSelectedId] = useState<"template" | string>("template");
  const jobs = market.ipJobs;
  const selectedJob = jobs.find((job) => job.id === selectedId) ?? null;
  const offer = selectedJob?.offer ?? market.brandIpOffer;
  const previewJob = useMemo(
    () => previewBrief(selectedJob),
    [selectedJob],
  );

  function save(next: BrandIpOffer) {
    if (selectedJob) {
      market.patchIpJob(selectedJob.id, {
        offer: next,
        creatorName: next.creatorName,
        kolName: next.kolName,
      });
      return;
    }
    market.setBrandIpOffer(next);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      <div>
        <p className="text-sm leading-6 text-muted">
          This is the package a business sees before they hold credits. Edit
          price, deliverables, and samples here — including for a specific draft.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Choice
            current={selectedId === "template"}
            onClick={() => setSelectedId("template")}
            label="Template"
          />
          {jobs.map((job) => (
            <Choice
              key={job.id}
              current={selectedId === job.id}
              onClick={() => setSelectedId(job.id)}
              label={`${job.businessName} · ${job.status}`}
            />
          ))}
        </div>
        <div className="mt-8">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {selectedJob
              ? `This case · ${rm(offerHold(selectedJob.offer))}`
              : "Template every new Brand IP starts from"}
          </p>
          <BrandIpOfferEditor
            key={selectedJob?.id ?? "template"}
            offer={offer}
            onSave={save}
            saveLabel={selectedJob ? "Save this case" : "Save template"}
          />
          {selectedJob ? (
            <button
              type="button"
              className="mt-4 text-sm text-muted hover:text-ink"
              onClick={() =>
                market.patchIpJob(selectedJob.id, {
                  offer: cloneOffer(market.brandIpOffer),
                })
              }
            >
              Reset this case from template
            </button>
          ) : null}
        </div>
      </div>
      <div>
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          What the business sees
        </p>
        <BrandIpOfferView
          brandName={selectedJob?.businessName ?? "Your business"}
          offer={offer}
          job={previewJob}
          confirmLabel="Confirm and send to creator"
          hideActions
        />
        <Link
          href="/work/business?preview=1&tab=create&intent=brand-ip&step=ip-draft&brand=As%20I%20Am%20by%20Chef%20Ton"
          className="mt-4 inline-flex min-h-11 items-center text-sm text-muted hover:text-ink"
        >
          Open as business
        </Link>
      </div>
    </div>
  );
}

function previewBrief(job: BrandIpJob | null) {
  if (job) {
    return {
      look: job.look,
      tone: job.tone,
      dos: job.dos,
      donts: job.donts,
      sampleLines: job.sampleLines,
    };
  }
  const copy = ipCopy(DEFAULT_IP_TONE);
  return {
    look: copy.look,
    tone: copy.tone,
    dos: copy.dos,
    donts: copy.donts,
    sampleLines: copy.sampleLines,
  };
}

function Choice({
  current,
  label,
  onClick,
}: {
  current: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-full px-4 text-sm ${
        current
          ? "bg-accent text-ink"
          : "border border-line bg-elevated text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
