export type Role = "anonymous" | "creator" | "business" | "manager";

export type Provenance =
  | "user"
  | "verified"
  | "ai"
  | "predicted"
  | "manager";

export type OnboardingStage = "welcome" | "restaurant" | "goal" | "ready";

export type Kol = {
  id: string;
  name: string;
  market: string;
  audience: string;
  categories: string;
  language: string;
  personality: string;
  amf: number;
  match?: number;
};

export type Restaurant = {
  id: string;
  name: string;
  city: string;
  outlets: string;
};

export type CampaignDraft = {
  id: string;
  restaurantName: string;
  goal: string;
  story?: string;
  budget?: string;
};

export type FeedItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone?: "action" | "info" | "money";
};

/** Business content approval pipeline — 3 gates, 1 edit revision. */
export type PipelineStep = "script" | "rough" | "edited";

export type ReviewWaitingOn = "business" | "creator" | "admin" | "done";

export type ReviewJob = {
  id: string;
  title: string;
  restaurant: string;
  creatorName: string;
  kolName: string;
  step: PipelineStep;
  waitingOn: ReviewWaitingOn;
  revisionsUsed: number;
  maxRevisions: 1;
  script: string;
  ingredients: { name: string; note: string }[];
  photoLabels: string[];
  roughCaption: string;
  editedCaption: string;
  adminLog: { id: string; text: string; at: string }[];
};

export type CreatorWorkspace = {
  kind: "creator";
  id: string;
  name: string;
  kols: Kol[];
  feed: FeedItem[];
  canvasIntent: "blank" | "kol" | "content" | "upload" | null;
};

export type BusinessWorkspace = {
  kind: "business";
  id: string;
  name: string;
  restaurants: Restaurant[];
  onboardingStage: OnboardingStage;
  guestDraft: CampaignDraft | null;
  feed: FeedItem[];
  pendingApprovals: number;
};

export type Session = {
  role: Role;
  displayName: string;
  email: string;
  creatorWorkspace: CreatorWorkspace | null;
  businessWorkspace: BusinessWorkspace | null;
};
