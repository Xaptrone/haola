"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { uid } from "./ids";
import type {
  BusinessWorkspace,
  CampaignDraft,
  CreatorWorkspace,
  Session,
} from "./types";
import { previewPresetFromLocation, type DemoPreset } from "./preview";
import { ASIAM_BUSINESS_ID, AISHA_CREATOR_ID } from "./review";

const GUEST_KEY = "fxgen.guest.v1";

export type AuthIdentity = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  manager?: boolean;
};

function workspaceKey(id: string) {
  return `fxgen.workspace.${id}`;
}

const emptySession = (): Session => ({
  role: "anonymous",
  displayName: "",
  email: "",
  creatorWorkspace: null,
  businessWorkspace: null,
});

function sampleKol(): CreatorWorkspace["kols"][number] {
  return {
    id: "kol-mei",
    name: "Mei Lin",
    market: "Penang & KL",
    audience: "KL foodies",
    categories: "F&B",
    language: "EN / 中文",
    personality: "Warm, precise, never shouty",
    amf: 82,
    match: 91,
  };
}

function newCreatorWorkspace(name: string): CreatorWorkspace {
  return {
    kind: "creator",
    id: uid("cws"),
    name: `${name}'s studio`,
    kols: [],
    feed: [],
    canvasIntent: "blank",
  };
}

function newBusinessWorkspace(guestDraft: CampaignDraft | null): BusinessWorkspace {
  const stage = guestDraft ? "ready" : "welcome";
  const name = guestDraft?.businessName || "My business";
  return {
    kind: "business",
    id: uid("bws"),
    name,
    seat: "owner",
    brands: guestDraft
      ? [
          {
            id: uid("brd"),
            name: guestDraft.businessName,
            city: "Malaysia",
            outlets: "To confirm",
          },
        ]
      : [],
    onboardingStage: stage,
    guestDraft,
    pendingApprovals: 0,
    feed: guestDraft
      ? [
          {
            id: "draft-continue",
            title: "Continue your campaign",
            detail: `${guestDraft.businessName} · ${guestDraft.goal}`,
            href: "/work/business?flow=campaign",
            tone: "action",
          },
        ]
      : [
          {
            id: "setup",
            title: "Set up your business",
            detail: "AI will ask three questions. No long form.",
            href: "/work/business?flow=setup",
            tone: "action",
          },
        ],
  };
}

const readyBusiness = (): Session => ({
  role: "business",
  displayName: "Shoant",
  email: "owner@asiam.my",
  creatorWorkspace: null,
  businessWorkspace: {
    kind: "business",
    id: ASIAM_BUSINESS_ID,
    name: "As I Am by Chef Ton",
    seat: "owner",
    brands: [
      {
        id: "brd-asiam",
        name: "As I Am by Chef Ton",
        city: "Kuala Lumpur",
        outlets: "One outlet",
      },
    ],
    onboardingStage: "ready",
    guestDraft: null,
    pendingApprovals: 2,
    feed: [
      {
        id: "rev-2",
        title: "Videos waiting on you",
        detail: "Script, rough, and edited gates",
        href: "/work/business?tab=content",
        tone: "action",
      },
      {
        id: "dl",
        title: "Campaign approaching deadline",
        detail: "Songkran set · 3 days left",
        href: "/work/business?tab=campaigns",
        tone: "info",
      },
      {
        id: "ai",
        title: "AI recommends a weekday lunch hook",
        detail: "Your last reel over-indexed after 8pm.",
        href: "/work/business?tab=create",
        tone: "info",
      },
    ],
  },
});

