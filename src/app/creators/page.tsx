import Link from "next/link";

export default function CreatorsPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        For creators
      </p>
      <h1 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.03em]">
        A studio in your pocket. A canvas on your desk.
      </h1>
      <p className="mt-4 text-sm leading-6 text-muted">
        Phone: Home, Campaigns, Create, KOLs, Profile. First screen is a blank
        canvas — make a virtual KOL, make content, or upload a draft. Laptop: the
        same studio, as a board, not a dashboard.
      </p>
      <Link
        href="/register/creator"
        className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-accent text-base font-medium text-canvas"
      >
        Open a studio
      </Link>
      <Link
        href="/work/studio?as=aisha"
        className="mt-4 text-center text-sm text-muted"
      >
        Preview Aisha&apos;s studio
      </Link>
    </div>
  );
}
