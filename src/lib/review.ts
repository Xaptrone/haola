import type { PipelineStep, ReviewJob, ReviewWaitingOn } from "@/lib/types";
import { uid } from "@/lib/ids";

export const PIPELINE_STEPS: {
  id: PipelineStep;
  label: string;
  detail: string;
}[] = [
  {
    id: "script",
    label: "01 Script + ingredients",
    detail: "Script, dish photos, and ingredient list.",
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

export function seedReviews(): ReviewJob[] {
  return [
    {
      id: "rev-asiam",
      title: "Tasting menu reel",
      restaurant: "As I Am by Chef Ton",
      creatorName: "Aisha",
      kolName: "Mei Lin",
      step: "script",
      waitingOn: "business",
      revisionsUsed: 0,
      maxRevisions: 1,
      script:
        "Open on the tasting tray. Soft voice: ‘This is As I Am — not loud, just precise.’ Name the outlet once. Close with booking CTA. Paid partnership line at end.",
      ingredients: [
        { name: "River prawn", note: "Hero protein · show shell flash" },
        { name: "Tom yum foam", note: "Do not claim ‘secret recipe’" },
        { name: "Torch ginger", note: "Visual only · no health claims" },
      ],
      photoLabels: ["Tray wide", "Prawn detail", "Dining room night"],
      roughCaption: "Mei Lin · rough AI cut · tasting menu",
      editedCaption: "Mei Lin · edited · tasting menu",
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
      restaurant: "SOOD Penang",
      creatorName: "Aisha",
      kolName: "Mei Lin",
      step: "rough",
      waitingOn: "business",
      revisionsUsed: 0,
      maxRevisions: 1,
      script:
        "15s lunch hook. Show SOOD storefront. One bite. ‘Penang lunch, no queue theatre.’",
      ingredients: [
        { name: "Char kway teow", note: "Hero dish" },
        { name: "Prawn", note: "Show size once" },
      ],
      photoLabels: ["Storefront", "Wok flash", "Plate"],
      roughCaption: "Mei Lin · rough AI cut · SOOD lunch",
      editedCaption: "Mei Lin · edited · SOOD lunch",
      adminLog: [
        {
          id: "log-2",
          text: "Script approved by business. Rough AI cut ready for review.",
          at: "2h ago",
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

export function applyBusinessDecision(
  job: ReviewJob,
  decision: "approve" | "revise" | "escalate",
): ReviewJob {
  const stamp = "Just now";
  const log = (text: string) => ({
    id: uid("log"),
    text,
    at: stamp,
  });

  if (decision === "escalate") {
    return {
      ...job,
      waitingOn: "admin",
      adminLog: [
        log("Business escalated to admin. Needs platform decision."),
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
          log("Revision limit reached. Auto-escalated to admin."),
          ...job.adminLog,
        ],
      };
    }
    return {
      ...job,
      revisionsUsed: job.revisionsUsed + 1,
      waitingOn: "creator",
      adminLog: [
        log(
          `Business requested edit revision (${job.revisionsUsed + 1}/${job.maxRevisions}). Creator notified.`,
        ),
        ...job.adminLog,
      ],
    };
  }

  // approve
  if (job.step === "script") {
    return {
      ...job,
      step: "rough",
      waitingOn: "business",
      adminLog: [
        log(
          "Business approved script + ingredients. Rough AI video generated. Creator linked.",
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
        log(
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
      log("Business approved edited video. Ready to publish. Admin notified."),
      ...job.adminLog,
    ],
  };
}

export function creatorMarksEditedReady(job: ReviewJob): ReviewJob {
  return {
    ...job,
    waitingOn: "business",
    adminLog: [
      {
        id: uid("log"),
        text: "Creator submitted edited video for business review.",
        at: "Just now",
      },
      ...job.adminLog,
    ],
  };
}
