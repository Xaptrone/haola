export type Role = "anonymous" | "creator" | "business" | "manager";

export type BusinessSeat = "owner" | "marketing";

export type Provenance =
  | "user"
  | "verified"
  | "ai"
  | "predicted"
  | "manager";

export type OnboardingStage = "welcome" | "business" | "goal" | "ready";

export type CreateIntent = "campaign" | "brand-ip" | "content-pack";

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

export type Brand = {
  id: string;
  name: string;
  city: string;
  outlets: string;
};

export type CampaignDraft = {
  id: string;
  businessName: string;
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

export type JobKind = "campaign" | "brand-ip" | "content-pack";

/** Business content approval pipeline — 3 gates, 1 edit revision. */
export type PipelineStep = "script" | "rough" | "edited";

export type ReviewWaitingOn = "business" | "creator" | "admin" | "done";

export type ReviewJob = {
  id: string;
  title: string;
  kind: JobKind;
  businessId: string;
  businessName: string;
  creatorName: string;
  kolName: string;
  step: PipelineStep;
  waitingOn: ReviewWaitingOn;
  revisionsUsed: number;
  maxRevisions: 1;
  script: string;
  notes: { name: string; note: string }[];
  photoLabels: string[];
  roughCaption: string;
  editedCaption: string;
  adminLog: { id: string; text: string; at: string }[];
  priceCredits: number;
};

export type BrandIpMediaKind = "video" | "image";

export type BrandIpMedia = {
  id: string;
  kind: BrandIpMediaKind;
  src: string;
  caption: string;
};

export type BrandIpLine = {
  id: string;
  label: string;
  credits: number;
};

/** Commercial package a business confirms. Admin-editable. */
export type BrandIpOffer = {
  headline: string;
  promise: string;
  included: string[];
  extraInfo: string;
  ownership: string;
  afterConfirm: string;
  turnaround: string;
  creatorName: string;
  kolName: string;
  lines: BrandIpLine[];
  media: BrandIpMedia[];
};

export type BrandIpJob = {
  id: string;
  businessId: string;
  businessName: string;
  brief: string;
  look: string;
  tone: string;
  dos: string;
  donts: string;
  sampleLines: string[];
  status: "draft" | "confirmed" | "handed_off";
  creatorName: string;
  kolName: string;
  offer: BrandIpOffer;
};

export type SpendRequest = {
  id: string;
  businessId: string;
  title: string;
  amount: number;
  kind: CreateIntent;
  businessName: string;
  goal: string;
  assetCount?: number;
};

export type WalletId =
  | `business:${string}`
  | `creator:${string}`
  | "platform_revenue"
  | "escrow"
  | "platform_clearing";

export type LedgerReason =
  | "admin_topup"
  | "hold"
  | "release_creator"
  | "release_platform"
  | "refund";

export type LedgerEntry = {
  id: string;
  idempotencyKey: string;
  debitWallet: WalletId;
  creditWallet: WalletId;
  amount: number;
  reason: LedgerReason;
  refType: "job" | "campaign" | "topup" | "payout";
  refId: string;
  actor: string;
  at: string;
};

export type MarketplaceParty = {
  id: string;
  name: string;
  kind: "business" | "creator";
};

export type CreatorWorkspace = {
  kind: "creator";
  id: string;
  name: string;
  /** Instagram handle without @. Optional at registration. */
  handle?: string;
  /** Market the creator works. Set during onboarding. */
  market?: string;
  kols: Kol[];
  feed: FeedItem[];
  canvasIntent: "blank" | "kol" | "content" | "upload" | null;
};

export type BusinessWorkspace = {
  kind: "business";
  id: string;
  name: string;
  seat: BusinessSeat;
  brands: Brand[];
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
