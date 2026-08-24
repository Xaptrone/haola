import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "quiet";

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-canvas hover:bg-accent-hover disabled:opacity-40",
  ghost:
    "bg-elevated text-ink border border-line hover:border-ink/20 disabled:opacity-40",
  quiet: "bg-transparent text-muted hover:text-ink disabled:opacity-40",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-[15px] font-medium transition-[background-color,color,border-color,transform] duration-[var(--duration-press)] ease-[var(--ease-out)] ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
