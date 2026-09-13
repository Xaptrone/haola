import type {
  PipelineStep,
  ReviewJob,
  ReviewWaitingOn,
} from "@/lib/types";
import { PRICE } from "@/lib/credits";
import { uid } from "@/lib/ids";

export const PIPELINE_STEPS: {
  id: PipelineStep;
  label: string;
  detail: string;
}[] = [
  {
    id: "script",
    label: "01 Script + assets",
    detail: "Script, reference images, and product or service notes.",
  },
  {
    id: "rough",
    label: "02 Rough video",
    detail: "First cut — AI-generated, then creator can replace.",
  },
  {
    id: "edited",
    label: "03 Edited video",
    detail: "Final cut. One revision only.",
  },
];

export const AISHA_CREATOR_ID = "cws-aisha";
export const ASIAM_BUSINESS_ID = "bws-asiam";

export function newReviewJob(input: {
  title: string;
  kind: ReviewJob["kind"];
  businessId: string;
  businessName: string;
  priceCredits: number;
  script: string;
  notes?: ReviewJob["notes"];
  photoLabels?: string[];
}): ReviewJob {
  return {
    id: uid("rev"),
    title: input.title,
    kind: input.kind,
    businessId: input.businessId,
    businessName: input.businessName,
    creatorName: "Aisha",
    kolName: "Mei Lin",
    step: "script",
    waitingOn: "business",
    revisionsUsed: 0,
    maxRevisions: 1,
    script: input.script,
    notes: input.notes ?? [
      { name: "Offer", note: "Name the brand once. No unverified claims." },
    ],
    photoLabels: input.photoLabels ?? ["Hero", "Space", "Close"],
    roughCaption: `Mei Lin · rough AI cut · ${input.title}`,
    editedCaption: `Mei Lin · edited · ${input.title}`,
    priceCredits: input.priceCredits,
    adminLog: [
      {
        id: uid("log"),
        text: `Job opened. Linked creator Aisha · KOL Mei Lin. Hold ${input.priceCredits} credits.`,
        at: "Just now",
      },
    ],
  };
}

export function seedReviews(): ReviewJob[] {
  return [
    {
      id: "rev-asiam",
      title: "Tasting menu reel",
      kind: "campaign",
      businessId: ASIAM_BUSINESS_ID,
      businessName: "As I Am by Chef Ton",
      creatorName: "Aisha",
      kolName: "Mei Lin",
      step: "script",
      waitingOn: "business",
      revisionsUsed: 0,
      maxRevisions: 1,
      script:
        "Open on the tasting tray. Soft voice: ‘This is As I Am — not loud, just precise.’ Name the brand once. Close with booking CTA. Paid partnership line at end.",
      notes: [
        { name: "River prawn", note: "Hero product · show once, no health claims" },
        { name: "Tom yum foam", note: "Do not claim ‘secret recipe’" },
        { name: "Torch ginger", note: "Visual only" },
      ],
      photoLabels: ["Tray wide", "Prawn detail", "Dining room night"],
      roughCaption: "Mei Lin · rough AI cut · tasting menu",
      editedCaption: "Mei Lin · edited · tasting menu",
      priceCredits: PRICE.campaign,
      adminLog: [
        {
          id: "log-1",
          text: "Job opened. Linked creator Aisha · KOL Mei Lin.",
          at: "Just now",
        },
      ],
    },
    {
      id: "rev-sood",
      title: "SOOD lunch hook",
      kind: "campaign",
      businessId: ASIAM_BUSINESS_ID,
      businessName: "SOOD Penang",
      creatorName: "Aisha",
      kolName: "Mei Lin",
      step: "rough",
      waitingOn: "business",
      revisionsUsed: 0,
      maxRevisions: 1,
      script:
        "15s lunch hook. Show SOOD storefront. One bite. ‘Penang lunch, no queue theatre.’",
      notes: [
        { name: "Char kway teow", note: "Hero dish" },
        { name: "Prawn", note: "Show size once" },
      ],
      photoLabels: ["Storefront", "Wok flash", "Plate"],
      roughCaption: "Mei Lin · rough AI cut · SOOD lunch",
      editedCaption: "Mei Lin · edited · SOOD lunch",
      priceCredits: PRICE.campaign,
      adminLog: [
        {
          id: "log-2",
          text: "Script approved by business. Rough AI cut ready for review.",
          at: "2h ago",
        },
      ],
    },
    {
      id: "rev-klinik",
      title: "Klinik Harmoni intro",
      kind: "campaign",
      businessId: ASIAM_BUSINESS_ID,
      businessName: "Klinik Harmoni",
      creatorName: "Aisha",
      kolName: "Mei Lin",
      step: "edited",
      waitingOn: "creator",
      revisionsUsed: 0,
      maxRevisions: 1,
      script:
        "Calm clinic walk-in. Name Klinik Harmoni once. No medical claims. Close with WhatsApp booking.",
      notes: [
        { name: "Waiting room", note: "Quiet, no patient faces" },
        { name: "Front desk", note: "Show hours board" },
      ],
      photoLabels: ["Facade", "Reception", "Consult room empty"],
      roughCaption: "Mei Lin · rough AI cut · clinic intro",
      editedCaption: "Mei Lin · edited · clinic intro",
      priceCredits: PRICE.campaign,
      adminLog: [
        {
          id: "log-3",
          text: "Rough approved. Creator producing edited video (1 revision allowed).",
          at: "1d ago",
        },
      ],
    },
  ];
}

