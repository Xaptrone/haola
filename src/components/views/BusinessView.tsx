"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ActionFeed } from "@/components/feed/ActionFeed";
import { ReviewPipeline } from "@/components/review/ReviewPipeline";
import { BalanceLine, LedgerList } from "@/components/credits/LedgerPanel";
import { CommandShell, MobileAppShell } from "@/components/shells/WorkShells";
import { ActionCard } from "@/components/ui/ActionCard";
import { ClarifyChips } from "@/components/ui/ClarifyChips";
import { PRICE, businessWallet } from "@/lib/credits";
import { uid } from "@/lib/ids";
import { rm, useMarketplace } from "@/lib/marketplace";
import { businessNav } from "@/lib/nav";
import { newReviewJob, SAMPLE_BRANDS } from "@/lib/review";
import { useSession } from "@/lib/session";
import type { BusinessSeat, ReviewJob } from "@/lib/types";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { NeedWorkspace } from "@/components/auth/NeedWorkspace";
import { BusinessCreate } from "./BusinessCreate";

export function BusinessView() {
  const { session, patchBusiness, loadPreset, ready } = useSession();
  const market = useMarketplace();
  const router = useRouter();
  const tab = useSearchParams().get("tab") ?? "home";
  const flowQ = useSearchParams().get("flow");
  const jobQ = useSearchParams().get("job");
  const preview = useSearchParams().get("preview") === "1";
  const ws = session.businessWorkspace;
  const [step, setStep] = useState<"idle" | "business" | "goal">(
    flowQ === "setup" ? "business" : "idle",
  );
  const [creditError, setCreditError] = useState<string | null>(null);

  const jobs = useMemo(
    () => (ws ? market.reviews.filter((j) => j.businessId === ws.id) : []),
    [market.reviews, ws],
  );
  const waitingBusiness = jobs.filter((j) => j.waitingOn === "business");
  const spendMine = ws
    ? market.spendRequests.filter((s) => s.businessId === ws.id)
    : [];
  const selected = jobs.find((j) => j.id === jobQ) ?? null;
  const ledgerMine = ws
    ? market.ledger.filter(
        (e) =>
          e.debitWallet === businessWallet(ws.id) ||
          e.creditWallet === businessWallet(ws.id),
      )
    : [];

  useEffect(() => {
    if (!ready || !preview) return;
    if (session.role !== "business") loadPreset("business-ready");
  }, [ready, preview, session.role, loadPreset]);

  if (!ready) return <div className="min-h-dvh bg-canvas" />;

  if (!ws || session.role !== "business") {
    if (preview) return <div className="min-h-dvh bg-canvas" />;
    return <NeedWorkspace kind="business" />;
  }

  const needsSetup = ws.onboardingStage !== "ready" && !ws.guestDraft;
  const showDraft = Boolean(ws.guestDraft) && step !== "business";
  const isOwner = (ws.seat ?? "owner") === "owner";
  const brandOptions = ws.brands?.length
    ? ws.brands.map((b) => b.name)
    : [...SAMPLE_BRANDS];

  function holdJobs(list: ReviewJob[]) {
    if (!ws) return false;
    const total = list.reduce((s, j) => s + j.priceCredits, 0);
    if (market.businessBalance(ws.id) < total) {
      setCreditError(
        `Insufficient credits. Need ${rm(total)}, have ${rm(market.businessBalance(ws.id))}.`,
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

  function approveSpend(id: string) {
    if (!ws) return;
    const req = spendMine.find((s) => s.id === id);
    if (!req) return;
    if (req.kind === "campaign") {
      const job = newReviewJob({
        title: req.title,
        kind: "campaign",
        businessId: ws.id,
        businessName: req.businessName,
        priceCredits: req.amount,
        script: `Open on the brand. Name ${req.businessName} once. Close on ${req.goal.toLowerCase()}.`,
      });
      if (!holdJobs([job])) return;
    } else if (req.kind === "brand-ip") {
      const job = newReviewJob({
        title: req.title,
        kind: "brand-ip",
        businessId: ws.id,
        businessName: req.businessName,
        priceCredits: req.amount,
        script: `Locked IP brief for ${req.businessName}.`,
      });
      if (!holdJobs([job])) return;
    } else if (req.kind === "content-pack") {
      const n = req.assetCount ?? 3;
      const list = Array.from({ length: n }, (_, i) =>
        newReviewJob({
          title: `${req.businessName} pack ${i + 1}/${n}`,
          kind: "content-pack",
          businessId: ws.id,
          businessName: req.businessName,
          priceCredits: PRICE.packAsset,
          script: `Asset ${i + 1} of ${n}.`,
        }),
      );
      if (!holdJobs(list)) return;
    } else {
      const _exhaustive: never = req.kind;
      return _exhaustive;
    }
    market.removeSpendRequest(id);
    router.push("/work/business?tab=content");
  }

  const heading =
    tab === "create"
      ? "Create"
      : tab === "content"
        ? "Content"
        : tab === "campaigns"
          ? "Campaigns"
          : tab === "business"
            ? "Business"
            : "Home";

  const body = (
    <>
      {needsSetup && step === "idle" ? (
        <ClarifyChips
          question="Which business is this workspace for?"
          options={[...SAMPLE_BRANDS]}
          onPick={(v) => {
            patchBusiness({
              name: v,
              onboardingStage: "goal",
              brands: [
                {
                  id: uid("brd"),
                  name: v,
                  city: "Malaysia",
                  outlets: "To confirm",
                },
              ],
            });
            market.ensureParty({ id: ws.id, name: v, kind: "business" });
            setStep("goal");
          }}
        />
      ) : null}
      {step === "goal" ? (
        <ClarifyChips
          question="What should we do first?"
          options={["Drive bookings", "Launch an offer", "A promotion", "Awareness"]}
          onPick={() => {
            patchBusiness({
              onboardingStage: "ready",
              feed: [
                {
                  id: "first",
                  title: "Create your first campaign",
                  detail: "AI already has the business.",
                  href: "/work/business?tab=create",
                  tone: "action",
                },
              ],
            });
            setStep("idle");
          }}
        />
      ) : null}
      {showDraft ? (
        <div className="space-y-4">
          <h1 className="text-2xl font-medium tracking-tight">Continue your campaign</h1>
          <ActionCard
            card={{
              id: "brief",
              kind: "brief",
              title: "Campaign brief",
              provenance: "ai",
              rows: [
                { label: "Business", value: ws.guestDraft!.businessName, provenance: "user" },
                { label: "Goal", value: ws.guestDraft!.goal, provenance: "user" },
              ],
              actions: [
                { id: "continue", label: "Continue" },
                { id: "edit", label: "Edit", variant: "ghost" },
              ],
            }}
            onAction={(actionId) => {
              if (actionId === "continue") {
                const brand = encodeURIComponent(ws.guestDraft!.businessName);
                const goal = encodeURIComponent(ws.guestDraft!.goal);
                setStep("idle");
                router.push(
                  `/work/business?tab=create&intent=campaign&step=brief&brand=${brand}&goal=${goal}`,
                );
              }
              if (actionId === "edit") {
                setStep("business");
              }
            }}
          />
        </div>
      ) : null}
      {!needsSetup && !showDraft && step === "idle" ? (
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-2xl font-medium tracking-tight">{heading}</h1>
            {tab === "home" && isOwner ? (
              <p className="font-mono text-[12px] text-muted">
                {rm(market.businessBalance(ws.id))} credits
              </p>
            ) : null}
          </div>
          {tab === "home" && !isOwner ? (
            <p className="text-sm text-muted">
              Marketing can submit briefs. The owner approves spend.
            </p>
          ) : null}

          {tab === "home" && isOwner && spendMine.length ? (
            <div className="space-y-3">
              {spendMine.map((req) => (
                <ActionCard
                  key={req.id}
                  card={{
                    id: req.id,
                    kind: "payment",
                    title: `Approve spend · ${rm(req.amount)}`,
                    provenance: "user",
                    body: `${req.title}. Marketing submitted this. Hold goes to escrow on accept.`,
                    actions: [
                      { id: "approve", label: "Approve spend" },
                      { id: "dismiss", label: "Dismiss", variant: "ghost" },
                    ],
                  }}
                  onAction={(id) => {
                    if (id === "approve") approveSpend(req.id);
                    if (id === "dismiss") market.removeSpendRequest(req.id);
                  }}
                />
              ))}
            </div>
          ) : null}

          {tab === "create" ? (
            <BusinessCreate
              workspaceId={ws.id}
              workspaceName={ws.name}
              isOwner={isOwner}
              brandOptions={brandOptions}
            />
          ) : null}

          {creditError ? (
            <ActionCard
              card={{
                id: "credits",
                kind: "payment",
                title: "Need credits",
                provenance: "verified",
                body: creditError,
                actions: [{ id: "ok", label: "Got it" }],
              }}
              onAction={() => setCreditError(null)}
            />
          ) : null}

          {tab === "content" && selected ? (
            <ReviewPipeline
              job={selected}
              actor="business"
              onChange={(next) => market.patchReview(next.id, next)}
              onFinalApprove={(next) => {
                market.patchReview(next.id, next);
                market.releaseJob(next, session.displayName);
              }}
            />
          ) : null}

          {tab === "content" && !selected ? (
            jobs.length ? (
              <ActionFeed
                items={jobs.map((j) => ({
                  id: j.id,
                  title: j.title,
                  detail: `${j.step} · ${j.waitingOn}`,
                  href: `/work/business?tab=content&job=${j.id}`,
                }))}
              />
            ) : (
              <p className="text-sm text-muted">No content in review yet.</p>
            )
          ) : null}

          {tab === "campaigns" ? (
            jobs.length ? (
              <ActionFeed
                items={jobs.map((j) => ({
                  id: j.id,
                  title: j.title,
                  detail: `${j.kind} · ${rm(j.priceCredits)} held or released`,
                  href: `/work/business?tab=content&job=${j.id}`,
                }))}
              />
            ) : (
              <p className="text-sm text-muted">No campaigns yet. Create one.</p>
            )
          ) : null}

          {tab === "business" ? (
            <div className="space-y-6">
              <SeatToggle
                seat={ws.seat ?? "owner"}
                onChange={(seat) => patchBusiness({ seat })}
              />
              <BalanceLine
                label="Spendable credits"
                amount={market.businessBalance(ws.id)}
              />
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Brands
                </p>
                <ul className="space-y-2">
                  {ws.brands?.map((b) => (
                    <li
                      key={b.id}
                      className="rounded-[16px] border border-line bg-surface px-5 py-4"
                    >
                      <p className="font-medium">{b.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {b.city} · {b.outlets}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  Ledger
                </p>
                <LedgerList entries={ledgerMine} />
              </div>
              <SignOutButton />
            </div>
          ) : null}

          {tab === "home" ? (
            <ActionFeed
              items={[
                ...waitingBusiness.map((j) => ({
                  id: j.id,
                  title: `${j.title} needs your review`,
                  detail: `${j.step} · ${j.kolName}`,
                  href: `/work/business?tab=content&job=${j.id}`,
                })),
                ...ws.feed,
              ]}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <MobileAppShell
        title={ws.name}
        items={businessNav}
        active={tab === "create" ? "create" : tab}
      >
        {body}
      </MobileAppShell>
      <CommandShell name={ws.name}>{body}</CommandShell>
    </>
  );
}

function SeatToggle({
  seat,
  onChange,
}: {
  seat: BusinessSeat;
  onChange: (seat: BusinessSeat) => void;
}) {
  return (
    <div>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        Seat
      </p>
      <div className="flex rounded-full border border-line p-0.5 text-[12px]">
        {(["owner", "marketing"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`min-h-10 flex-1 rounded-full px-3 capitalize ${
              seat === s ? "bg-elevated text-ink" : "text-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted">
        Same workspace. Owner denser on spend. Marketing submits briefs.
      </p>
    </div>
  );
}
