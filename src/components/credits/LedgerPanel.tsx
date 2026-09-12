"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { rm, reasonLabel, walletLabel } from "@/lib/credits";
import { useMarketplace } from "@/lib/marketplace";
import type { LedgerEntry } from "@/lib/types";

export function LedgerList({
  entries,
  empty = "No ledger entries yet.",
}: {
  entries: LedgerEntry[];
  empty?: string;
}) {
  if (!entries.length) {
    return <p className="text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-line rounded-[16px] border border-line bg-surface">
      {entries.map((e) => (
        <li key={e.id} className="flex items-start justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm text-ink">{reasonLabel(e.reason)}</p>
            <p className="mt-1 text-xs text-muted">
              {walletLabel(e.debitWallet)} → {walletLabel(e.creditWallet)} · {e.actor}
            </p>
          </div>
          <p className="font-mono text-[13px] text-ink">{rm(e.amount)}</p>
        </li>
      ))}
    </ul>
  );
}

export function AdminTopup() {
  const { parties, topup } = useMarketplace();
  const businesses = parties.filter((p) => p.kind === "business");
  const [businessId, setBusinessId] = useState(businesses[0]?.id ?? "");
  const [amount, setAmount] = useState("1000");
  const [note, setNote] = useState("Offline transfer received");
  const [message, setMessage] = useState<string | null>(null);

  const selected = businessId || businesses[0]?.id || "";

  return (
    <div className="space-y-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        Manual top-up
      </p>
      <p className="text-sm text-muted">
        Credits mint from clearing after you confirm payment. 1 credit = RM 1.00.
      </p>
      <label className="block text-sm text-muted">
        Business
        <select
          value={selected}
          onChange={(e) => setBusinessId(e.target.value)}
          className="mt-2 min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 text-ink outline-none"
        >
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        inputMode="numeric"
        placeholder="Amount"
        className="min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Reason"
        className="min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted"
      />
      <Button
        className="min-h-14 w-full"
        onClick={() => {
          const n = Number(amount);
          if (!selected || !Number.isFinite(n) || n <= 0) {
            setMessage("Enter a positive amount.");
            return;
          }
          const result = topup({
            businessId: selected,
            amount: n,
            actor: "Nadia",
            note,
          });
          if (!result.ok) {
            setMessage(result.error ?? "Top-up failed.");
            return;
          }
          setMessage(`Topped up ${rm(n)}.`);
        }}
      >
        Add credits
      </Button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}

export function BalanceLine({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  const text = useMemo(() => rm(amount), [amount]);
  return (
    <div className="rounded-[16px] border border-line bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-2xl font-medium tracking-tight">{text}</p>
    </div>
  );
}
