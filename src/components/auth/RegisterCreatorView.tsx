"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { EmailLogin } from "@/components/auth/EmailLogin";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/session";
import {
  clearPendingCreatorProfile,
  creatorNameError,
  parseCreatorHandle,
  peekPendingCreatorName,
  stashPendingCreatorHandle,
  suggestCreatorName,
} from "@/lib/creator-registration";

const fieldClass =
  "min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted";

function OpeningStudio() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <p className="text-sm text-muted">Opening your studio</p>
    </div>
  );
}

function CreatorNameForm({
  initialName,
  onOpen,
}: {
  initialName: string;
  onOpen: (input: { creatorName: string; handle?: string }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    const nameError = creatorNameError(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    const parsed = parseCreatorHandle(handle);
    if (parsed.error) {
      setError(parsed.error);
      return;
    }
    stashPendingCreatorHandle(parsed.handle);
    onOpen({ creatorName: name, handle: parsed.handle });
  }

  return (
    <>
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        2 of 2 · Creator name
      </p>
      <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.03em]">
        What should brands call you?
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        This is your creator name. Not a business, not a company SSM name.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        <label className="block">
          <span className="sr-only">Creator name</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            autoComplete="nickname"
            autoFocus
            placeholder="Creator name"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="sr-only">Instagram handle</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            autoComplete="off"
            placeholder="@instagram · optional"
            className={fieldClass}
          />
        </label>
        {error ? <p className="text-sm text-rose">{error}</p> : null}
        <Button type="submit" className="min-h-14 w-full" disabled={!name.trim()}>
          Open my studio
        </Button>
      </form>
      <div className="mt-8">
        <SignOutButton />
      </div>
    </>
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
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <BrandLogo height={26} />
      {!identity ? (
        <>
          <EmailLogin
            intent="creator"
            initialMode="register"
            stepLabel="1 of 2 · Sign in"
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
        <CreatorNameForm
          key={identity.id}
          initialName={pendingName || suggestCreatorName(identity)}
          onOpen={({ creatorName, handle }) => {
            opening.current = true;
            registerCreator({
              creatorName,
              email: identity.email,
              handle,
            });
            clearPendingCreatorProfile();
            router.push("/work/studio");
          }}
        />
      )}
    </div>
  );
}
