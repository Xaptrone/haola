"use client";

export function BlankCanvas({
  onPick,
  name,
}: {
  onPick: (intent: "kol" | "content" | "upload") => void;
  name?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-2 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {name ? `${name}'s studio` : "Blank canvas"}
      </p>
      <h1 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
        What are we making?
      </h1>
      <div className="mt-10 w-full space-y-2">
        <Intent onClick={() => onPick("kol")}>Create a virtual KOL</Intent>
        <Intent onClick={() => onPick("content")}>Create content</Intent>
        <Intent onClick={() => onPick("upload")}>Upload a draft</Intent>
      </div>
    </div>
  );
}

function Intent({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center justify-center rounded-[16px] border border-line bg-surface text-[16px] text-ink transition-[border-color] duration-[var(--duration-ui)] ease-[var(--ease-out)] hover:border-ink/25"
    >
      {children}
    </button>
  );
}
