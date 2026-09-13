"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ClarifyChips } from "@/components/ui/ClarifyChips";
import { PickOrCreateBusiness } from "@/components/ui/PickOrCreateBusiness";
import { CampaignStoryboard } from "@/components/landing/CampaignStoryboard";
import { KolMatchReel } from "@/components/landing/KolMatchReel";
import {
  campaignTreatment,
  displayBrandName,
} from "@/lib/campaign-treatment";
import { useSession } from "@/lib/session";

type Step = 0 | 1 | 2 | 3;

export function GuestCampaign({ onClose }: { onClose: () => void }) {
  const { setGuestDraft } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [business, setBusiness] = useState("");
  const [goal, setGoal] = useState("");

  const brand = displayBrandName(business);
  const treatment = campaignTreatment(business, goal);
  const wide = step >= 2;

  function continueSignup() {
    setGuestDraft({
      id: "draft-guest",
      businessName: business,
      goal,
      story: treatment.hook,
    });
    router.push("/login?intent=business");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-canvas/90 lg:items-center">
      <div
        className={`flex max-h-[92dvh] w-full flex-col overflow-auto rounded-t-[24px] border border-line bg-canvas p-6 lg:rounded-[24px] ${
          wide ? "max-w-[680px]" : "max-w-[430px]"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            {step === 3 ? "Match" : "Campaign"}
          </p>
          <button type="button" onClick={onClose} className="min-h-11 text-sm text-muted">
            Close
          </button>
        </div>

        {step === 0 ? (
          <div className="space-y-3">
            <PickOrCreateBusiness
              question="What's the business called?"
              existing={[]}
              onPick={(name) => {
                setBusiness(name);
                setStep(1);
              }}
            />
            <button
              type="button"
              className="min-h-11 text-sm text-muted hover:text-ink"
              onClick={() => {
                setBusiness("To confirm");
                setStep(1);
              }}
            >
              I&apos;ll type it later
            </button>
          </div>
        ) : null}

        {step === 1 ? (
          <ClarifyChips
            question="Should this content drive bookings, or something else?"
            options={["Bookings", "A new offer", "A promotion", "Awareness"]}
            onPick={(v) => {
              setGoal(v);
              setStep(2);
            }}
          />
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <p className="max-w-[16ch] text-[32px] font-semibold leading-[1.08] tracking-[-0.04em] text-ink">
              {treatment.hook}
            </p>
            <CampaignStoryboard brand={brand} treatment={treatment} />
            <Button className="min-h-14 w-full" onClick={() => setStep(3)}>
              See the match
            </Button>
            <button
              type="button"
              className="min-h-11 w-full text-sm text-muted hover:text-ink"
              onClick={() => setStep(1)}
            >
              Edit
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <KolMatchReel />
            <div className="text-center">
              <p className="font-mono text-[28px] tabular-nums text-ink">91</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Predicted match
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Premium, not shouty. Same market as {brand}.
              </p>
            </div>
            <Button className="min-h-14 w-full" onClick={continueSignup}>
              Continue with this draft
            </Button>
            <p className="text-center text-xs text-muted">
              Log in to keep this draft.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
