"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  adminTopup,
  balanceOf,
  businessWallet,
  creatorWallet,
  holdForJob,
  refundHold,
  releaseHold,
  rm,
  type LedgerResult,
} from "@/lib/credits";
import { uid } from "@/lib/ids";
import {
  demoMarketplace,
  emptyMarketplace,
  LIVE_MARKET_KEY,
  parseMarketplaceState,
  PREVIEW_MARKET_KEY,
  type MarketplaceState,
} from "@/lib/marketplace-state";
import { activePreviewPreset } from "@/lib/preview";
import type {
  BrandIpJob,
  LedgerEntry,
  MarketplaceParty,
  ReviewJob,
  SpendRequest,
} from "@/lib/types";

type SpendOk = { ok: true };
type SpendFail = { ok: false; error: string };

type MarketplaceApi = {
  ready: boolean;
  preview: boolean;
  reviews: ReviewJob[];
  ipJobs: BrandIpJob[];
  spendRequests: SpendRequest[];
  ledger: LedgerEntry[];
  parties: MarketplaceParty[];
  upsertReview: (job: ReviewJob) => void;
  patchReview: (id: string, next: ReviewJob) => void;
  addIpJob: (job: BrandIpJob) => void;
  patchIpJob: (id: string, patch: Partial<BrandIpJob>) => void;
  addSpendRequest: (req: SpendRequest) => void;
  removeSpendRequest: (id: string) => void;
  ensureParty: (party: MarketplaceParty) => void;
  ensureDemo: () => void;
  ensureLive: () => void;
  topup: (input: {
    businessId: string;
    amount: number;
    actor: string;
    note: string;
  }) => LedgerResult;
  holdJob: (job: ReviewJob, actor: string) => LedgerResult;
  releaseJob: (job: ReviewJob, actor: string) => LedgerResult;
  refundJob: (job: ReviewJob, actor: string) => LedgerResult;
  businessBalance: (businessId: string) => number;
  creatorBalance: (creatorId: string) => number;
  createHeldJob: (job: ReviewJob, actor: string) => SpendOk | SpendFail;
  createHeldJobs: (jobs: ReviewJob[], actor: string) => SpendOk | SpendFail;
};

const MarketplaceContext = createContext<MarketplaceApi | null>(null);

