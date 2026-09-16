"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  AISHA_CREATOR_ID,
  ASIAM_BUSINESS_ID,
  seedReviews,
} from "@/lib/review";
import {
  defaultBrandIpOffer,
  normalizeIpJob,
  normalizeOffer,
} from "@/lib/brand-ip";
import type {
  BrandIpJob,
  BrandIpOffer,
  LedgerEntry,
  MarketplaceParty,
  ReviewJob,
  SpendRequest,
} from "@/lib/types";

const STORAGE_KEY = "fxgen.marketplace.v1";
const CREATOR_ID = AISHA_CREATOR_ID;

type MarketplaceState = {
  reviews: ReviewJob[];
  ipJobs: BrandIpJob[];
  brandIpOffer: BrandIpOffer;
  spendRequests: SpendRequest[];
  ledger: LedgerEntry[];
  parties: MarketplaceParty[];
};

function hydrateState(raw: Partial<MarketplaceState>): MarketplaceState {
  const seed = seedState();
  return {
    reviews: raw.reviews ?? seed.reviews,
    ipJobs: (raw.ipJobs ?? []).map((job) => normalizeIpJob(job)),
    brandIpOffer: normalizeOffer(raw.brandIpOffer),
    spendRequests: raw.spendRequests ?? [],
    ledger: raw.ledger ?? seed.ledger,
    parties: raw.parties ?? seed.parties,
  };
}

function seedState(): MarketplaceState {
  const reviews = seedReviews();
  let ledger: LedgerEntry[] = [];
  const top = adminTopup(ledger, {
    businessId: ASIAM_BUSINESS_ID,
    amount: 5000,
    actor: "Nadia",
    note: "Opening balance",
    idempotencyKey: "topup:seed:bws-asiam",
  });
  ledger = top.entries;
  for (const job of reviews) {
    const held = holdForJob(ledger, job, "system");
    if (held.ok) ledger = held.entries;
  }
  return {
    reviews,
    ipJobs: [],
    brandIpOffer: defaultBrandIpOffer(),
    spendRequests: [],
    ledger,
    parties: [
      { id: ASIAM_BUSINESS_ID, name: "As I Am by Chef Ton", kind: "business" },
      { id: AISHA_CREATOR_ID, name: "Aisha", kind: "creator" },
    ],
  };
}

type SpendOk = { ok: true };
type SpendFail = { ok: false; error: string };

type MarketplaceApi = {
  ready: boolean;
  reviews: ReviewJob[];
  ipJobs: BrandIpJob[];
  brandIpOffer: BrandIpOffer;
  spendRequests: SpendRequest[];
  ledger: LedgerEntry[];
  parties: MarketplaceParty[];
  upsertReview: (job: ReviewJob) => void;
  patchReview: (id: string, next: ReviewJob) => void;
  addIpJob: (job: BrandIpJob) => void;
  upsertIpJob: (job: BrandIpJob) => void;
  patchIpJob: (id: string, patch: Partial<BrandIpJob>) => void;
  removeIpJob: (id: string) => void;
  setBrandIpOffer: (offer: BrandIpOffer) => void;
  addSpendRequest: (req: SpendRequest) => void;
  removeSpendRequest: (id: string) => void;
  ensureParty: (party: MarketplaceParty) => void;
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
  creatorBalance: (creatorId?: string) => number;
  createHeldJob: (job: ReviewJob, actor: string) => SpendOk | SpendFail;
  createHeldJobs: (jobs: ReviewJob[], actor: string) => SpendOk | SpendFail;
};

const MarketplaceContext = createContext<MarketplaceApi | null>(null);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MarketplaceState>(seedState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MarketplaceState;
        if (parsed.reviews && parsed.ledger) {
          // Restore persisted ledger/jobs after mount (SSR-safe).
          // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage rehydrate
          setState(hydrateState(parsed));
        }
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

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
    setState((s) => ({ ...s, ipJobs: [normalizeIpJob(job), ...s.ipJobs] }));
  }, []);

  const upsertIpJob = useCallback((job: BrandIpJob) => {
    const next = normalizeIpJob(job);
    setState((s) => ({
      ...s,
      ipJobs: [next, ...s.ipJobs.filter((j) => j.id !== next.id)],
    }));
  }, []);

  const patchIpJob = useCallback((id: string, patch: Partial<BrandIpJob>) => {
    setState((s) => ({
      ...s,
      ipJobs: s.ipJobs.map((j) =>
        j.id === id ? normalizeIpJob({ ...j, ...patch }) : j,
      ),
    }));
  }, []);

  const removeIpJob = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      ipJobs: s.ipJobs.filter((j) => j.id !== id),
    }));
  }, []);

  const setBrandIpOffer = useCallback((offer: BrandIpOffer) => {
    setState((s) => ({ ...s, brandIpOffer: normalizeOffer(offer) }));
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
      result = releaseHold(
        s.ledger,
        { ...job, creatorId: CREATOR_ID },
        actor,
      );
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
      reviews: state.reviews,
      ipJobs: state.ipJobs,
      brandIpOffer: state.brandIpOffer,
      spendRequests: state.spendRequests,
      ledger: state.ledger,
      parties: state.parties,
      upsertReview,
      patchReview,
      addIpJob,
      upsertIpJob,
      patchIpJob,
      removeIpJob,
      setBrandIpOffer,
      addSpendRequest,
      removeSpendRequest,
      ensureParty,
      topup,
      holdJob,
      releaseJob,
      refundJob,
      businessBalance: (businessId: string) =>
        balanceOf(state.ledger, businessWallet(businessId)),
      creatorBalance: (creatorId = CREATOR_ID) =>
        balanceOf(state.ledger, creatorWallet(creatorId)),
      createHeldJob,
      createHeldJobs,
    }),
    [
      ready,
      state,
      upsertReview,
      patchReview,
      addIpJob,
      upsertIpJob,
      patchIpJob,
      removeIpJob,
      setBrandIpOffer,
      addSpendRequest,
      removeSpendRequest,
      ensureParty,
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