const activeCreator = (): Session => ({
  role: "creator",
  displayName: "Aisha",
  email: "aisha@studio.my",
  businessWorkspace: null,
  creatorWorkspace: {
    kind: "creator",
    id: AISHA_CREATOR_ID,
    name: "Aisha's studio",
    kols: [sampleKol()],
    canvasIntent: null,
    feed: [
      {
        id: "amf",
        title: "Mei Lin has an AMF of 82",
        detail: "Predicted · inspect factors",
        href: "/work/studio?kol=kol-mei",
        tone: "info",
      },
      {
        id: "match",
        title: "Jobs waiting in your studio",
        detail: "Submit the next pipeline step",
        href: "/work/studio?tab=campaigns",
        tone: "action",
      },
      {
        id: "pay",
        title: "Earnings land in credits after approval",
        detail: "Payout rail comes later",
        href: "/work/studio?tab=profile",
        tone: "money",
      },
    ],
  },
});

type SessionApi = {
  session: Session;
  ready: boolean;
  identity: AuthIdentity | null;
  guestDraft: CampaignDraft | null;
  setGuestDraft: (draft: CampaignDraft | null) => void;
  registerCreator: (name: string, email: string) => void;
  registerBusiness: (name: string, email: string) => void;
  loginReadyBusiness: () => void;
  loginActiveCreator: () => void;
  loginNewCreator: () => void;
  loginNewBusiness: () => void;
  loginManager: () => void;
  enterManager: () => void;
  logout: () => void;
  patchCreator: (patch: Partial<CreatorWorkspace>) => void;
  patchBusiness: (patch: Partial<BusinessWorkspace>) => void;
  loadPreset: (id: DemoPreset) => void;
};

export type { DemoPreset } from "./preview";

const SessionContext = createContext<SessionApi | null>(null);

function sessionFromPreset(id: DemoPreset): {
  session: Session;
  guestDraft: CampaignDraft | null;
} {
  if (id === "guest") {
    return { session: emptySession(), guestDraft: null };
  }
  if (id === "creator-new") {
    return {
      session: {
        role: "creator",
        displayName: "Aisha",
        email: "aisha@studio.my",
        businessWorkspace: null,
        creatorWorkspace: newCreatorWorkspace("Aisha"),
      },
      guestDraft: null,
    };
  }
  if (id === "creator-active") {
    return { session: activeCreator(), guestDraft: null };
  }
  if (id === "business-new") {
    return {
      session: {
        role: "business",
        displayName: "Shoant",
        email: "owner@asiam.my",
        creatorWorkspace: null,
        businessWorkspace: newBusinessWorkspace(null),
      },
      guestDraft: null,
    };
  }
  if (id === "business-draft") {
    const draft: CampaignDraft = {
      id: "draft-guest",
      businessName: "As I Am by Chef Ton",
      goal: "Bookings",
      story: "Tasting menu for first-time visitors",
    };
    return {
      session: {
        role: "business",
        displayName: "Shoant",
        email: "owner@asiam.my",
        creatorWorkspace: null,
        businessWorkspace: newBusinessWorkspace(draft),
      },
      guestDraft: draft,
    };
  }
  if (id === "business-ready") {
    return { session: readyBusiness(), guestDraft: null };
  }
  return {
    session: {
      role: "manager",
      displayName: "Nadia",
      email: "nadia@fxgen.my",
      creatorWorkspace: null,
      businessWorkspace: null,
    },
    guestDraft: null,
  };
}