export function stepIndex(step: PipelineStep): number {
  return PIPELINE_STEPS.findIndex((s) => s.id === step);
}

export function canBusinessRevise(job: ReviewJob): boolean {
  return job.step === "edited" && job.revisionsUsed < job.maxRevisions;
}

export function waitingLabel(waitingOn: ReviewWaitingOn): string {
  switch (waitingOn) {
    case "business":
      return "Waiting on business";
    case "creator":
      return "Waiting on creator";
    case "admin":
      return "Escalated to admin";
    case "done":
      return "Approved";
    default: {
      const _exhaustive: never = waitingOn;
      return _exhaustive;
    }
  }
}

export function waitingTone(
  waitingOn: ReviewWaitingOn,
): "neutral" | "action" | "ok" | "warn" | "bad" {
  switch (waitingOn) {
    case "business":
      return "action";
    case "creator":
      return "warn";
    case "admin":
      return "bad";
    case "done":
      return "ok";
    default: {
      const _exhaustive: never = waitingOn;
      return _exhaustive;
    }
  }
}

function logLine(text: string) {
  return { id: uid("log"), text, at: "Just now" };
}

export function applyBusinessDecision(
  job: ReviewJob,
  decision: "approve" | "revise" | "escalate",
): ReviewJob {
  if (decision === "escalate") {
    return {
      ...job,
      waitingOn: "admin",
      adminLog: [
        logLine("Business escalated to admin. Needs platform decision."),
        ...job.adminLog,
      ],
    };
  }

  if (decision === "revise") {
    if (job.step !== "edited" || job.revisionsUsed >= job.maxRevisions) {
      return {
        ...job,
        waitingOn: "admin",
        adminLog: [
          logLine("Revision limit reached. Auto-escalated to admin."),
          ...job.adminLog,
        ],
      };
    }
    return {
      ...job,
      revisionsUsed: job.revisionsUsed + 1,
      waitingOn: "creator",
      adminLog: [
        logLine(
          `Business requested edit revision (${job.revisionsUsed + 1}/${job.maxRevisions}). Creator notified.`,
        ),
        ...job.adminLog,
      ],
    };
  }

  if (job.step === "script") {
    return {
      ...job,
      step: "rough",
      waitingOn: "business",
      adminLog: [
        logLine(
          "Business approved script + assets. Rough AI video generated. Creator linked.",
        ),
        ...job.adminLog,
      ],
    };
  }
  if (job.step === "rough") {
    return {
      ...job,
      step: "edited",
      waitingOn: "creator",
      adminLog: [
        logLine(
          "Business approved rough cut. Creator producing edited video (1 revision allowed).",
        ),
        ...job.adminLog,
      ],
    };
  }
  return {
    ...job,
    waitingOn: "done",
    adminLog: [
      logLine("Business approved edited video. Ready to publish. Admin notified."),
      ...job.adminLog,
    ],
  };
}

export function applyCreatorAdvance(job: ReviewJob): ReviewJob {
  if (job.waitingOn !== "creator") return job;

  if (job.step === "script") {
    return {
      ...job,
      waitingOn: "business",
      adminLog: [
        logLine("Creator submitted script + assets for business review."),
        ...job.adminLog,
      ],
    };
  }
  if (job.step === "rough") {
    return {
      ...job,
      waitingOn: "business",
      roughCaption: `${job.kolName} · creator cut · ${job.title}`,
      adminLog: [
        logLine("Creator replaced the AI rough and submitted for business review."),
        ...job.adminLog,
      ],
    };
  }
  return {
    ...job,
    waitingOn: "business",
    adminLog: [
      logLine("Creator submitted edited video for business review."),
      ...job.adminLog,
    ],
  };
}

export function applyAdminDecision(
  job: ReviewJob,
  decision: "approve" | "return_creator" | "take_queue",
): ReviewJob {
  if (decision === "take_queue") {
    return {
      ...job,
      waitingOn: "admin",
      adminLog: [
        logLine("Admin pulled this job into the QC queue."),
        ...job.adminLog,
      ],
    };
  }
  if (decision === "return_creator") {
    return {
      ...job,
      waitingOn: "creator",
      adminLog: [
        logLine("Admin returned the job to the creator."),
        ...job.adminLog,
      ],
    };
  }
  const advanced = applyBusinessDecision(job, "approve");
  return {
    ...advanced,
    adminLog: [
      logLine("Admin approved this step on behalf of the platform."),
      ...advanced.adminLog,
    ],
  };
}

export function linkCreator(
  job: ReviewJob,
  creatorName: string,
  kolName: string,
): ReviewJob {
  return {
    ...job,
    creatorName,
    kolName,
    adminLog: [
      logLine(`Admin linked creator ${creatorName} · KOL ${kolName}.`),
      ...job.adminLog,
    ],
  };
}
