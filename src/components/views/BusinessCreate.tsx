"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ActionCard } from "@/components/ui/ActionCard";
import { ClarifyChips } from "@/components/ui/ClarifyChips";
import { PickOrCreateBusiness } from "@/components/ui/PickOrCreateBusiness";
import { PRICE } from "@/lib/credits";
import { uid } from "@/lib/ids";
import { rm, useMarketplace } from "@/lib/marketplace";
import { upsertBrand } from "@/lib/brands";
import { liveMatchCopy } from "@/lib/campaign-treatment";
import { newReviewJob, UNASSIGNED_CREATOR, UNASSIGNED_KOL } from "@/lib/review";
import { useSession } from "@/lib/session";
import type { CreateIntent, ReviewJob } from "@/lib/types";

type CreateStep =
  | "intent"
  | "business"
  | "goal"
  | "brief"
  | "ip-tone"
  | "ip-draft"
  | "pack-size";

function parseIntent(raw: string | null): CreateIntent | null {
  if (raw === "campaign" || raw === "brand-ip" || raw === "content-pack") {
    return raw;
  }
  return null;
}

function parseStep(raw: string | null): CreateStep {
  switch (raw) {
    case "intent":
    case "business":
    case "goal":
    case "brief":
    case "ip-tone":
    case "ip-draft":
    case "pack-size":
      return raw;
    default:
      return "intent";
  }
}

function ipCopy(tone: string) {
  if (tone.includes("Bold")) {
    return {
      look: "High contrast, short cuts, one colour pop",
      tone: "Bold and playful. Still never shouty.",
      dos: "Name the brand once. End on a clear next step.",
      donts: "No fake urgency. No invented reviews.",
      sampleLines: [
        "This is the room. Then the offer. Then you.",
        "Come once. You’ll know if it’s yours.",
      ],
    };
  }
  if (tone.includes("Calm")) {
    return {
      look: "Slow holds, natural light, quiet type",
      tone: "Calm expert. Trust first.",
      dos: "Show the space. One proof. One booking path.",
      donts: "No medical or legal claims. No before/after.",
      sampleLines: ["We keep it simple. You decide.", "Book when you’re ready."],
    };
  }
  return {
    look: "Warm light, precise framing, one hero object",
    tone: "Warm and precise. Never shouty.",
    dos: "Name the brand once. Paid partnership line.",
    donts: "No secret recipes. No invented prices.",
    sampleLines: [
      "Not loud. Just the thing, as it is.",
      "Come through — we’ll be here.",
    ],
  };
}

