"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlankCanvas } from "@/components/ai/BlankCanvas";
import { ActionFeed } from "@/components/feed/ActionFeed";
import { PhoneFrame } from "@/components/shells/PhoneFrame";
import { MobileAppShell, StudioShell } from "@/components/shells/WorkShells";
import { ActionCard } from "@/components/ui/ActionCard";
import { ReviewPipeline } from "@/components/review/ReviewPipeline";
import { NeedWorkspace } from "@/components/auth/NeedWorkspace";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { KolCreateFlow } from "@/components/studio/KolCreateFlow";
import { creatorNav } from "@/lib/nav";
import { rm, useMarketplace } from "@/lib/marketplace";
import { useSession } from "@/lib/session";
import { useDesktop } from "@/lib/use-desktop";
import type { Kol } from "@/lib/types";

export function StudioView() {
  const { session, patchCreator, loadPreset, ready } = useSession();
  const market = useMarketplace();
  const desktop = useDesktop();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "home";
  const jobQ = searchParams.get("job");
  const as = searchParams.get("as");
  const preview = searchParams.get("preview") === "1";
  const ws = session.creatorWorkspace;
  const [deskMode, setDeskMode] = useState<"phone" | "canvas">(
    preview ? "phone" : "canvas",
  );

  useEffect(() => {
    if (!ready || !preview) return;
    if (as === "aisha") loadPreset("creator-active");
    if (as === "new") loadPreset("creator-new");
  }, [ready, as, preview, loadPreset]);

  const myJobs = useMemo(
    () =>
      market.reviews.filter((j) => j.creatorName === session.displayName),
    [market.reviews, session.displayName],
  );
  const waitingMine = myJobs.filter((j) => j.waitingOn === "creator");
  const selected = myJobs.find((j) => j.id === jobQ) ?? null;
  const lockedIp = market.ipJobs.find((j) => j.status === "handed_off") ?? null;

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

  const creatingKol = ws.canvasIntent === "kol";
  const makingContent = ws.canvasIntent === "content" || ws.canvasIntent === "upload";
  const creating =
    tab === "create" ||
    ws.canvasIntent === "blank" ||
    creatingKol ||
    makingContent;
  const isBlank =
    !creatingKol &&
    !selected &&
    !makingContent &&
    (tab === "create" || (!ws.kols.length && tab === "home") || ws.canvasIntent === "blank");

  function startKol() {
    patchCreator({ canvasIntent: "kol" });
  }

  function cancelKol() {
    if (!ws) return;
    patchCreator({ canvasIntent: ws.kols.length ? null : "blank" });
  }

  function acceptKol(kol: Kol) {
    if (!ws) return;
    patchCreator({
      canvasIntent: null,
      kols: [...ws.kols, kol],
      feed: [
        {
          id: "amf",
          title: `${kol.name} has an AMF of ${kol.amf}`,
          detail: "Predicted · inspect factors",
          href: "/work/studio?tab=kols",
          tone: "info",
        },
        ...ws.feed,
      ],
    });
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", "kols");
    next.delete("as");
    const query = next.toString();
    router.push(query ? `/work/studio?${query}` : "/work/studio?tab=kols");
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
          firstRun={!ws.kols.length}
          market={ws.market}
          onPick={(intent) => {
            if (intent === "kol") startKol();
            else patchCreator({ canvasIntent: intent });
          }}
        />
      ) : null}
      {creatingKol ? (
        <div className="mx-auto max-w-md">
          <KolCreateFlow
            defaultMarket={ws.market}
            onAccept={acceptKol}
            onCancel={cancelKol}
          />
        </div>
      ) : null}
      {!selected && !creating && ws.kols.length && !creatingKol ? (
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
              ) : preview ? (
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
              ) : (
                <p className="text-sm text-muted">No campaigns yet. Matches land here.</p>
              )}
            </div>
          ) : null}
          {tab === "kols" ? (
            <div className="space-y-4">
              {ws.kols.map((kol) => (
                <ActionCard
                  key={kol.id}
                  card={{
                    id: kol.id,
                    kind: "avatar",
                    title: `${kol.name} · AMF ${kol.amf}`,
                    provenance: "predicted",
                    body: `${kol.personality}. Speaks to ${kol.audience}.`,
                    rows: [
                      { label: "Market", value: kol.market, provenance: "user" },
                      { label: "Audience", value: kol.audience, provenance: "user" },
                      { label: "Known for", value: kol.categories, provenance: "user" },
                      { label: "Voice", value: kol.language, provenance: "user" },
                    ],
                    score: { value: kol.amf, label: "Avatar Market-Fit" },
                    actions: [{ id: "inspect", label: "Inspect factors" }],
                  }}
                />
              ))}
            </div>
          ) : null}
          {tab === "profile" ? (
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  Profile
                </p>
                <h1 className="mt-2 text-2xl font-medium tracking-tight">
                  {session.displayName}
                </h1>
                {ws.handle ? (
                  <p className="mt-1 text-sm text-muted">@{ws.handle}</p>
                ) : null}
                {ws.market ? (
                  <p className="mt-1 text-sm text-muted">{ws.market}</p>
                ) : null}
              </div>
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
              <SignOutButton />
            </div>
          ) : null}
        </div>
      ) : null}
      {!selected && makingContent && !creatingKol ? (
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
