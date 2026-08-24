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

const STORAGE_KEY = "haola.session.v1";

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
    audience: "25–34 food explorers",
    categories: "Thai fine dining, night markets",
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

function newBusinessWorkspace(
  name: string,
  guestDraft: CampaignDraft | null,
): BusinessWorkspace {
  const stage = guestDraft ? "ready" : "welcome";
  return {
    kind: "business",
    id: uid("bws"),
    name,
    restaurants: guestDraft
      ? [
          {
            id: uid("rst"),
            name: guestDraft.restaurantName,
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
            detail: `${guestDraft.restaurantName} · ${guestDraft.goal}`,
            href: "/work/business?flow=campaign",
            tone: "action",
          },
        ]
      : [
          {
            id: "setup",
            title: "Set up your restaurant",
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
    id: "bws-asiam",
    name: "As I Am by Chef Ton",
    restaurants: [
      {
        id: "rst-asiam",
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
        title: "Two videos need your review",
        detail: "Mei Lin · tasting menu reel",
        href: "/work/review",
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
        href: "/work/business?flow=campaign",
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
    id: "cws-aisha",
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
        title: "As I Am matches Mei at 91%",
        detail: "Accept campaign or compare KOLs",
        href: "/work/studio?tab=campaigns",
        tone: "action",
      },
      {
        id: "pay",
        title: "RM500 is available for payout",
        detail: "Approved content · Mar",
        href: "/work/studio?tab=profile",
        tone: "money",
      },
    ],
  },
});

type SessionApi = {
  session: Session;
  ready: boolean;
  guestDraft: CampaignDraft | null;
  setGuestDraft: (draft: CampaignDraft | null) => void;
  registerCreator: (name: string, email: string) => void;
  registerBusiness: (name: string, email: string) => void;
  loginReadyBusiness: () => void;
  loginActiveCreator: () => void;
  loginNewCreator: () => void;
  loginNewBusiness: () => void;
  loginManager: () => void;
  logout: () => void;
  patchCreator: (patch: Partial<CreatorWorkspace>) => void;
  patchBusiness: (patch: Partial<BusinessWorkspace>) => void;
  loadPreset: (id: DemoPreset) => void;
};

export type DemoPreset =
  | "guest"
  | "creator-new"
  | "creator-active"
  | "business-new"
  | "business-draft"
  | "business-ready"
  | "manager";

const SessionContext = createContext<SessionApi | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(emptySession);
  const [guestDraft, setGuestDraft] = useState<CampaignDraft | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          session: Session;
          guestDraft: CampaignDraft | null;
        };
        setSession(parsed.session);
        setGuestDraft(parsed.guestDraft);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ session, guestDraft }),
    );
  }, [session, guestDraft, ready]);

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
        businessWorkspace: newBusinessWorkspace(name, guestDraft),
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

  const loadPreset = useCallback((id: DemoPreset) => {
    if (id === "guest") {
      setGuestDraft(null);
      setSession(emptySession());
      return;
    }
    if (id === "creator-new") {
      setSession({
        role: "creator",
        displayName: "Aisha",
        email: "aisha@studio.my",
        businessWorkspace: null,
        creatorWorkspace: newCreatorWorkspace("Aisha"),
      });
      return;
    }
    if (id === "creator-active") {
      setSession(activeCreator());
      return;
    }
    if (id === "business-new") {
      setGuestDraft(null);
      setSession({
        role: "business",
        displayName: "Shoant",
        email: "owner@asiam.my",
        creatorWorkspace: null,
        businessWorkspace: newBusinessWorkspace("As I Am by Chef Ton", null),
      });
      return;
    }
    if (id === "business-draft") {
      const draft: CampaignDraft = {
        id: "draft-guest",
        restaurantName: "As I Am by Chef Ton",
        goal: "Bookings",
        story: "Tasting menu for first-time diners",
      };
      setGuestDraft(draft);
      setSession({
        role: "business",
        displayName: "Shoant",
        email: "owner@asiam.my",
        creatorWorkspace: null,
        businessWorkspace: newBusinessWorkspace("As I Am by Chef Ton", draft),
      });
      return;
    }
    if (id === "business-ready") {
      setGuestDraft(null);
      setSession(readyBusiness());
      return;
    }
    setSession({
      role: "manager",
      displayName: "Nadia",
      email: "nadia@haola.my",
      creatorWorkspace: null,
      businessWorkspace: null,
    });
  }, []);

  const value = useMemo<SessionApi>(
    () => ({
      session,
      ready,
      guestDraft,
      setGuestDraft,
      registerCreator,
      registerBusiness,
      loginReadyBusiness: () => loadPreset("business-ready"),
      loginActiveCreator: () => loadPreset("creator-active"),
      loginNewCreator: () => loadPreset("creator-new"),
      loginNewBusiness: () => loadPreset("business-new"),
      loginManager: () => loadPreset("manager"),
      logout,
      patchCreator,
      patchBusiness,
      loadPreset,
    }),
    [
      session,
      ready,
      guestDraft,
      registerCreator,
      registerBusiness,
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
