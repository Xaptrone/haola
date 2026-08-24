"use client";

export function ClarifyChips({
  question,
  options,
  onPick,
}: {
  question: string;
  options: string[];
  onPick: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[17px] font-medium leading-6 text-ink">{question}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onPick(opt)}
            className="min-h-12 rounded-[14px] border border-line bg-elevated px-4 text-left text-[15px] text-ink transition-colors duration-150 hover:border-accent/40"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
