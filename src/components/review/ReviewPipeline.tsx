"use client";

import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { VerticalVideo } from "@/components/ui/VerticalVideo";
import { useDesktop } from "@/lib/use-desktop";
import {
  applyAdminDecision,
  applyBusinessDecision,
  applyCreatorAdvance,
  canBusinessRevise,
  linkCreator,
  PIPELINE_STEPS,
  waitingLabel,
  waitingTone,
} from "@/lib/review";
import type { ReviewJob } from "@/lib/types";

export function ReviewPipeline({
  job,
  actor,
  onChange,
  onFinalApprove,
}: {
  job: ReviewJob;
  actor: "business" | "creator" | "admin";
  onChange: (next: ReviewJob) => void;
  onFinalApprove?: (next: ReviewJob) => void;
}) {
  const desktop = useDesktop();
  const showVideo = job.step === "rough" || job.step === "edited";
  const caption =
    job.step === "edited" ? job.editedCaption : job.roughCaption;

  function decide(decision: "approve" | "revise" | "escalate") {
    const next = applyBusinessDecision(job, decision);
    if (decision === "approve" && job.step === "edited" && next.waitingOn === "done") {
      onFinalApprove?.(next);
      return;
    }
    onChange(next);
  }

  const stage = (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {job.kind.replaceAll("-", " ")} · {job.businessName}
        </p>
        <h1 className="text-2xl font-medium tracking-tight">{job.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone={waitingTone(job.waitingOn)}>
            {waitingLabel(job.waitingOn)}
          </StatusChip>
          <p className="text-xs text-muted">
            {job.creatorName} · {job.kolName} · {job.revisionsUsed}/{job.maxRevisions}{" "}
            revisions
          </p>
        </div>
      </header>

      <ol className="grid grid-cols-3 gap-2">
        {PIPELINE_STEPS.map((step, i) => {
          const current = PIPELINE_STEPS.findIndex((s) => s.id === job.step);
          const done = i < current || job.waitingOn === "done";
          const on = step.id === job.step && job.waitingOn !== "done";
          return (
            <li
              key={step.id}
              className={`rounded-[12px] border px-3 py-3 ${
                on ? "border-accent/40 bg-elevated" : "border-line"
              }`}
            >
              <p className="font-mono text-[10px] text-muted">{step.label}</p>
              <p className={`mt-1 text-xs ${done || on ? "text-ink" : "text-muted"}`}>
                {step.detail}
              </p>
            </li>
          );
        })}
      </ol>

      {job.step === "script" ? (
        <div className="space-y-4 rounded-[16px] border border-line bg-surface p-5">
          <p className="text-sm leading-6 text-ink">{job.script}</p>
          <ul className="space-y-2 text-sm">
            {job.notes.map((n) => (
              <li key={n.name} className="flex justify-between gap-4">
                <span className="text-muted">{n.name}</span>
                <span className="text-right text-ink">{n.note}</span>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            References
          </p>
          <p className="text-sm text-ink">{job.photoLabels.join(" · ")}</p>
        </div>
      ) : null}

      {actor === "admin" ? (
        <div className="space-y-2">
          <p className="text-sm text-muted">Link creator</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => onChange(linkCreator(job, "Aisha", "Mei Lin"))}
            >
              Aisha · Mei Lin
            </Button>
          </div>
        </div>
      ) : null}

      {job.waitingOn === actor || actor === "admin" ? (
        <div className="flex flex-wrap gap-2">
          {actor === "business" ? (
            <>
              <Button className="min-h-14 flex-1" onClick={() => decide("approve")}>
                Approve
              </Button>
              {canBusinessRevise(job) ? (
                <Button
                  variant="ghost"
                  className="min-h-14 flex-1"
                  onClick={() => decide("revise")}
                >
                  Request revision
                </Button>
              ) : null}
              <Button
                variant="quiet"
                className="min-h-14"
                onClick={() => decide("escalate")}
              >
                Escalate
              </Button>
            </>
          ) : null}
          {actor === "creator" && job.waitingOn === "creator" ? (
            <Button
              className="min-h-14 w-full"
              onClick={() => onChange(applyCreatorAdvance(job))}
            >
              {job.step === "script"
                ? "Submit script"
                : job.step === "rough"
                  ? "Replace AI rough"
                  : "Submit edited video"}
            </Button>
          ) : null}
          {actor === "admin" ? (
            <>
              <Button
                className="min-h-14 flex-1"
                onClick={() => {
                  const next = applyAdminDecision(job, "approve");
                  if (job.step === "edited" && next.waitingOn === "done") {
                    onFinalApprove?.(next);
                    return;
                  }
                  onChange(next);
                }}
              >
                Approve step
              </Button>
              <Button
                variant="ghost"
                className="min-h-14 flex-1"
                onClick={() => onChange(applyAdminDecision(job, "return_creator"))}
              >
                Return to creator
              </Button>
              <Button
                variant="quiet"
                className="min-h-14"
                onClick={() => onChange(applyAdminDecision(job, "take_queue"))}
              >
                Take into queue
              </Button>
            </>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted">{waitingLabel(job.waitingOn)}.</p>
      )}

      <ul className="space-y-2">
        {job.adminLog.map((line) => (
          <li key={line.id} className="text-sm text-muted">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
              {line.at}
            </span>
            <span className="ml-2 text-ink">{line.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  if (desktop && showVideo) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(240px,38%)_1fr]">
        <div className="flex justify-center">
          <VerticalVideo caption={caption} className="w-full max-w-[280px]" />
        </div>
        {stage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showVideo ? (
        <VerticalVideo caption={caption} className="mx-auto w-full max-w-[280px]" />
      ) : null}
      {stage}
    </div>
  );
}
