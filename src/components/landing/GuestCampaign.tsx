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
  liveMatchCopy,
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
  const match = liveMatchCopy(business);
  const board = step >= 2;

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
          board ? "max-w-[720px]" : "max-w-[430px]"
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
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_240px]">
            <div className="order-2 space-y-6 lg:order-1">
              <p className="max-w-[12ch] text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink lg:text-[44px]">
                {treatment.hook}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                AI suggestion · 9:16
              </p>
              <div className="flex flex-col items-start gap-3">
                <Button className="min-h-14 px-7" onClick={() => setStep(3)}>
                  See the match
                </Button>
                <button
                  type="button"
                  className="min-h-11 text-sm text-muted hover:text-ink"
                  onClick={() => setStep(1)}
                >
                  Edit
                </button>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <CampaignStoryboard brand={brand} treatment={treatment} />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid items-center gap-8 lg:grid-cols-[240px_1fr]">
            <KolMatchReel label={`${brand} reel`} />
            <div className="space-y-6">
              <div>
                <p className="text-[32px] font-semibold tracking-[-0.04em] text-ink">
                  {match.title}
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Predicted · awaiting a creator
                </p>
                <p className="mt-4 max-w-[28ch] text-[15px] leading-6 text-muted">
                  {match.body}
                </p>
              </div>
              <div className="flex flex-col items-start gap-3">
                <Button className="min-h-14 px-7" onClick={continueSignup}>
                  Continue with this draft
                </Button>
                <p className="text-xs text-muted">Log in to keep this draft.</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
