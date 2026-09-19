"use client";

import type { KolLook } from "@/lib/kol-identity";

export function KolLookRow({
  looks,
  selectedId,
  takenWorlds,
  onPick,
}: {
  looks: KolLook[];
  selectedId?: string;
  takenWorlds?: string[];
  onPick: (id: string) => void;
}) {
  const taken = takenWorlds ?? [];
  return (
    <div
      className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-wrap lg:justify-center lg:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      {looks.map((look) => {
        const selected = look.id === selectedId;
        const already = taken.includes(look.world);
        return (
          <button
            key={look.id}
            type="button"
            onClick={() => onPick(look.id)}
            className={`relative w-[148px] shrink-0 snap-center overflow-hidden rounded-[14px] border bg-elevated text-left transition-[border-color,transform] duration-[var(--duration-press)] ease-[var(--ease-out)] active:scale-[0.97] lg:w-[160px] ${
              selected ? "border-accent" : "border-line hover:border-accent/40"
            }`}
            style={{ aspectRatio: "9 / 16" }}
          >
            <span className="absolute inset-y-4 left-0 w-1 rounded-full bg-accent" />
            <span className="absolute left-5 top-6 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {look.kicker}
            </span>
            <span className="absolute inset-x-5 top-[38%] text-[17px] font-medium leading-6 tracking-tight text-ink">
              {look.name}
            </span>
            <span className="absolute inset-x-5 bottom-5 text-[12px] leading-5 text-muted">
              {look.line}
            </span>
            {already ? (
              <span className="absolute right-3 top-5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                In studio
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
