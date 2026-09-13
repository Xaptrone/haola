"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function PickOrCreateBusiness({
  question,
  existing,
  submitLabel = "Continue",
  onPick,
}: {
  question: string;
  existing: string[];
  submitLabel?: string;
  onPick: (name: string) => void;
}) {
  const names = existing.map((name) => name.trim()).filter(Boolean);
  const [creating, setCreating] = useState(names.length === 0);
  const [name, setName] = useState("");

  function submit(event: { preventDefault(): void }) {
    event.preventDefault();
    const next = name.trim();
    if (!next) return;
    onPick(next);
    setName("");
  }

  return (
    <div className="space-y-3">
      <p className="text-[17px] font-medium leading-6 text-ink">{question}</p>
      {names.length ? (
        <div className="flex flex-col gap-2">
          {names.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onPick(opt)}
              className="min-h-12 rounded-[14px] border border-line bg-elevated px-4 text-left text-[15px] text-ink transition-[border-color] duration-[var(--duration-ui)] ease-[var(--ease-out)] hover:border-accent/40"
            >
              {opt}
            </button>
          ))}
        </div>
      ) : null}
      {names.length && !creating ? (
        <button
          type="button"
          className="text-sm text-muted hover:text-ink"
          onClick={() => setCreating(true)}
        >
          Create a new business
        </button>
      ) : null}
      {creating ? (
        <form onSubmit={submit} className="space-y-3">
          {names.length ? (
            <p className="text-sm text-muted">Name the new business.</p>
          ) : null}
          <label className="block">
            <span className="sr-only">Business name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="organization"
              placeholder="Business name"
              className="min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted"
            />
          </label>
          <Button type="submit" className="min-h-14 w-full" disabled={!name.trim()}>
            {submitLabel}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
