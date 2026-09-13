export function KolMatchReel() {
  return (
    <figure className="mx-auto w-full max-w-[220px] overflow-hidden rounded-[20px] border border-line bg-elevated">
      <div className="relative" style={{ aspectRatio: "9 / 16" }}>
        <div className="absolute inset-0 bg-canvas" />
        <div className="absolute left-1/2 top-[18%] h-[22%] w-[42%] -translate-x-1/2 rounded-full bg-surface" />
        <div className="absolute inset-x-[18%] top-[42%] h-[38%] rounded-t-[80px] bg-surface" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[20px] font-semibold tracking-[-0.03em] text-ink">
            Mei Lin
          </p>
          <p className="mt-1 text-sm text-muted">KL / Penang · EN + 中文</p>
        </div>
      </div>
    </figure>
  );
}