export function SessionProvider({
  children,
  identity,
  authReady,
}: {
  children: React.ReactNode;
  identity: AuthIdentity | null;
  authReady: boolean;
}) {
  const [session, setSession] = useState<Session>(emptySession);
  const [guestDraft, setGuestDraft] = useState<CampaignDraft | null>(null);
  const [ready, setReady] = useState(false);
  const identityId = identity?.id ?? "";
  const identityEmail = identity?.email ?? "";
  const identityName = identity?.name ?? "";

  useEffect(() => {
    const preset = previewPresetFromLocation(
      window.location.pathname,
      window.location.search,
    );
    if (!authReady && !preset) return;
    try {
      const guestRaw = localStorage.getItem(GUEST_KEY);
      if (guestRaw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- guest draft rehydrate
        setGuestDraft(JSON.parse(guestRaw) as CampaignDraft);
      }
      if (preset) {
        const next = sessionFromPreset(preset);
        setSession(next.session);
        setGuestDraft(next.guestDraft);
      } else if (identityId) {
        const raw = localStorage.getItem(workspaceKey(identityId));
        if (raw) {
          const parsed = JSON.parse(raw) as Session;
          if (parsed.businessWorkspace) {
            parsed.businessWorkspace = {
              ...parsed.businessWorkspace,
              seat: parsed.businessWorkspace.seat ?? "owner",
              brands: parsed.businessWorkspace.brands ?? [],
            };
          }
          setSession({
            ...parsed,
            displayName: parsed.displayName || identityName,
            email: identityEmail,
          });
        } else {
          setSession({
            ...emptySession(),
            displayName: identityName,
            email: identityEmail,
          });
        }
      } else {
        setSession(emptySession());
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [authReady, identityId, identityEmail, identityName]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(GUEST_KEY, JSON.stringify(guestDraft));
    if (!identityId) return;
    if (session.role === "anonymous") {
      try {
        const raw = localStorage.getItem(workspaceKey(identityId));
        if (raw) {
          const parsed = JSON.parse(raw) as Session;
          if (parsed.role && parsed.role !== "anonymous") return;
        }
      } catch {
        /* ignore */
      }
    }
    localStorage.setItem(workspaceKey(identityId), JSON.stringify(session));
  }, [session, guestDraft, ready, identityId]);

  const registerCreator = useCallback((name: string, email: string) => {
    setSession({
      role: "creator",
      displayName: name,
      email,
      businessWorkspace: null,
      creatorWorkspace: newCreatorWorkspace(name),
    });
  }, []);

  const registerBusiness = useCallback(
    (name: string, email: string) => {
      setSession({
        role: "business",
        displayName: name,
        email,
        creatorWorkspace: null,
        businessWorkspace: newBusinessWorkspace(guestDraft),
      });
    },
    [guestDraft],
  );

  const patchCreator = useCallback((patch: Partial<CreatorWorkspace>) => {
    setSession((s) =>
      s.creatorWorkspace
        ? { ...s, creatorWorkspace: { ...s.creatorWorkspace, ...patch } }
        : s,
    );
  }, []);

  const patchBusiness = useCallback((patch: Partial<BusinessWorkspace>) => {
    setSession((s) =>
      s.businessWorkspace
        ? { ...s, businessWorkspace: { ...s.businessWorkspace, ...patch } }
        : s,
    );
  }, []);

  const logout = useCallback(() => {
    setSession(emptySession());
  }, []);

  const enterManager = useCallback(() => {
    if (!identity) return;
    setSession({
      role: "manager",
      displayName: identity.name,
      email: identity.email,
      creatorWorkspace: null,
      businessWorkspace: null,
    });
  }, [identity]);

  const loadPreset = useCallback((id: DemoPreset) => {
    const next = sessionFromPreset(id);
    setGuestDraft(next.guestDraft);
    setSession(next.session);
  }, []);

  const value = useMemo<SessionApi>(
    () => ({
      session,
      ready,
      identity,
      guestDraft,
      setGuestDraft,
      registerCreator,
      registerBusiness,
      loginReadyBusiness: () => loadPreset("business-ready"),
      loginActiveCreator: () => loadPreset("creator-active"),
      loginNewCreator: () => loadPreset("creator-new"),
      loginNewBusiness: () => loadPreset("business-new"),
      loginManager: () => loadPreset("manager"),
      enterManager,
      logout,
      patchCreator,
      patchBusiness,
      loadPreset,
    }),
    [
      session,
      ready,
      identity,
      guestDraft,
      registerCreator,
      registerBusiness,
      enterManager,
      logout,
      patchCreator,
      patchBusiness,
      loadPreset,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
