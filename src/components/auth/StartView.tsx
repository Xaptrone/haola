"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { startContinue } from "@/lib/start-continue";
import { useSession } from "@/lib/session";

export function StartView() {
  const { session, ready, identity, registerBusiness, registerCreator, guestDraft, enterManager } =
    useSession();
  const router = useRouter();
  const intent = useSearchParams().get("intent");
  const next = useSearchParams().get("next");
  const nextStep = startContinue({
    ready,
    hasIdentity: Boolean(identity),
    role: session.role,
    intent,
    next,
  });

  useEffect(() => {
    const step = startContinue({
      ready,
      hasIdentity: Boolean(identity),
      role: session.role,
      intent,
      next,
    });
    switch (step.type) {
      case "wait":
      case "pick":
        return;
      case "login":
      case "go":
        router.replace(step.href);
        return;
      case "attach":
        if (!identity) return;
        if (step.role === "creator") {
          registerCreator(
            identity.id.startsWith("wa:") ? "My studio" : identity.name,
            identity.email,
          );
          return;
        }
        if (step.role === "business") {
          registerBusiness(identity.name, identity.email);
          return;
        }
        {
          const _never: never = step.role;
          throw new Error(`Unhandled attach role: ${_never}`);
        }
      default: {
        const _never: never = step;
        throw new Error(`Unhandled start step: ${_never}`);
      }
    }
  }, [
    ready,
    identity,
    session.role,
    intent,
    next,
    registerBusiness,
    registerCreator,
    router,
  ]);

  if (nextStep.type !== "pick") {
    return <div className="min-h-dvh bg-canvas" />;
  }

  const name = identity?.name ?? "";
  const email = identity?.email ?? "";
  const businessPrimary = Boolean(guestDraft) || intent !== "creator";

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <BrandLogo height={26} />
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {identity?.id.startsWith("wa:") ? name : email}
      </p>
      <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.03em]">
        How will you use fxgen?
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        {guestDraft
          ? `Your ${guestDraft.businessName} draft comes with you.`
          : "One login. One workspace to start."}
      </p>
      <div className="mt-8 space-y-2">
        <button
          type="button"
          className={`flex min-h-14 w-full items-center justify-center rounded-full px-5 text-[15px] font-medium ${
            businessPrimary
              ? "bg-accent text-ink"
              : "border border-line bg-elevated text-ink"
          }`}
          onClick={() => {
            registerBusiness(name, email);
            router.push("/work/business");
          }}
        >
          For my business
        </button>
        <button
          type="button"
          className={`flex min-h-14 w-full items-center justify-center rounded-full px-5 text-[15px] font-medium ${
            businessPrimary
              ? "border border-line bg-elevated text-ink"
              : "bg-accent text-ink"
          }`}
          onClick={() => {
            registerCreator(
              identity?.id.startsWith("wa:") ? "My studio" : name,
              email,
            );
            router.push("/work/studio");
          }}
        >
          I&apos;m a creator
        </button>
        {identity?.manager ? (
          <button
            type="button"
            className="flex min-h-14 w-full items-center justify-center rounded-full px-5 text-[15px] font-medium text-muted"
            onClick={() => {
              enterManager();
              router.push("/oversight/manager");
            }}
          >
            Operations
          </button>
        ) : null}
      </div>
      <div className="mt-8">
        <SignOutButton />
      </div>
    </div>
  );
}
