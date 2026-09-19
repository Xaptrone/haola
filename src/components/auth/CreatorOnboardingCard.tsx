"use client";

import { useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/Button";
import {
  CREATOR_MARKETS,
  creatorNameError,
  parseCreatorHandle,
} from "@/lib/creator-registration";

const fieldClass =
  "min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted";

export function CreatorOnboardingCard({
  initialName,
  onOpen,
}: {
  initialName: string;
  onOpen: (input: { creatorName: string; handle?: string; market: string }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [handle, setHandle] = useState("");
  const [market, setMarket] = useState("");
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
    if (!market) {
      setError("Pick a market so brands know where to find you.");
      return;
    }
    onOpen({ creatorName: name, handle: parsed.handle, market });
  }

  return (
    <>
      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        Your card
      </p>
      <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.03em]">
        What should brands call you?
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        This name sits on every match. Not a company, not an SSM name.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-[13px] text-muted">Creator name</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            autoComplete="nickname"
            autoFocus
            placeholder="Aisha"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] text-muted">
            Instagram · optional
          </span>
          <input
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value);
              if (error) setError(null);
            }}
            autoComplete="off"
            placeholder="@aisha"
            className={fieldClass}
          />
        </label>
        <fieldset className="m-0 min-w-0 space-y-2 border-0 p-0">
          <legend className="mb-2 px-0 text-[13px] font-normal text-muted">
            Where should brands find you?
          </legend>
          {CREATOR_MARKETS.map((opt) => {
            const selected = market === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setMarket(opt);
                  if (error) setError(null);
                }}
                className={`flex min-h-12 w-full items-center rounded-[14px] border px-4 text-left text-[15px] text-ink transition-[border-color] duration-[var(--duration-ui)] ease-[var(--ease-out)] ${
                  selected
                    ? "border-accent bg-elevated"
                    : "border-line bg-elevated hover:border-ink/25"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </fieldset>
        {error ? <p className="text-sm text-rose">{error}</p> : null}
        <Button
          type="submit"
          className="min-h-14 w-full"
          disabled={!name.trim() || !market}
        >
          Open my studio
        </Button>
      </form>
      <div className="mt-8">
        <SignOutButton />
      </div>
    </>
  );
}
