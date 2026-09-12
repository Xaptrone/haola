import { uid } from "@/lib/ids";
import type {
  LedgerEntry,
  LedgerReason,
  ReviewJob,
  WalletId,
} from "@/lib/types";

export const CREATOR_SHARE = 0.7;

export const PRICE = {
  campaign: 800,
  brandIp: 1200,
  packAsset: 400,
} as const;

export function businessWallet(businessId: string): WalletId {
  return `business:${businessId}`;
}

export function creatorWallet(creatorId: string): WalletId {
  return `creator:${creatorId}`;
}

export const PLATFORM_REVENUE: WalletId = "platform_revenue";
export const ESCROW: WalletId = "escrow";
export const PLATFORM_CLEARING: WalletId = "platform_clearing";

export function rm(credits: number): string {
  return `RM ${credits.toLocaleString("en-MY")}`;
}

export function balanceOf(entries: LedgerEntry[], wallet: WalletId): number {
  return entries.reduce((sum, entry) => {
    if (entry.creditWallet === wallet) return sum + entry.amount;
    if (entry.debitWallet === wallet) return sum - entry.amount;
    return sum;
  }, 0);
}

export function hasIdempotencyKey(
  entries: LedgerEntry[],
  key: string,
): LedgerEntry | undefined {
  return entries.find((e) => e.idempotencyKey === key);
}

type PostInput = {
  idempotencyKey: string;
  debitWallet: WalletId;
  creditWallet: WalletId;
  amount: number;
  reason: LedgerReason;
  refType: LedgerEntry["refType"];
  refId: string;
  actor: string;
};

export type LedgerResult = {
  ok: boolean;
  entries: LedgerEntry[];
  error?: string;
  duplicate?: boolean;
};

function post(entries: LedgerEntry[], input: PostInput): LedgerResult {
  if (input.amount <= 0) {
    return { ok: false, entries, error: "Amount must be positive." };
  }
  const existing = hasIdempotencyKey(entries, input.idempotencyKey);
  if (existing) {
    return { ok: true, entries, duplicate: true };
  }
  const next: LedgerEntry = {
    id: uid("led"),
    idempotencyKey: input.idempotencyKey,
    debitWallet: input.debitWallet,
    creditWallet: input.creditWallet,
    amount: input.amount,
    reason: input.reason,
    refType: input.refType,
    refId: input.refId,
    actor: input.actor,
    at: "Just now",
  };
  return { ok: true, entries: [next, ...entries] };
}

export function adminTopup(
  entries: LedgerEntry[],
  input: {
    businessId: string;
    amount: number;
    actor: string;
    note: string;
    idempotencyKey?: string;
  },
): LedgerResult {
  const key =
    input.idempotencyKey ??
    `topup:${input.businessId}:${input.amount}:${input.note}`;
  return post(entries, {
    idempotencyKey: key,
    debitWallet: PLATFORM_CLEARING,
    creditWallet: businessWallet(input.businessId),
    amount: input.amount,
    reason: "admin_topup",
    refType: "topup",
    refId: input.businessId,
    actor: input.actor,
  });
}

export function holdKey(jobId: string): string {
  return `hold:${jobId}`;
}

export function holdForJob(
  entries: LedgerEntry[],
  job: Pick<ReviewJob, "id" | "businessId" | "priceCredits">,
  actor: string,
): LedgerResult {
  const wallet = businessWallet(job.businessId);
  const available = balanceOf(entries, wallet);
  if (available < job.priceCredits) {
    return {
      ok: false,
      entries,
      error: `Insufficient credits. Need ${rm(job.priceCredits)}, have ${rm(available)}.`,
    };
  }
  return post(entries, {
    idempotencyKey: holdKey(job.id),
    debitWallet: wallet,
    creditWallet: ESCROW,
    amount: job.priceCredits,
    reason: "hold",
    refType: "job",
    refId: job.id,
    actor,
  });
}

export function refundHold(
  entries: LedgerEntry[],
  job: Pick<ReviewJob, "id" | "businessId" | "priceCredits">,
  actor: string,
): LedgerResult {
  const held = hasIdempotencyKey(entries, holdKey(job.id));
  if (!held) {
    return { ok: false, entries, error: "No hold to refund." };
  }
  const released = hasIdempotencyKey(entries, `release:creator:${job.id}`);
  if (released) {
    return { ok: false, entries, error: "Already released. Cannot refund." };
  }
  return post(entries, {
    idempotencyKey: `refund:${job.id}`,
    debitWallet: ESCROW,
    creditWallet: businessWallet(job.businessId),
    amount: job.priceCredits,
    reason: "refund",
    refType: "job",
    refId: job.id,
    actor,
  });
}

export function releaseHold(
  entries: LedgerEntry[],
  job: Pick<ReviewJob, "id" | "priceCredits"> & { creatorId: string },
  actor: string,
): LedgerResult {
  const held = hasIdempotencyKey(entries, holdKey(job.id));
  if (!held) {
    return { ok: false, entries, error: "No hold to release." };
  }
  const refunded = hasIdempotencyKey(entries, `refund:${job.id}`);
  if (refunded) {
    return { ok: false, entries, error: "Already refunded." };
  }
  const creatorAmount = Math.round(job.priceCredits * CREATOR_SHARE);
  const platformAmount = job.priceCredits - creatorAmount;
  const creatorPost = post(entries, {
    idempotencyKey: `release:creator:${job.id}`,
    debitWallet: ESCROW,
    creditWallet: creatorWallet(job.creatorId),
    amount: creatorAmount,
    reason: "release_creator",
    refType: "job",
    refId: job.id,
    actor,
  });
  if (!creatorPost.ok) return creatorPost;
  return post(creatorPost.entries, {
    idempotencyKey: `release:platform:${job.id}`,
    debitWallet: ESCROW,
    creditWallet: PLATFORM_REVENUE,
    amount: platformAmount,
    reason: "release_platform",
    refType: "job",
    refId: job.id,
    actor,
  });
}

export function reasonLabel(reason: LedgerReason): string {
  switch (reason) {
    case "admin_topup":
      return "Admin top-up";
    case "hold":
      return "Hold · escrow";
    case "release_creator":
      return "Release · creator";
    case "release_platform":
      return "Release · platform";
    case "refund":
      return "Refund hold";
    default: {
      const _exhaustive: never = reason;
      return _exhaustive;
    }
  }
}

export function walletLabel(wallet: WalletId): string {
  if (wallet === "platform_revenue") return "Platform revenue";
  if (wallet === "escrow") return "Escrow";
  if (wallet === "platform_clearing") return "Clearing";
  if (wallet.startsWith("business:")) return `Business · ${wallet.slice("business:".length)}`;
  return `Creator · ${wallet.slice("creator:".length)}`;
}
