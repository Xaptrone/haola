import type { CampaignTreatment } from "@/lib/campaign-treatment";

function BeatFrame({
  n,
  title,
  line,
  brand,
  beat,
}: {
  n: string;
  title: string;
  line: string;
  brand: string;
  beat: 0 | 1 | 2;
}) {
  return (
    <figure className="relative w-[148px] shrink-0 snap-start overflow-hidden rounded-[16px] border border-line bg-elevated lg:w-auto lg:flex-1">
      <div className="relative" style={{ aspectRatio: "9 / 16" }}>
        {beat === 0 ? (
          <>
            <div className="absolute inset-0 bg-canvas" />
            <div className="absolute inset-y-[18%] left-[18%] w-[10%] bg-surface" />
            <div className="absolute inset-y-[22%] right-[16%] left-[32%] rounded-[10px] bg-surface" />
          </>
        ) : null}
        {beat === 1 ? (
          <>
            <div className="absolute inset-0 bg-canvas" />
            <div className="absolute inset-x-4 top-[28%] text-center">
              <p className="text-[17px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink">
                {brand}
              </p>
            </div>
          </>
        ) : null}
        {beat === 2 ? (
          <>
            <div className="absolute inset-0 bg-canvas" />
            <div className="absolute inset-x-8 top-[22%] h-[38%] rounded-[12px] bg-surface" />
            <div className="absolute bottom-[28%] left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-accent" />
          </>
        ) : null}
        <figcaption className="absolute inset-x-0 bottom-0 bg-canvas/80 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {n} · {title}
          </p>
          <p className="mt-1 text-[13px] leading-5 text-ink">{line}</p>
        </figcaption>
      </div>
    </figure>
  );
}

export function CampaignStoryboard({
  brand,
  treatment,
}: {
  brand: string;
  treatment: CampaignTreatment;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:overflow-visible">
      {treatment.beats.map((beat, i) => (
        <BeatFrame
          key={beat.n}
          n={beat.n}
          title={beat.title}
          line={beat.line}
          brand={brand}
          beat={i as 0 | 1 | 2}
        />
      ))}
    </div>
  );
}
