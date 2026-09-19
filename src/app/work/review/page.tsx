"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ReviewPipeline } from "@/components/review/ReviewPipeline";
import { ActionFeed } from "@/components/feed/ActionFeed";
import { useMarketplace } from "@/lib/marketplace";
import { useSession } from "@/lib/session";
import { MobileAppShell } from "@/components/shells/WorkShells";
import { managerNav } from "@/lib/nav";

function ReviewBody() {
  const id = useSearchParams().get("id");
  const market = useMarketplace();
  const { session } = useSession();
  const actor =
    session.role === "creator"
      ? "creator"
      : session.role === "manager"
        ? "admin"
        : "business";
  const job = market.reviews.find((j) => j.id === id) ?? null;
  const open = market.reviews.filter((j) => j.waitingOn !== "done");

  const list = (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium tracking-tight">Reviews</h1>
      <ActionFeed
        items={open.map((j) => ({
          id: j.id,
          title: j.title,
          detail: `${j.businessName} · ${j.step} · ${j.waitingOn}`,
          href: `/work/review?id=${j.id}`,
        }))}
      />
    </div>
  );

  const pipeline = job ? (
    <ReviewPipeline
      job={job}
      actor={actor}
      onChange={(next) => market.patchReview(next.id, next)}
      onFinalApprove={(next) => {
        market.patchReview(next.id, next);
        market.releaseJob(next, session.displayName || "Manager");
      }}
    />
  ) : (
    list
  );

  if (session.role === "manager") {
    return (
      <>
        <MobileAppShell title="Reviews" items={managerNav} active="reviews">
          {pipeline}
        </MobileAppShell>
        <div className="hidden min-h-dvh bg-canvas px-8 py-10 lg:block">
          <div className="mx-auto max-w-3xl">{pipeline}</div>
        </div>
      </>
    );
  }

  return <div className="min-h-dvh bg-canvas px-5 py-6 lg:px-10">{pipeline}</div>;
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" />}>
      <ReviewBody />
    </Suspense>
  );
}
