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