function readStore(key: string, fallback: MarketplaceState): MarketplaceState {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return parseMarketplaceState(raw, fallback);
  } catch {
    return fallback;
  }
}

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MarketplaceState>(emptyMarketplace);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);
  const previewRef = useRef(false);

  const hydrate = useCallback((nextPreview: boolean) => {
    previewRef.current = nextPreview;
    setPreview(nextPreview);
    if (nextPreview) {
      setState(readStore(PREVIEW_MARKET_KEY, demoMarketplace()));
    } else {
      setState(readStore(LIVE_MARKET_KEY, emptyMarketplace()));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const preset = activePreviewPreset(
      window.location.pathname,
      window.location.search,
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydrate
    hydrate(Boolean(preset));
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    const key = preview ? PREVIEW_MARKET_KEY : LIVE_MARKET_KEY;
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, ready, preview]);

  const ensureDemo = useCallback(() => {
    if (previewRef.current) return;
    hydrate(true);
  }, [hydrate]);

  const ensureLive = useCallback(() => {
    if (!previewRef.current) return;
    hydrate(false);
  }, [hydrate]);

  const upsertReview = useCallback((job: ReviewJob) => {
    setState((s) => ({
      ...s,
      reviews: [job, ...s.reviews.filter((r) => r.id !== job.id)],
    }));
  }, []);

  const patchReview = useCallback((id: string, next: ReviewJob) => {
    setState((s) => ({
      ...s,
      reviews: s.reviews.map((r) => (r.id === id ? next : r)),
    }));
  }, []);

  const addIpJob = useCallback((job: BrandIpJob) => {
    setState((s) => ({ ...s, ipJobs: [job, ...s.ipJobs] }));
  }, []);

  const patchIpJob = useCallback((id: string, patch: Partial<BrandIpJob>) => {
    setState((s) => ({
      ...s,
      ipJobs: s.ipJobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    }));
  }, []);

  const addSpendRequest = useCallback((req: SpendRequest) => {
    setState((s) => ({ ...s, spendRequests: [req, ...s.spendRequests] }));
  }, []);

  const removeSpendRequest = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      spendRequests: s.spendRequests.filter((r) => r.id !== id),
    }));
  }, []);

  const ensureParty = useCallback((party: MarketplaceParty) => {
    setState((s) =>
      s.parties.some((p) => p.id === party.id)
        ? s
        : { ...s, parties: [...s.parties, party] },
    );
  }, []);

  const topup = useCallback<MarketplaceApi["topup"]>((input) => {
    let result: LedgerResult = { ok: false, entries: [], error: "Not ready" };
    setState((s) => {
      result = adminTopup(s.ledger, {
        ...input,
        idempotencyKey: `topup:${input.businessId}:${uid("k")}`,
      });
      if (!result.ok) return s;
      return { ...s, ledger: result.entries };
    });
    return result;
  }, []);

  const holdJob = useCallback<MarketplaceApi["holdJob"]>((job, actor) => {
    let result: LedgerResult = { ok: false, entries: [], error: "Not ready" };
    setState((s) => {
      result = holdForJob(s.ledger, job, actor);
      if (!result.ok) return s;
      return { ...s, ledger: result.entries };
    });
    return result;
  }, []);

  const releaseJob = useCallback<MarketplaceApi["releaseJob"]>((job, actor) => {
    let result: LedgerResult = { ok: false, entries: [], error: "Not ready" };
    setState((s) => {
      const party = s.parties.find(
        (p) => p.kind === "creator" && p.name === job.creatorName,
      );
      result = party
        ? releaseHold(s.ledger, { ...job, creatorId: party.id }, actor)
        : {
            ok: false,
            entries: s.ledger,
            error: "No creator party to release to.",
          };
      if (!result.ok) return s;
      return { ...s, ledger: result.entries };
    });
    return result;
  }, []);

  const refundJob = useCallback<MarketplaceApi["refundJob"]>((job, actor) => {
    let result: LedgerResult = { ok: false, entries: [], error: "Not ready" };
    setState((s) => {
      result = refundHold(s.ledger, job, actor);
      if (!result.ok) return s;
      return { ...s, ledger: result.entries };
    });
    return result;
  }, []);

  const createHeldJobs = useCallback<MarketplaceApi["createHeldJobs"]>(
    (jobs, actor) => {
      let result: SpendOk | SpendFail = { ok: false, error: "Not ready" };
      setState((s) => {
        let ledger = s.ledger;
        for (const job of jobs) {
          const held = holdForJob(ledger, job, actor);
          if (!held.ok) {
            result = { ok: false, error: held.error ?? "Hold failed." };
            return s;
          }
          ledger = held.entries;
        }
        result = { ok: true };
        const ids = new Set(jobs.map((j) => j.id));
        return {
          ...s,
          ledger,
          reviews: [...jobs, ...s.reviews.filter((r) => !ids.has(r.id))],
        };
      });
      return result;
    },
    [],
  );

  const createHeldJob = useCallback<MarketplaceApi["createHeldJob"]>(
    (job, actor) => createHeldJobs([job], actor),
    [createHeldJobs],
  );

  const value = useMemo<MarketplaceApi>(
    () => ({
      ready,
      preview,
      reviews: state.reviews,
      ipJobs: state.ipJobs,
      spendRequests: state.spendRequests,
      ledger: state.ledger,
      parties: state.parties,
      upsertReview,
      patchReview,
      addIpJob,
      patchIpJob,
      addSpendRequest,
      removeSpendRequest,
      ensureParty,
      ensureDemo,
      ensureLive,
      topup,
      holdJob,
      releaseJob,
      refundJob,
      businessBalance: (businessId: string) =>
        balanceOf(state.ledger, businessWallet(businessId)),
      creatorBalance: (creatorId: string) =>
        balanceOf(state.ledger, creatorWallet(creatorId)),
      createHeldJob,
      createHeldJobs,
    }),
    [
      ready,
      preview,
      state,
      upsertReview,
      patchReview,
      addIpJob,
      patchIpJob,
      addSpendRequest,
      removeSpendRequest,
      ensureParty,
      ensureDemo,
      ensureLive,
      topup,
      holdJob,
      releaseJob,
      refundJob,
      createHeldJob,
      createHeldJobs,
    ],
  );

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error("useMarketplace must be used within MarketplaceProvider");
  return ctx;
}

export { rm };
