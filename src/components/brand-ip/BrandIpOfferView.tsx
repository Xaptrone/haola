"use client";

import { Button } from "@/components/ui/Button";
import { ProvenanceMark } from "@/components/ui/ProvenanceMark";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { BrandIpMediaStage } from "@/components/brand-ip/BrandIpMedia";
import { afterConfirmSteps, offerHold } from "@/lib/brand-ip";
import { rm } from "@/lib/credits";
import type { BrandIpJob, BrandIpOffer } from "@/lib/types";

const fieldClass =
  "min-h-14 w-full rounded-[14px] border border-line bg-canvas px-4 text-ink outline-none placeholder:text-muted";

export function BrandIpOfferView({
  brandName,
  offer,
  job,
  confirmLabel,
  balance,
  editing,
  onConfirm,
  onEdit,
  onCancelEdit,
  onSaveBrief,
  hideActions,
}: {
  brandName: string;
  offer: BrandIpOffer;
  job: Pick<BrandIpJob, "look" | "tone" | "dos" | "donts" | "sampleLines">;
  confirmLabel: string;
  balance?: number;
  editing?: boolean;
  onConfirm?: () => void;
  onEdit?: () => void;
  onCancelEdit?: () => void;
  onSaveBrief?: (next: {
    look: string;
    tone: string;
    dos: string;
    donts: string;
    sample: string;
  }) => void;
  hideActions?: boolean;
}) {
  const hold = offerHold(offer);
  const short =
    typeof balance === "number" ? Math.max(0, hold - balance) : 0;
  const then = afterConfirmSteps(offer.afterConfirm);
  const sample = job.sampleLines[0] ?? "";

  return (
    <article className="w-full rounded-[16px] border border-line bg-surface p-5">
      <header className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[22px] font-medium tracking-tight text-ink">
            {offer.headline}
          </h2>
          <ProvenanceMark kind="manager" />
        </div>
        <p className="mt-2 text-sm leading-6 text-muted">{offer.promise}</p>
        <p className="mt-3 text-sm text-ink">{brandName}</p>
      </header>

      <BrandIpMediaStage media={offer.media} />

      <section className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          You get
        </p>
        <ul className="mt-3 space-y-2">
          {offer.included.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-ink">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {offer.extraInfo ? (
          <p className="mt-4 text-sm leading-6 text-muted">{offer.extraInfo}</p>
        ) : null}
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Locked for this brand
          </p>
          <ProvenanceMark kind="ai" />
        </div>
        {editing && onSaveBrief ? (
          <BriefEditor
            look={job.look}
            tone={job.tone}
            dos={job.dos}
            donts={job.donts}
            sample={sample}
            onCancel={onCancelEdit}
            onSave={onSaveBrief}
          />
        ) : (
          <dl className="mt-3 space-y-3">
            <BriefRow label="Look" value={job.look} />
            <BriefRow label="Tone" value={job.tone} />
            <BriefRow label="Do" value={job.dos} />
            <BriefRow label="Don’t" value={job.donts} />
            {sample ? <BriefRow label="Sample" value={sample} /> : null}
          </dl>
        )}
      </section>

      <section className="mt-6 rounded-[14px] border border-line bg-canvas px-4 py-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Hold
            </p>
            <p className="mt-2 font-mono text-[28px] tracking-tight text-ink">
              {rm(hold)}
            </p>
          </div>
          <ProvenanceMark kind="verified" />
        </div>
        <ul className="mt-4 space-y-2">
          {offer.lines.map((line) => (
            <li
              key={line.id}
              className="flex justify-between gap-4 text-sm text-ink"
            >
              <span className="text-muted">{line.label}</span>
              <span className="font-mono text-[13px]">{rm(line.credits)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          {offer.turnaround} · {offer.creatorName} × {offer.kolName}
        </p>
        {typeof balance === "number" ? (
          <p className="mt-2 text-sm text-muted">
            {short > 0
              ? `Need ${rm(short)} more credits before this hold.`
              : `${rm(balance)} available. ${rm(hold)} moves to escrow.`}
          </p>
        ) : null}
      </section>

      <section className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Then
        </p>
        <ol className="mt-3 space-y-2">
          {then.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm leading-6 text-ink">
              <span className="font-mono text-[12px] text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm leading-6 text-muted">{offer.ownership}</p>
      </section>

      <div className="mt-6">
        <ScoreRing value={78} label="Avatar Market-Fit for this brand" />
      </div>

      {editing || hideActions ? null : (
        <div className="mt-6 flex flex-wrap gap-2">
          <Button className="min-h-14 px-6" onClick={onConfirm} disabled={short > 0}>
            {confirmLabel}
          </Button>
          {onEdit ? (
            <Button variant="ghost" className="min-h-14" onClick={onEdit}>
              Edit brief
            </Button>
          ) : null}
        </div>
      )}
    </article>
  );
}

function BriefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[70%] text-right text-ink">{value}</dd>
    </div>
  );
}

function BriefEditor({
  look,
  tone,
  dos,
  donts,
  sample,
  onSave,
  onCancel,
}: {
  look: string;
  tone: string;
  dos: string;
  donts: string;
  sample: string;
  onSave: (next: {
    look: string;
    tone: string;
    dos: string;
    donts: string;
    sample: string;
  }) => void;
  onCancel?: () => void;
}) {
  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        onSave({
          look: String(data.get("look") ?? ""),
          tone: String(data.get("tone") ?? ""),
          dos: String(data.get("dos") ?? ""),
          donts: String(data.get("donts") ?? ""),
          sample: String(data.get("sample") ?? ""),
        });
      }}
    >
      <label className="block text-sm text-muted">
        Look
        <input name="look" defaultValue={look} className={`${fieldClass} mt-2`} />
      </label>
      <label className="block text-sm text-muted">
        Tone
        <input name="tone" defaultValue={tone} className={`${fieldClass} mt-2`} />
      </label>
      <label className="block text-sm text-muted">
        Do
        <input name="dos" defaultValue={dos} className={`${fieldClass} mt-2`} />
      </label>
      <label className="block text-sm text-muted">
        Don’t
        <input name="donts" defaultValue={donts} className={`${fieldClass} mt-2`} />
      </label>
      <label className="block text-sm text-muted">
        Sample line
        <input name="sample" defaultValue={sample} className={`${fieldClass} mt-2`} />
      </label>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" className="min-h-14">
          Save brief
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" className="min-h-14" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
