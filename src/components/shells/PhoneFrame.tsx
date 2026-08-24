export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto h-[720px] w-[360px] overflow-hidden rounded-[36px] border border-line bg-canvas shadow-[0_0_0_8px_var(--haola-elevated)]">
      <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-elevated" />
      <div className="h-full overflow-hidden">{children}</div>
    </div>
  );
}
