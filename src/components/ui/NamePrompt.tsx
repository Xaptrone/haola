"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NamePrompt({
  question,
  placeholder,
  fieldLabel,
  submitLabel = "Continue",
  onSubmit,
}: {
  question: string;
  placeholder: string;
  fieldLabel: string;
  submitLabel?: string;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState("");

  function submit(event: { preventDefault(): void }) {
    event.preventDefault();
    const next = name.trim();
    if (!next) return;
    onSubmit(next);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-[17px] font-medium leading-6 text-ink">{question}</p>
      <label className="block">
        <span className="sr-only">{fieldLabel}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          placeholder={placeholder}
          className="min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 text-ink outline-none placeholder:text-muted"
        />
      </label>
      <Button type="submit" className="min-h-14 w-full" disabled={!name.trim()}>
        {submitLabel}
      </Button>
    </form>
  );
}
