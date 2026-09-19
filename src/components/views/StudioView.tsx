"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlankCanvas } from "@/components/ai/BlankCanvas";
import { KolLookRow } from "@/components/ai/KolLookRow";
import { ActionFeed } from "@/components/feed/ActionFeed";
import { PhoneFrame } from "@/components/shells/PhoneFrame";
import { MobileAppShell, StudioShell } from "@/components/shells/WorkShells";
import { ActionCard, type ActionCardModel } from "@/components/ui/ActionCard";
import { ClarifyChips } from "@/components/ui/ClarifyChips";
import { ReviewPipeline } from "@/components/review/ReviewPipeline";
import { NeedWorkspace } from "@/components/auth/NeedWorkspace";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { creatorNav } from "@/lib/nav";
import { uid } from "@/lib/ids";
import {
  appendKol,
  KOL_LOOKS,
  kolFromProposal,
  lookById,
  namesInWorld,
  proposeKol,
} from "@/lib/kol-identity";
import { rm, useMarketplace } from "@/lib/marketplace";
import { useSession } from "@/lib/session";
import type { Kol } from "@/lib/types";
import { useDesktop } from "@/lib/use-desktop";

type CastFlow = "idle" | "look" | "tribe" | "proposal" | "accepted";

function studioHref(tab: string, search: string) {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.set("tab", tab);
  const query = params.toString();
  return query ? `/work/studio?${query}` : "/work/studio";
}

