"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BlankCanvas } from "@/components/ai/BlankCanvas";
import { ActionFeed } from "@/components/feed/ActionFeed";
import { PhoneFrame } from "@/components/shells/PhoneFrame";
import { MobileAppShell, StudioShell } from "@/components/shells/WorkShells";
import { ActionCard, type ActionCardModel } from "@/components/ui/ActionCard";
import { ClarifyChips } from "@/components/ui/ClarifyChips";
import { ReviewPipeline } from "@/components/review/ReviewPipeline";
import { creatorNav } from "@/lib/nav";
import { uid } from "@/lib/ids";
import { rm, useMarketplace } from "@/lib/marketplace";
import { useSession } from "@/lib/session";
import { useDesktop } from "@/lib/use-desktop";

export function StudioView() {
  const { session, patchCreator, loadPreset, ready } = useSession();
  const market = useMarketplace();
  const desktop = useDesktop();
  const tab = useSearchParams().get("tab") ?? "home";
  const jobQ = useSearchParams().get("job");
  const as = useSearchParams().get("as");
  const ws = session.creatorWorkspace;
  const [flow, setFlow] = useState<"idle" | "market" | "audience" | "done">("idle");
  const [answers, setAnswers] = useState({ market: "", audience: "" });
  const [deskMode, setDeskMode] = useState<"phone" | "canvas">("phone");

  useEffect(() => {
    if (!ready) return;
    if (as === "aisha") loadPreset("creator-active");
    if (as === "new") loadPreset("creator-new");
  }, [ready, as, loadPreset]);

  const myJobs = useMemo(
    () =>
      market.reviews.filter(
        (j) => j.creatorName === session.displayName || j.creatorName === "Aisha",
      ),
    [market.reviews, session.displayName],
  );
  const waitingMine = myJobs.filter((j) => j.waitingOn === "creator");
  const selected = myJobs.find((j) => j.id === jobQ) ?? null;
  const lockedIp = market.ipJobs.find((j) => j.status === "handed_off") ?? null;

  const kolCard: ActionCardModel = useMemo(
    () => ({
      id: "avatar",
      kind: "avatar",
      title: "Avatar proposal · Mei Lin",
      provenance: "ai",
      body: "Warm, precise, never shouty. Speaks to 25–34 people who care how a brand feels.",
      rows: [
        { label: "Market", value: answers.market || "Penang & KL", provenance: "user" },
        { label: "Audience", value: answers.audience || "Brand explorers", provenance: "user" },
        { label: "Voice", value: "EN / 中文 · low-key", provenance: "ai" },
      ],
      score: { value: 82, label: "Avatar Market-Fit" },
      factors: [
        { label: "Market whitespace", value: "Premium SMEs, not shouty ads" },
        { label: "Language pair", value: "Matches KL + Penang" },
        { label: "Distinctiveness", value: "Clear vs existing KOLs" },
      ],
      actions: [
        { id: "accept", label: "Accept" },
        { id: "edit", label: "Edit", variant: "ghost" },
        { id: "regen", label: "Regenerate", variant: "quiet" },
      ],
    }),
    [answers],
  );

  if (!ready) return <div className="min-h-dvh bg-canvas" />;

  if ((as === "aisha" || as === "new") && session.role !== "creator") {
    return <div className="min-h-dvh bg-canvas" />;
  }

  if (!ws || session.role !== "creator") {
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
    patchCreator({
      canvasIntent: null,
      kols: [
        {
          id: uid("kol"),
          name: "Mei Lin",
          market: answers.market,
          audience: answers.audience,
          categories: "Lifestyle, services, F&B",
          language: "EN / 中文",
          personality: "Warm, precise",
          amf: 82,
        },
      ],
      feed: [
        {
          id: "amf",
          title: "Mei Lin has an AMF of 82",
          detail: "Predicted · inspect factors",
          href: "/work/studio?tab=kols",
          tone: "info",
        },
      ],
    });
    setFlow("idle");
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
            }}
          />
        </div>
      ) : null}
      {!selected && !creating && ws.kols.length && flow === "idle" ? (
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
              {myJobs.length ? (
                <ActionFeed
                  items={myJobs.map((j) => ({
                    id: j.id,
                    title: j.title,
                    detail: `${j.businessName} · ${j.waitingOn}`,
                    href: `/work/studio?tab=campaigns&job=${j.id}`,
                  }))}
                />
              ) : (
                <ActionCard
                  card={{
                    id: "match",
                    kind: "kol",
                    title: "As I Am matches Mei at 91%",
                    provenance: "predicted",
                    score: { value: 91, label: "Campaign match" },
                    body: "Accept, compare, or skip. This is predicted, not a booking.",
                    actions: [
                      { id: "accept", label: "Accept campaign" },
                      { id: "compare", label: "Compare", variant: "ghost" },
                    ],
                  }}
                />
              )}
            </div>
          ) : null}
          {tab === "kols" ? (
            <ActionCard
              card={{
                ...kolCard,
                title: `${ws.kols[0].name} · AMF ${ws.kols[0].amf}`,
                actions: [{ id: "inspect", label: "Inspect factors" }],
              }}
            />
          ) : null}
          {tab === "profile" ? (
            <ActionCard
              card={{
                id: "pay",
                kind: "payment",
                title: `${rm(market.creatorBalance())} pending`,
                provenance: "verified",
                body: "Released after final approve. Payout rail is not live yet.",
                actions: [{ id: "payout", label: "Request payout" }],
              }}
            />
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
      {desktop && deskMode === "phone" ? (
        <div className="hidden h-dvh flex-col bg-canvas lg:flex">
          <header className="flex items-center justify-between border-b border-line px-8 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              How a creator sees it · phone
            </p>
            {modeToggle}
          </header>
          <div className="flex flex-1 items-center justify-center">
            <PhoneFrame>{app}</PhoneFrame>
          </div>
        </div>
      ) : null}
      {desktop && deskMode === "canvas" ? (
        <StudioShell
          name={ws.name}
          actions={modeToggle}
          composer={
            <p className="text-center text-sm text-muted">
              Composer stays here. Cards land on the canvas — not in a chat drawer.
            </p>
          }
        >
          <div className="flex min-h-full items-center justify-center px-8 py-12">
            {board}
          </div>
        </StudioShell>
      ) : null}
    </>
  );
}