export function BusinessCreate({
  workspaceId,
  workspaceName,
  isOwner,
  brandOptions,
}: {
  workspaceId: string;
  workspaceName: string;
  isOwner: boolean;
  brandOptions: string[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const market = useMarketplace();
  const { session, patchBusiness } = useSession();
  const [createIntent, setCreateIntent] = useState<CreateIntent | null>(() =>
    parseIntent(params.get("intent")),
  );
  const [createStep, setCreateStep] = useState<CreateStep>(() =>
    parseStep(params.get("step")),
  );
  const [campaignBusiness, setCampaignBusiness] = useState(
    params.get("brand") ?? "",
  );
  const [campaignGoal, setCampaignGoal] = useState(params.get("goal") ?? "");
  const [ipTone, setIpTone] = useState("");
  const [packSize, setPackSize] = useState(3);
  const [creditError, setCreditError] = useState<string | null>(null);
  const match = liveMatchCopy(campaignBusiness);

  function queueSpend(kind: CreateIntent, title: string, amount: number) {
    market.addSpendRequest({
      id: uid("spd"),
      businessId: workspaceId,
      title,
      amount,
      kind,
      businessName: campaignBusiness || workspaceName,
      goal: campaignGoal || ipTone || `${packSize} assets`,
      assetCount: kind === "content-pack" ? packSize : undefined,
    });
    router.push("/work/business?tab=home");
  }

  function holdJobs(list: ReviewJob[]) {
    const total = list.reduce((s, j) => s + j.priceCredits, 0);
    if (market.businessBalance(workspaceId) < total) {
      setCreditError(
        `Insufficient credits. Need ${rm(total)}, have ${rm(market.businessBalance(workspaceId))}.`,
      );
      return false;
    }
    const result = market.createHeldJobs(list, session.displayName);
    if (!result.ok) {
      setCreditError(result.error);
      return false;
    }
    return true;
  }

  function spendOrQueue(kind: CreateIntent, list: ReviewJob[], title: string) {
    const amount = list.reduce((s, j) => s + j.priceCredits, 0);
    if (!isOwner) {
      queueSpend(kind, title, amount);
      return;
    }
    if (!holdJobs(list)) return;
    router.push("/work/business?tab=content");
  }

  function finishCampaign() {
    const job = newReviewJob({
      title: `${campaignBusiness} · ${campaignGoal}`,
      kind: "campaign",
      businessId: workspaceId,
      businessName: campaignBusiness,
      priceCredits: PRICE.campaign,
      script: `Open on the brand. Soft voice. Name ${campaignBusiness} once. Close on ${campaignGoal.toLowerCase()}. Paid partnership line at end.`,
    });
    patchBusiness({ guestDraft: null });
    spendOrQueue("campaign", [job], job.title);
  }

  function finishIp() {
    const copy = ipCopy(ipTone);
    const ipId = uid("ip");
    const pack = {
      id: ipId,
      businessId: workspaceId,
      businessName: campaignBusiness || workspaceName,
      brief: ipTone,
      look: copy.look,
      tone: copy.tone,
      dos: copy.dos,
      donts: copy.donts,
      sampleLines: copy.sampleLines,
      creatorName: UNASSIGNED_CREATOR,
      kolName: UNASSIGNED_KOL,
    };
    const job = newReviewJob({
      title: `Brand IP · ${campaignBusiness || workspaceName}`,
      kind: "brand-ip",
      businessId: workspaceId,
      businessName: campaignBusiness || workspaceName,
      priceCredits: PRICE.brandIp,
      script: `Locked brief: ${copy.tone} ${copy.dos} Sample: ${copy.sampleLines[0]}`,
      notes: [
        { name: "Look", note: copy.look },
        { name: "Do", note: copy.dos },
        { name: "Don’t", note: copy.donts },
      ],
    });
    if (!isOwner) {
      market.addIpJob({ ...pack, status: "confirmed" });
      queueSpend("brand-ip", job.title, job.priceCredits);
      return;
    }
    if (!holdJobs([job])) return;
    market.addIpJob({ ...pack, status: "handed_off" });
    router.push("/work/business?tab=content");
  }

  function finishPack() {
    const jobsToMake = Array.from({ length: packSize }, (_, i) =>
      newReviewJob({
        title: `${campaignBusiness} pack ${i + 1}/${packSize}`,
        kind: "content-pack",
        businessId: workspaceId,
        businessName: campaignBusiness,
        priceCredits: PRICE.packAsset,
        script: `Asset ${i + 1} of ${packSize}. Name ${campaignBusiness} once. Same voice across the pack.`,
      }),
    );
    spendOrQueue(
      "content-pack",
      jobsToMake,
      `${campaignBusiness} · ${packSize} assets`,
    );
  }

  return (
    <div className="space-y-4">
      {createStep === "intent" ? (
        <ClarifyChips
          question="What are we creating?"
          options={["Campaign", "Brand IP", "Content pack"]}
          onPick={(v) => {
            const map: Record<string, CreateIntent> = {
              Campaign: "campaign",
              "Brand IP": "brand-ip",
              "Content pack": "content-pack",
            };
            setCreateIntent(map[v]);
            setCreateStep("business");
          }}
        />
      ) : null}

      {createStep === "business" ? (
        <PickOrCreateBusiness
          question={
            brandOptions.length
              ? "Which business are we promoting?"
              : "What's the business called?"
          }
          existing={brandOptions}
          onPick={(v) => {
            setCampaignBusiness(v);
            patchBusiness({
              name: v,
              brands: upsertBrand(session.businessWorkspace?.brands, v),
            });
            if (createIntent === "brand-ip") setCreateStep("ip-tone");
            else if (createIntent === "content-pack") setCreateStep("pack-size");
            else setCreateStep("goal");
          }}
        />
      ) : null}

      {createIntent === "campaign" && createStep === "goal" ? (
        <ClarifyChips
          question="Should this content drive bookings, or something else?"
          options={["Bookings", "A new offer", "A promotion", "Awareness"]}
          onPick={(v) => {
            setCampaignGoal(v);
            setCreateStep("brief");
          }}
        />
      ) : null}

      {createIntent === "campaign" && createStep === "brief" ? (
        <div className="space-y-4">
          <p className="text-[17px] font-medium text-ink">
            A first brief. Confirm before we match KOLs.
          </p>
          <ActionCard
            card={{
              id: "brief",
              kind: "brief",
              title: "Campaign brief",
              provenance: "ai",
              rows: [
                { label: "Business", value: campaignBusiness, provenance: "user" },
                { label: "Goal", value: campaignGoal, provenance: "user" },
                {
                  label: "Angle",
                  value: "First-visit story, not a shouty promo",
                  provenance: "ai",
                },
                { label: "Hold", value: rm(PRICE.campaign), provenance: "verified" },
              ],
              actions: [
                {
                  id: "accept",
                  label: isOwner ? "Accept" : "Submit to owner",
                },
                { id: "edit", label: "Edit", variant: "ghost" },
              ],
            }}
            onAction={(actionId) => {
              if (actionId === "accept") finishCampaign();
              if (actionId === "edit") setCreateStep("business");
            }}
          />
          <ActionCard
            card={{
              id: "kol",
              kind: "kol",
              title: match.title,
              provenance: "predicted",
              body: match.body,
              rows: [
                { label: "KOL", value: UNASSIGNED_KOL, provenance: "predicted" },
              ],
              actions: [],
            }}
          />
        </div>
      ) : null}

      {createIntent === "brand-ip" && createStep === "ip-tone" ? (
        <ClarifyChips
          question="What should this personality feel like?"
          options={["Warm & precise", "Bold & playful", "Calm expert"]}
          onPick={(v) => {
            setIpTone(v);
            setCreateStep("ip-draft");
          }}
        />
      ) : null}

      {createIntent === "brand-ip" && createStep === "ip-draft" ? (
        <ActionCard
          card={{
            id: "ip",
            kind: "ip",
            title: "Draft IP pack",
            provenance: "ai",
            body: "Business owns this brief once confirmed. Creator executes. Not published.",
            rows: [
              { label: "Look", value: ipCopy(ipTone).look, provenance: "ai" },
              { label: "Tone", value: ipCopy(ipTone).tone, provenance: "ai" },
              { label: "Do", value: ipCopy(ipTone).dos, provenance: "ai" },
              { label: "Don’t", value: ipCopy(ipTone).donts, provenance: "ai" },
              { label: "Sample", value: ipCopy(ipTone).sampleLines[0], provenance: "ai" },
              { label: "Hold", value: rm(PRICE.brandIp), provenance: "verified" },
            ],
            actions: [
              {
                id: "accept",
                label: isOwner ? "Confirm and send to creator" : "Submit to owner",
              },
              { id: "edit", label: "Edit", variant: "ghost" },
            ],
          }}
          onAction={(id) => {
            if (id === "accept") finishIp();
            if (id === "edit") setCreateStep("ip-tone");
          }}
        />
      ) : null}

      {createIntent === "content-pack" && createStep === "pack-size" ? (
        <ClarifyChips
          question="How many assets in this pack?"
          options={["3 assets", "5 assets"]}
          onPick={(v) => {
            setPackSize(v.startsWith("5") ? 5 : 3);
            setCreateStep("brief");
          }}
        />
      ) : null}

      {createIntent === "content-pack" && createStep === "brief" ? (
        <ActionCard
          card={{
            id: "pack",
            kind: "brief",
            title: "Content pack",
            provenance: "ai",
            body: `${packSize} jobs, same voice. Each one runs the 3-step pipeline.`,
            rows: [
              { label: "Business", value: campaignBusiness, provenance: "user" },
              { label: "Assets", value: String(packSize), provenance: "user" },
              {
                label: "Hold",
                value: rm(PRICE.packAsset * packSize),
                provenance: "verified",
              },
            ],
            actions: [
              { id: "accept", label: isOwner ? "Open pack" : "Submit to owner" },
              { id: "edit", label: "Edit", variant: "ghost" },
            ],
          }}
          onAction={(id) => {
            if (id === "accept") finishPack();
            if (id === "edit") setCreateStep("pack-size");
          }}
        />
      ) : null}

      {creditError ? (
        <ActionCard
          card={{
            id: "credits",
            kind: "payment",
            title: "Need credits",
            provenance: "verified",
            body: `${creditError} Ask fxgen to load credits after payment.`,
            actions: [{ id: "ok", label: "Got it" }],
          }}
          onAction={() => setCreditError(null)}
        />
      ) : null}
    </div>
  );
}
