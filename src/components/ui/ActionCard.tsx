"use client";

import { Button } from "./Button";
import { ProvenanceMark } from "./ProvenanceMark";
import { ScoreRing } from "./ScoreRing";
import type { Provenance } from "@/lib/types";

export type CardKind =
  | "avatar"
  | "amf"
  | "brief"
  | "kol"
  | "angle"
  | "qc"
  | "revision"
  | "approval"
  | "payment"
  | "restaurant";

export type ActionCardModel = {
  id: string;
  kind: CardKind;
  title: string;
  provenance: Provenance;
  body?: string;
  rows?: { label: string; value: string; provenance?: Provenance }[];
  score?: { value: number; label: string };
  factors?: { label: string; value: string }[];
  actions: { id: string; label: string; variant?: "primary" | "ghost" | "quiet" }[];
};

export function ActionCard({
  card,
  onAction,
}: {
  card: ActionCardModel;
  onAction?: (actionId: string, cardId: string) => void;
}) {
  return (
    <article className="w-full rounded-[16px] border border-line bg-surface p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-[17px] font-medium tracking-tight text-ink">
          {card.title}
        </h3>
        <ProvenanceMark kind={card.provenance} />
      </header>
      {card.body ? (
        <p className="mb-4 text-sm leading-6 text-muted">{card.body}</p>
      ) : null}
      {card.score ? (
        <div className="mb-4">
          <ScoreRing value={card.score.value} label={card.score.label} />
        </div>
      ) : null}
      {card.rows?.length ? (
        <dl className="mb-4 space-y-2">
          {card.rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4 text-sm">
              <dt className="text-muted">{row.label}</dt>
              <dd className="text-right text-ink">
                {row.value}
                {row.provenance ? (
                  <span className="ml-2 align-middle">
                    <ProvenanceMark kind={row.provenance} />
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {card.factors?.length ? (
        <details className="mb-4">
          <summary className="cursor-pointer text-xs text-muted">
            Inspect factors
          </summary>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {card.factors.map((f) => (
              <li key={f.label} className="flex justify-between gap-3">
                <span className="text-muted">{f.label}</span>
                <span>{f.value}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {card.actions.length ? (
        <div className="flex flex-wrap gap-2">
          {card.actions.map((a, i) => (
            <Button
              key={a.id}
              variant={a.variant ?? (i === 0 ? "primary" : "ghost")}
              className="min-h-11"
              onClick={() => onAction?.(a.id, card.id)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