function rosterCard(kol: Kol): ActionCardModel {
  return {
    id: kol.id,
    kind: "avatar",
    title: kol.name,
    provenance: "user",
    body: `${kol.categories} · ${kol.audience}`,
    rows: [
      { label: "World", value: kol.categories, provenance: "user" },
      { label: "Speaks to", value: kol.audience, provenance: "user" },
      { label: "Voice", value: kol.personality, provenance: "ai" },
      { label: "Language", value: kol.language, provenance: "ai" },
      { label: "Based in", value: kol.market, provenance: "ai" },
    ],
    score: { value: kol.amf, label: "Niche fit" },
    factors: [
      { label: "World", value: kol.categories },
      { label: "Comments", value: kol.audience },
      { label: "Voice", value: `${kol.personality} · ${kol.language}` },
    ],
    actions: [],
  };
}

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
  const [flow, setFlow] = useState<CastFlow>("idle");
  const [lookId, setLookId] = useState<string | null>(null);
  const [tribe, setTribe] = useState("");
  const [regen, setRegen] = useState(0);
  const [deskMode, setDeskMode] = useState<"phone" | "canvas">(
    preview ? "phone" : "canvas",
  );

  useEffect(() => {
    if (!ready || !preview) return;
    if (as === "aisha") loadPreset("creator-active");
    if (as === "new") loadPreset("creator-new");
  }, [ready, as, preview, loadPreset]);

  useEffect(() => {
    if (tab === "kols" || tab === "campaigns" || tab === "profile") {
      setFlow("idle");
    }
  }, [tab]);

  const myJobs = useMemo(
    () =>
      market.reviews.filter((j) => j.creatorName === session.displayName),
    [market.reviews, session.displayName],
  );
  const waitingMine = myJobs.filter((j) => j.waitingOn === "creator");
  const selected = myJobs.find((j) => j.id === jobQ) ?? null;
  const lockedIp = market.ipJobs.find((j) => j.status === "handed_off") ?? null;
  const look = lookId ? lookById(lookId) : null;
  const proposal =
    lookId && tribe ? proposeKol({ lookId, tribe, regen }) : null;
  const takenNames = look ? namesInWorld(ws?.kols ?? [], look.world) : [];

  const kolCard: ActionCardModel | null = proposal
    ? {
        id: "avatar",
        kind: "avatar",
        title: `Avatar proposal · ${proposal.name}`,
        provenance: "ai",
        body: proposal.body,
        rows: [
          { label: "Voice", value: proposal.voice, provenance: "user" },
          { label: "World", value: proposal.world, provenance: "user" },
          { label: "Speaks to", value: proposal.audience, provenance: "user" },
          { label: "Language", value: proposal.language, provenance: "ai" },
          { label: "Based in", value: proposal.market, provenance: "ai" },
        ],
        score: { value: proposal.amf, label: "Niche fit" },
        factors: proposal.factors,
        actions:
          flow === "accepted"
            ? [
                { id: "another", label: "Make another" },
                { id: "list", label: "List for brand jobs", variant: "quiet" },
              ]
            : [
                { id: "accept", label: "Accept" },
                { id: "edit", label: "Edit", variant: "ghost" },
                { id: "regen", label: "Regenerate", variant: "quiet" },
              ],
      }
    : null;

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

  const studio = ws;
  const makingContent = studio.canvasIntent === "content" || studio.canvasIntent === "upload";
  const isBlank =
    flow === "idle" &&
    !selected &&
    !makingContent &&
    (tab === "create" || (!studio.kols.length && tab === "home") || studio.canvasIntent === "blank");

  function startKol() {
    patchCreator({ canvasIntent: "kol" });
    setLookId(null);
    setTribe("");
    setRegen(0);
    setFlow("look");
  }

  function acceptKol() {
    if (!proposal) return;
    const kol = kolFromProposal(proposal, uid("kol"));
    patchCreator({
      canvasIntent: null,
      kols: appendKol(studio.kols, kol),
      feed: [
        {
          id: uid("feed"),
          title: `${kol.name} is in your studio`,
          detail: `${kol.categories} · ${kol.audience}`,
          href: "/work/studio?tab=kols",
          tone: "action",
        },
        {
          id: uid("list"),
          title: `List ${kol.name} for brand jobs`,
          detail: "Later · this talent only",
          href: "/work/studio?tab=kols",
          tone: "info",
        },
        ...studio.feed,
      ],
    });
    setFlow("accepted");
  }

  function onCastAction(id: string) {
    switch (id) {
      case "accept":
        acceptKol();
        return;
      case "edit":
        setFlow("look");
        return;
      case "regen":
        setRegen((n) => n + 1);
        return;
      case "another":
        startKol();
        return;
      case "list":
        setFlow("idle");
        router.push(studioHref("kols", searchParams.toString()));
        return;
      default:
        return;
    }
  }

  function renderCast(step: CastFlow) {
    switch (step) {
      case "idle":
        return null;
      case "look":
        return (
          <div className="mx-auto w-full max-w-5xl">
            <p className="text-[17px] font-medium leading-6 text-ink">Who are we making?</p>
            <div className="mt-4">
              <KolLookRow
                looks={KOL_LOOKS}
                selectedId={lookId ?? undefined}
                takenWorlds={studio.kols.map((kol) => kol.categories)}
                onPick={(id) => {
                  setLookId(id);
                  setTribe("");
                  setRegen(0);
                  setFlow("tribe");
                }}
              />
            </div>
          </div>
        );
      case "tribe":
        return (
          <div className="mx-auto w-full max-w-md">
            {look ? (
              <button
                type="button"
                className="text-sm text-muted hover:text-ink"
                onClick={() => setFlow("look")}
              >
                {look.name}
              </button>
            ) : null}
            {look && takenNames.length ? (
              <p className="mt-2 text-sm text-muted">
                You already have {takenNames.join(", ")} in {look.world}.
              </p>
            ) : null}
            <div className="mt-4">
              <ClarifyChips
                question="Who is in their comments?"
                options={look?.tribes ?? []}
                onPick={(value) => {
                  setTribe(value);
                  setFlow("proposal");
                }}
              />
            </div>
          </div>
        );
      case "proposal":
      case "accepted":
        return kolCard ? (
          <div className="mx-auto w-full max-w-md">
            {look ? (
              <button
                type="button"
                className="mb-3 text-sm text-muted hover:text-ink"
                onClick={() => setFlow("look")}
              >
                {look.name}
              </button>
            ) : null}
            <ActionCard card={kolCard} onAction={onCastAction} />
          </div>
        ) : null;
      default: {
        const _never: never = step;
        throw new Error(`Unhandled cast step: ${_never}`);
      }
    }
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
      {!selected && flow !== "idle" ? renderCast(flow) : null}
      {!selected && !isBlank && flow === "idle" && !makingContent ? (
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
              <ActionFeed items={studio.feed} />
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
                    rows: [
                      { label: "Tone", value: lockedIp.tone },
                      { label: "Look", value: lockedIp.look },
                      {
                        label: "Pack",
                        value: (lockedIp.offer?.included ?? []).slice(0, 2).join(" · "),
                      },
                    ],
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
            studio.kols.length ? (
              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  KOLs
                </p>
                {studio.kols.map((kol) => (
                  <ActionCard key={kol.id} card={rosterCard(kol)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No talent yet. Create a virtual KOL.</p>
            )
          ) : null}
          {tab === "profile" ? (
            <div className="space-y-4">
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
      title={studio.name}
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
          name={studio.name}
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
