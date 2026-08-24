export function VerticalVideo({
  caption,
  className = "",
}: {
  caption: string;
  className?: string;
}) {
  return (
    <figure
      className={`relative overflow-hidden rounded-[20px] border border-line bg-elevated ${className}`}
      style={{ aspectRatio: "9 / 16" }}
    >
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute inset-x-6 top-[18%] h-[42%] rounded-[14px] bg-canvas" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="mb-8 flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-canvas text-ink">
            <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" aria-hidden>
              <path d="M13.5 8L0.75 15.7942V0.205771L13.5 8Z" />
            </svg>
          </span>
        </div>
        <figcaption className="text-sm text-ink">{caption}</figcaption>
      </div>
    </figure>
  );
}
