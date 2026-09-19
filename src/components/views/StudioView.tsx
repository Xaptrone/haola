"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BlankCanvas } from "@/components/ai/BlankCanvas";
import { ActionFeed } from "@/components/feed/ActionFeed";
import { PhoneFrame } from "@/components/shells/PhoneFrame";
import { MobileAppShell, StudioShell } from "@/components/shells/WorkShells";
import { ActionCard, type ActionCardModel } from "@/components/ui/ActionCard";
import { ClarifyChips } from "@/components/ui/ClarifyChips";
import { NamePrompt } from "@/components/ui/NamePrompt";
import { ReviewPipeline } from "@/components/review/ReviewPipeline";
import { NeedWorkspace } from "@/components/auth/NeedWorkspace";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { creatorNav } from "@/lib/nav";
import { uid } from "@/lib/ids";
import { rm, useMarketplace } from "@/lib/marketplace";
import { isUnassignedCreator, UNASSIGNED_KOL } from "@/lib/review";
import { kolProposal } from "@/lib/kol-proposal";
import { useSession } from "@/lib/session";
import { useDesktop } from "@/lib/use-desktop";
import type { ReviewJob } from "@/lib/types";

export function StudioView() {
  const { session, patchCreator, loadPreset, ready } = useSession();
  const market = useMarketplace();
  const desktop = useDesktop();
  const tab = useSearchParams().get("tab") ?? "home";
  const jobQ = useSearchParams().get("job");
  const as = useSearchParams().get("as");
  const previewParam = useSearchParams().get("preview") === "1";
  const preview = market.preview && previewParam;
  const ws = session.creatorWorkspace;
  const [flow, setFlow] = useState<
    "idle" | "market" | "audience" | "name" | "done"
  >("idle");
  const [answers, setAnswers] = useState({
    market: "",
    audience: "",
    name: "",
  });
  const [deskMode, setDeskMode] = useState<"phone" | "canvas">(
    preview ? "phone" : "canvas",
  );

  useEffect(() => {
    if (!ready || !preview) return;
    if (as === "aisha") loadPreset("creator-active");
    if (as === "new") loadPreset("creator-new");
  }, [ready, as, preview, loadPreset]);

  useEffect(() => {
    if (!ws) return;
    market.ensureParty({
      id: ws.id,
      name: session.displayName,
      kind: "creator",
    });
  }, [ws, session.displayName, market]);

  const myJobs = useMemo(
    () =>
      market.reviews.filter((j) => j.creatorName === session.displayName),
    [market.reviews, session.displayName],
  );
  const openMatches = useMemo(
    () => market.reviews.filter((j) => isUnassignedCreator(j.creatorName)),
    [market.reviews],
  );
  const waitingMine = myJobs.filter((j) => j.waitingOn === "creator");
  const selected = myJobs.find((j) => j.id === jobQ) ?? null;
  const lockedIp = market.ipJobs.find((j) => j.status === "handed_off") ?? null;

  const kolCard: ActionCardModel = useMemo(() => {
    const proposal = kolProposal(answers);
    return {
      id: "avatar",
      kind: "avatar",
      title: proposal.name
        ? `Avatar proposal · ${proposal.name}`
        : "Avatar proposal",
      provenance: "ai",
      body: proposal.personality,
      rows: [
        { label: "Market", value: proposal.market || "To confirm", provenance: "user" },
        {
          label: "Audience",
          value: proposal.audience || "To confirm",
          provenance: "user",
        },
        { label: "Voice", value: `${proposal.language} · low-key`, provenance: "ai" },
      ],
      factors: [
        { label: "Market", value: proposal.market || "Asked, then locked" },
        { label: "Audience", value: proposal.audience || "Asked, then locked" },
        { label: "Language pair", value: proposal.language },
      ],
      actions: [
        { id: "accept", label: "Accept" },
        { id: "edit", label: "Edit", variant: "ghost" },
      ],
    };
  }, [answers]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <p className="text-sm text-muted">
          {preview ? "Opening preview" : ""}
        </p>
      </div>
    );
  }

  if (preview && (as === "aisha" || as === "new") && session.role !== "creator") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <p className="text-sm text-muted">Opening preview</p>
      </div>
    );
  }

  if (!ws || session.role !== "creator") {
    if (preview) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-muted">Creators land in a studio, not the business workspace.</p>
          <button
            type="button"
            className="min-h-12 rounded-full bg-accent px-5 text-sm font-medium text-ink"
            onClick={() => loadPreset("creator-new")}
          >
            Open a new creator studio
          </button>
          <button
            type="button"
            className="text-sm text-muted"
            onClick={() => loadPreset("creator-active")}
          >
            Open Aisha&apos;s lived-in studio
          </button>
        </div>
      );
    }
    return <NeedWorkspace kind="creator" />;
  }

  const makingContent = ws.canvasIntent === "content" || ws.canvasIntent === "upload";
  const creating =
    tab === "create" || ws.canvasIntent === "blank" || flow !== "idle" || makingContent;
  const isBlank =
    flow === "idle" &&
    !selected &&
    !makingContent &&
    (tab === "create" || (!ws.kols.length && tab === "home") || ws.canvasIntent === "blank");

  function startKol() {
    patchCreator({ canvasIntent: "kol" });
    setFlow("market");
  }

  function acceptKol() {
    const next = kolProposal(answers);
    if (!next.name) return;
    patchCreator({
      canvasIntent: null,
      kols: [
        {
          id: uid("kol"),
          name: next.name,
          market: next.market,
          audience: next.audience,
          categories: next.categories,
          language: next.language,
          personality: next.personality,
          amf: 0,
        },
      ],
      feed: [
        {
          id: "amf",
          title: `${next.name} is on the board`,
          detail: "Predicted AMF lands after the first live campaign",
          href: "/work/studio?tab=kols",
          tone: "info",
        },
      ],
    });
    setFlow("idle");
  }

  function claimJob(job: ReviewJob) {
    if (!ws) return;
    const kol = ws.kols[0]?.name ?? UNASSIGNED_KOL;
    market.patchReview(job.id, {
      ...job,
      creatorName: session.displayName,
      kolName: kol,
      adminLog: [
        {
          id: uid("log"),
          text:
            kol === UNASSIGNED_KOL
              ? `${session.displayName} accepted this match.`
              : `${session.displayName} accepted this match · KOL ${kol}.`,
          at: "Just now",
        },
        ...job.adminLog,
      ],
    });
  }

  const board = (
    <>
      {selected ? (
        <div className="mx-auto max-w-md">
          <ReviewPipeline
            job={selected}
            actor="creator"
            onChange={(next) => market.patchReview(next.id, next)}
          />
        </div>
      ) : null}
      {!selected && isBlank ? (
        <BlankCanvas
          name={session.displayName}
          onPick={(intent) => {
            if (intent === "kol") startKol();
            else patchCreator({ canvasIntent: intent });
          }}
        />
      ) : null}
      {flow === "market" ? (
        <div className="mx-auto max-w-md">
          <ClarifyChips
            question="Which market should this KOL serve?"
            options={["Kuala Lumpur", "Penang", "Both KL and Penang"]}
            onPick={(v) => {
              setAnswers((a) => ({ ...a, market: v }));
              setFlow("audience");
            }}
          />
        </div>
      ) : null}
      {flow === "audience" ? (
        <div className="mx-auto max-w-md">
          <ClarifyChips
            question="Who should follow this personality?"
            options={[
              "25–34 brand explorers",
              "Premium regulars",
              "Weekend group buyers",
            ]}
            onPick={(v) => {
              setAnswers((a) => ({ ...a, audience: v }));
              setFlow("name");
            }}
          />
        </div>
      ) : null}
      {flow === "name" ? (
        <div className="mx-auto max-w-md">
          <NamePrompt
            question="What should this KOL be called?"
            placeholder="KOL name"
            fieldLabel="KOL name"
            onSubmit={(name) => {
              setAnswers((a) => ({ ...a, name }));
              setFlow("done");
            }}
          />
        </div>
      ) : null}
      {flow === "done" ? (
        <div className="mx-auto max-w-md">
          <ActionCard
            card={kolCard}
            onAction={(id) => {
              if (id === "accept") acceptKol();
              if (id === "edit") setFlow("name");
            }}
          />
        </div>
      ) : null}
      {!selected && !creating && flow === "idle" && (ws.kols.length || tab === "campaigns" || tab === "profile") ? (
        <div className="mx-auto max-w-md space-y-6">
          {tab === "home" ? (
            <>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  Home
                </p>
                <h1 className="mt-2 text-2xl font-medium tracking-tight">
                  {session.displayName}
                </h1>
              </div>
              {waitingMine.length ? (
                <ActionFeed
                  items={waitingMine.map((j) => ({
                    id: j.id,
                    title: `${j.title} needs you`,
                    detail: `${j.businessName} · ${j.step}`,
                    href: `/work/studio?tab=campaigns&job=${j.id}`,
                    tone: "action" as const,
                  }))}
                />
              ) : null}
              {openMatches.length ? (
                <ActionFeed
                  items={openMatches.map((j) => ({
                    id: `open-${j.id}`,
                    title: `Open match · ${j.businessName}`,
                    detail: j.title,
                    href: `/work/studio?tab=campaigns`,
                    tone: "action" as const,
                  }))}
                />
              ) : null}
              <ActionFeed items={ws.feed} />
            </>
          ) : null}
          {tab === "campaigns" ? (
            <div className="space-y-4">
              {lockedIp ? (
                <ActionCard
                  card={{
                    id: lockedIp.id,
                    kind: "ip",
                    title: `Locked brief · ${lockedIp.businessName}`,
                    provenance: "verified",
                    body: "Business owns this IP brief. Produce against it — do not publish as final.",
                    rows: [{ label: "Tone", value: lockedIp.tone }],
                    actions: [],
                  }}
                />
              ) : null}
              {openMatches.length ? (
                <div className="space-y-3">
                  {openMatches.map((job) => (
                    <ActionCard
                      key={job.id}
                      card={{
                        id: job.id,
                        kind: "kol",
                        title: `Open match · ${job.businessName}`,
                        provenance: "predicted",
                        body: job.title,
                        actions: [{ id: "accept", label: "Accept match" }],
                      }}
                      onAction={(id) => {
                        if (id === "accept") claimJob(job);
                      }}
                    />
                  ))}
                </div>
              ) : null}
              {myJobs.length ? (
                <ActionFeed
                  items={myJobs.map((j) => ({
                    id: j.id,
                    title: j.title,
                    detail: `${j.businessName} · ${j.waitingOn}`,
                    href: `/work/studio?tab=campaigns&job=${j.id}`,
                  }))}
                />
              ) : preview ? (
                <ActionCard
                  card={{
                    id: "match",
                    kind: "kol",
                    title: "As I Am matches Mei at 91%",
                    provenance: "predicted",
                    score: { value: 91, label: "Campaign match" },
                    body: "Accept, compare, or skip. This is predicted, not a booking.",
                    actions: [{ id: "accept", label: "Accept campaign" }],
                  }}
                />
              ) : openMatches.length ? null : (
                <p className="text-sm text-muted">No campaigns yet. Matches land here.</p>
              )}
            </div>
          ) : null}
          {tab === "kols" && ws.kols[0] ? (
            <ActionCard
              card={{
                id: "avatar",
                kind: "avatar",
                title: ws.kols[0].amf
                  ? `${ws.kols[0].name} · AMF ${ws.kols[0].amf}`
                  : ws.kols[0].name,
                provenance: ws.kols[0].amf ? "predicted" : "user",
                body: ws.kols[0].personality,
                rows: [
                  { label: "Market", value: ws.kols[0].market, provenance: "user" },
                  { label: "Audience", value: ws.kols[0].audience, provenance: "user" },
                  {
                    label: "Voice",
                    value: ws.kols[0].language,
                    provenance: "user",
                  },
                ],
                score: ws.kols[0].amf
                  ? { value: ws.kols[0].amf, label: "Avatar Market-Fit" }
                  : undefined,
                actions: [{ id: "inspect", label: "Inspect factors" }],
              }}
            />
          ) : null}
          {tab === "profile" ? (
            <div className="space-y-4">
              <ActionCard
                card={{
                  id: "pay",
                  kind: "payment",
                  title: `${rm(market.creatorBalance(ws.id))} pending`,
                  provenance: "verified",
                  body: "Released after final approve. Payout rail is not live yet.",
                  actions: [],
                }}
              />
              <SignOutButton />
            </div>
          ) : null}
        </div>
      ) : null}
      {!selected && makingContent && flow === "idle" ? (
        <div className="mx-auto max-w-md space-y-4">
          <h1 className="text-2xl font-medium tracking-tight">Jobs on the board</h1>
          {waitingMine.length ? (
            <ActionFeed
              items={waitingMine.map((j) => ({
                id: j.id,
                title: j.title,
                detail: `${j.step} · ${j.businessName}`,
                href: `/work/studio?tab=campaigns&job=${j.id}`,
              }))}
            />
          ) : (
            <p className="text-sm text-muted">No jobs waiting on you.</p>
          )}
        </div>
      ) : null}
    </>
  );

  const app = (
    <MobileAppShell
      title={ws.name}
      items={creatorNav}
      active={tab === "create" ? "create" : tab}
      contained={desktop && deskMode === "phone"}
    >
      {board}
    </MobileAppShell>
  );

  const modeToggle = (
    <div className="flex rounded-full border border-line p-0.5 text-[12px]">
      {(["phone", "canvas"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setDeskMode(m)}
          className={`min-h-8 rounded-full px-3 capitalize ${
            deskMode === m ? "bg-elevated text-ink" : "text-muted"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {!desktop ? app : null}
      {desktop && preview && deskMode === "phone" ? (
        <div className="hidden h-dvh flex-col bg-canvas lg:flex">
          <header className="flex items-center justify-between border-b border-line px-8 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Phone preview
            </p>
            {modeToggle}
          </header>
          <div className="flex flex-1 items-center justify-center">
            <PhoneFrame>{app}</PhoneFrame>
          </div>
        </div>
      ) : null}
      {desktop && (!preview || deskMode === "canvas") ? (
        <StudioShell
          name={ws.name}
          actions={preview ? modeToggle : undefined}
          composer={undefined}
        >
          <div className="flex min-h-full items-center justify-center px-8 py-12">
            {board}
          </div>
        </StudioShell>
      ) : null}
    </>
  );
}
