"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { EmailLogin } from "@/components/auth/EmailLogin";
import { CreatorOnboardingCard } from "@/components/auth/CreatorOnboardingCard";
import { useSession } from "@/lib/session";
import {
  clearPendingCreatorProfile,
  peekPendingCreatorName,
  suggestCreatorName,
} from "@/lib/creator-registration";

function OpeningStudio() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <p className="text-sm text-muted">Opening your studio</p>
    </div>
  );
}

export function RegisterCreatorView({
  googleConfigured,
  whatsappConfigured,
}: {
  googleConfigured: boolean;
  whatsappConfigured: boolean;
}) {
  const { session, ready, identity, registerCreator } = useSession();
  const router = useRouter();
  const opening = useRef(false);

  const hasCreatorStudio = session.role === "creator" && Boolean(session.creatorWorkspace);
  const hasOtherHome =
    (session.role === "business" && Boolean(session.businessWorkspace)) ||
    session.role === "manager";
  const pendingName = ready ? peekPendingCreatorName() : "";

  useEffect(() => {
    if (!ready) return;

    if (hasCreatorStudio) {
      router.replace("/work/studio");
      return;
    }
    if (session.role === "business" && session.businessWorkspace) {
      router.replace("/work/business");
      return;
    }
    if (session.role === "manager") {
      router.replace("/oversight/manager");
      return;
    }
  }, [
    ready,
    hasCreatorStudio,
    session.role,
    session.businessWorkspace,
    router,
  ]);

  if (!ready) {
    return <div className="min-h-dvh bg-canvas" />;
  }

  if (hasCreatorStudio || hasOtherHome) {
    return <OpeningStudio />;
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <BrandLogo height={26} />
      {!identity ? (
        <>
          <EmailLogin
            intent="creator"
            initialMode="register"
            stepLabel="Account"
            loginHref="/login?intent=creator"
            callbackUrl="/register/creator"
            googleConfigured={googleConfigured}
            whatsappConfigured={whatsappConfigured}
          />
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link href="/creators" className="text-center text-sm text-muted">
              Back
            </Link>
          </div>
        </>
      ) : (
        <CreatorOnboardingCard
          key={identity.id}
          initialName={pendingName || suggestCreatorName(identity)}
          onOpen={({ creatorName, handle, market }) => {
            opening.current = true;
            registerCreator({
              creatorName,
              email: identity.email,
              handle,
              market,
            });
            clearPendingCreatorProfile();
            router.push("/work/studio");
          }}
        />
      )}
    </div>
  );
}
