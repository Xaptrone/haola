"use client";

import { useState } from "react";
import { ActionCard, type ActionCardModel } from "@/components/ui/ActionCard";
import { ClarifyChips } from "@/components/ui/ClarifyChips";
import { CREATOR_MARKETS } from "@/lib/creator-registration";
import { uid } from "@/lib/ids";
import {
  KOL_AUDIENCES,
  KOL_CRAFTS,
  KOL_VOICES,
  proposeKol,
} from "@/lib/kol-brief";
import type { Kol } from "@/lib/types";

type Step = "market" | "audience" | "craft" | "voice" | "done";

function Back({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-12 text-sm text-muted transition-colors duration-150 hover:text-ink"
    >
      {label}
    </button>
  );
}

export function KolCreateFlow({
  defaultMarket,
  onAccept,
  onCancel,
}: {
  defaultMarket?: string;
  onAccept: (kol: Kol) => void;
  onCancel?: () => void;
}) {
  const skippedMarket = Boolean(defaultMarket);
  const [step, setStep] = useState<Step>(skippedMarket ? "audience" : "market");
  const [brief, setBrief] = useState({
    market: defaultMarket ?? "",
    audience: "",
    craft: "",
    voice: "",
  });

  const proposal = proposeKol(brief);
  const card: ActionCardModel = {
    id: "avatar",
    kind: "avatar",
    title: `Avatar proposal · ${proposal.name}`,
    provenance: "ai",
    body: proposal.body,
    rows: [
      { label: "Market", value: brief.market, provenance: "user" },
      { label: "Audience", value: brief.audience, provenance: "user" },
      { label: "Known for", value: brief.craft, provenance: "user" },
      { label: "Voice", value: brief.voice, provenance: "user" },
    ],
    score: { value: proposal.amf, label: "Avatar Market-Fit" },
    factors: [
      { label: "Market", value: brief.market },
      { label: "Audience fit", value: brief.audience },
      { label: "Craft", value: brief.craft },
      { label: "Language", value: proposal.language },
    ],
    actions: [
      { id: "accept", label: "Accept" },
      { id: "edit", label: "Edit", variant: "ghost" },
      { id: "regen", label: "Regenerate", variant: "quiet" },
    ],
  };

  function accept() {
    onAccept({
      id: uid("kol"),
      name: proposal.name,
      market: brief.market,
      audience: brief.audience,
      categories: proposal.categories,
      language: proposal.language,
      personality: proposal.personality,
      amf: proposal.amf,
    });
  }

  switch (step) {
    case "market":
      return (
        <div className="space-y-2">
          <ClarifyChips
            question="Which market should this KOL serve?"
            options={[...CREATOR_MARKETS]}
            onPick={(v) => {
              setBrief((b) => ({ ...b, market: v }));
              setStep("audience");
            }}
          />
          {onCancel ? <Back onClick={onCancel} label="Not now" /> : null}
        </div>
      );
    case "audience": {
      const finished = Boolean(brief.voice);
      const canLeave = finished || !skippedMarket || Boolean(onCancel);
      return (
        <div className="space-y-2">
          <ClarifyChips
            question="Who should follow this personality?"
            options={[...KOL_AUDIENCES]}
            onPick={(v) => {
              setBrief((b) => ({ ...b, audience: v }));
              setStep(finished ? "done" : "craft");
            }}
          />
          {canLeave ? (
            <Back
              onClick={() => {
                if (finished) setStep("done");
                else if (skippedMarket) onCancel?.();
                else setStep("market");
              }}
              label={finished || !skippedMarket ? "Back" : "Not now"}
            />
          ) : null}
        </div>
      );
    }
    case "craft":
      return (
        <div className="space-y-2">
          <ClarifyChips
            question="What should they be known for?"
            options={[...KOL_CRAFTS]}
            onPick={(v) => {
              setBrief((b) => ({ ...b, craft: v }));
              setStep("voice");
            }}
          />
          <Back onClick={() => setStep("audience")} />
        </div>
      );
    case "voice":
      return (
        <div className="space-y-2">
          <ClarifyChips
            question="How should they sound?"
            options={[...KOL_VOICES]}
            onPick={(v) => {
              setBrief((b) => ({ ...b, voice: v }));
              setStep("done");
            }}
          />
          <Back onClick={() => setStep("craft")} />
        </div>
      );
    case "done":
      return (
        <ActionCard
          card={card}
          onAction={(id) => {
            if (id === "accept") accept();
            if (id === "edit") setStep("audience");
            if (id === "regen") setStep("craft");
          }}
        />
      );
    default: {
      const _never: never = step;
      return _never;
    }
  }
}
