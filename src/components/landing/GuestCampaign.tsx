"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionCard, type ActionCardModel } from "@/components/ui/ActionCard";
import { Button } from "@/components/ui/Button";
import { ClarifyChips } from "@/components/ui/ClarifyChips";
import { useSession } from "@/lib/session";

type Step = 0 | 1 | 2;

export function GuestCampaign({ onClose }: { onClose: () => void }) {
  const { setGuestDraft } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [restaurant, setRestaurant] = useState("");
  const [goal, setGoal] = useState("");

  const cards: ActionCardModel[] = useMemo(
    () => [
      {
        id: "brief",
        kind: "brief",
        title: "Campaign brief",
        provenance: "ai",
        rows: [
          { label: "Restaurant", value: restaurant, provenance: "user" },
          { label: "Goal", value: goal, provenance: "user" },
          { label: "Angle", value: "First-visit tasting, not a shouty promo", provenance: "ai" },
        ],
        actions: [
          { id: "accept", label: "Accept" },
          { id: "edit", label: "Edit", variant: "ghost" },
          { id: "regen", label: "Regenerate", variant: "quiet" },
        ],
      },
      {
        id: "kol",
        kind: "kol",
        title: "Recommended KOL · Mei Lin",
        provenance: "predicted",
        score: { value: 91, label: "Match to this brief" },
        factors: [
          { label: "Market", value: "KL / Penang food" },
          { label: "Tone", value: "Fine dining, not hawker shout" },
          { label: "Language", value: "EN + 中文" },
        ],
        actions: [
          { id: "accept", label: "Accept" },
          { id: "compare", label: "Compare", variant: "ghost" },
        ],
      },
    ],
    [restaurant, goal],
  );

  function continueSignup() {
    setGuestDraft({
      id: "draft-guest",
      restaurantName: restaurant,
      goal,
    });
    router.push("/register/business");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-canvas/80 lg:items-center">
      <div
        className="flex max-h-[92dvh] w-full max-w-[430px] flex-col overflow-auto rounded-t-[24px] border border-line bg-canvas p-6 lg:rounded-[24px]"
        style={{
          transition: `transform var(--duration-sheet) var(--ease-drawer)`,
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Campaign builder
          </p>
          <button type="button" onClick={onClose} className="text-sm text-muted">
            Close
          </button>
        </div>

        {step === 0 ? (
          <ClarifyChips
            question="Which restaurant is this campaign for?"
            options={["As I Am by Chef Ton", "SOOD Penang", "I'll type it later"]}
            onPick={(v) => {
              setRestaurant(v === "I'll type it later" ? "To confirm" : v);
              setStep(1);
            }}
          />
        ) : null}

        {step === 1 ? (
          <ClarifyChips
            question="Should this content drive bookings, or something else?"
            options={["Bookings", "A new menu", "A promotion", "Awareness"]}
            onPick={(v) => {
              setGoal(v);
              setStep(2);
            }}
          />
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <p className="text-[17px] font-medium text-ink">
              A first brief. Nothing here is verified until you confirm the outlet.
            </p>
            {cards.map((card) => (
              <ActionCard key={card.id} card={card} />
            ))}
            <Button className="min-h-14 w-full" onClick={continueSignup}>
              Continue with this draft
            </Button>
            <p className="text-center text-xs text-muted">
              Creates your business workspace and saves the draft.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
