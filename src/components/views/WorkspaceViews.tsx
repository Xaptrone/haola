"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BlankCanvas } from "@/components/ai/BlankCanvas";
import { ActionFeed } from "@/components/feed/ActionFeed";
import { PhoneFrame } from "@/components/shells/PhoneFrame";
import { CommandShell, MobileAppShell, StudioShell } from "@/components/shells/WorkShells";
import { ActionCard, type ActionCardModel } from "@/components/ui/ActionCard";
import { ClarifyChips } from "@/components/ui/ClarifyChips";
import { businessNav, creatorNav } from "@/lib/nav";
import { uid } from "@/lib/ids";
import { useSession } from "@/lib/session";
import { useDesktop } from "@/lib/use-desktop";

export function StudioView() {
  const { session, patchCreator, loadPreset, ready } = useSession();
  const desktop = useDesktop();
  const tab = useSearchParams().get("tab") ?? "home";
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

  const kolCard: ActionCardModel = useMemo(
    () => ({
      id: "avatar",
      kind: "avatar",
      title: "Avatar proposal · Mei Lin",
      provenance: "ai",
      body: "Warm, precise, never shouty. Speaks to 25–34 diners who care how a room feels.",
      rows: [
        { label: "Market", value: answers.market || "Penang & KL", provenance: "user" },
        { label: "Audience", value: answers.audience || "Food explorers", provenance: "user" },
        { label: "Voice", value: "EN / 中文 · low-key", provenance: "ai" },
      ],
      score: { value: 82, label: "Avatar Market-Fit" },
      factors: [
        { label: "Market whitespace", value: "Thai fine dining, not hawker" },
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
        <p className="text-muted">Creators land in a studio, not the restaurant site.</p>
        <button
          type="button"
          className="min-h-12 rounded-full bg-accent px-5 text-sm font-medium text-canvas"
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

  const creating = tab === "create" || ws.canvasIntent === "blank" || flow !== "idle";
  const isBlank =
    flow === "idle" &&
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
          categories: "Thai fine dining",
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
      {isBlank ? (
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
              "25–34 food explorers",
              "Fine-dining regulars",
              "Weekend group diners",
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
      {!creating && ws.kols.length && flow === "idle" ? (
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
              <ActionFeed items={ws.feed} />
            </>
          ) : null}
          {tab === "campaigns" ? (
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
                title: "RM500 ready",
                provenance: "verified",
                body: "Approved content. Request payout from here — not from a desktop table.",
                actions: [{ id: "payout", label: "Request payout" }],
              }}
            />
          ) : null}
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

export function BusinessView() {
  const { session, patchBusiness } = useSession();
  const tab = useSearchParams().get("tab") ?? "home";
  const flowQ = useSearchParams().get("flow");
  const ws = session.businessWorkspace;
  const [step, setStep] = useState<"idle" | "restaurant" | "goal" | "draft">(
    flowQ === "setup" ? "restaurant" : "idle",
  );

  if (!ws || session.role !== "business") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-center">
        <p className="text-muted">Open Demo → Business · first login</p>
      </div>
    );
  }

  const needsSetup = ws.onboardingStage !== "ready" && !ws.guestDraft;
  const showDraft = Boolean(ws.guestDraft) && step !== "restaurant";

  const body = (
    <>
      {needsSetup && step === "idle" ? (
        <ClarifyChips
          question="Which restaurant is this workspace for?"
          options={["As I Am by Chef Ton", "SOOD Penang", "A new outlet"]}
          onPick={(v) => {
            patchBusiness({
              name: v,
              onboardingStage: "goal",
              restaurants: [
                {
                  id: uid("rst"),
                  name: v,
                  city: "Malaysia",
                  outlets: "To confirm",
                },
              ],
            });
            setStep("goal");
          }}
        />
      ) : null}
      {step === "goal" ? (
        <ClarifyChips
          question="What should we do first?"
          options={["Drive bookings", "Launch a menu", "A promotion", "Awareness"]}
          onPick={() => {
            patchBusiness({
              onboardingStage: "ready",
              feed: [
                {
                  id: "first",
                  title: "Create your first campaign",
                  detail: "AI already has the restaurant.",
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
                { label: "Restaurant", value: ws.guestDraft!.restaurantName, provenance: "user" },
                { label: "Goal", value: ws.guestDraft!.goal, provenance: "user" },
              ],
              actions: [
                { id: "continue", label: "Continue" },
                { id: "edit", label: "Edit", variant: "ghost" },
              ],
            }}
          />
        </div>
      ) : null}
      {!needsSetup && !showDraft && step === "idle" ? (
        <div className="space-y-6">
          <h1 className="text-2xl font-medium tracking-tight">
            {tab === "create" ? "New campaign" : "Home"}
          </h1>
          {tab === "create" ? (
            <ClarifyChips
              question="Which restaurant are we promoting?"
              options={
                ws.restaurants.length
                  ? ws.restaurants.map((r) => r.name)
                  : ["As I Am by Chef Ton"]
              }
              onPick={() => undefined}
            />
          ) : (
            <ActionFeed items={ws.feed} />
          )}
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <MobileAppShell title={ws.name} items={businessNav} active={tab === "create" ? "create" : "home"}>
        {body}
      </MobileAppShell>
      <CommandShell name={ws.name}>
        {body}
      </CommandShell>
    </>
  );
}
