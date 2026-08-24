"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ActionCard } from "@/components/ui/ActionCard";
import { VerticalVideo } from "@/components/ui/VerticalVideo";
import { GuestCampaign } from "./GuestCampaign";

export function LandingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-canvas text-ink">
      <header className="pt-safe sticky top-0 z-40 flex items-center justify-between bg-canvas/90 px-5 py-4 backdrop-blur-md lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink">Haola</p>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/creators" className="text-muted hover:text-ink">
            I&apos;m a creator
          </Link>
          <Link href="/login" className="text-ink">
            Log in
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100dvh-64px)] max-w-6xl items-center gap-12 px-5 pb-28 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pb-16">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            For restaurants
          </p>
          <h1 className="mt-5 max-w-[12ch] text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink lg:text-[56px]">
            Virtual KOLs, made for your restaurant.
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-7 text-muted">
            Tell Haola the outlet. Get matched virtual KOLs. Approve every video
            before it goes live.
          </p>
          <div className="mt-8 hidden lg:block">
            <Button className="min-h-14 px-7 text-base" onClick={() => setOpen(true)}>
              Start a campaign
            </Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[280px]">
          <div className="rounded-[28px] border border-line bg-elevated p-2">
            <VerticalVideo caption="Mei Lin · tasting menu, As I Am" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-10">
        <ol className="grid gap-10 lg:grid-cols-3">
          {[
            ["01", "Tell Haola the restaurant", "Outlet, menu, what you want people to do."],
            ["02", "Match virtual KOLs", "Predicted fit. You pick. Factors are inspectable."],
            ["03", "Approve the cut", "Manager QC first. You still sign off."],
          ].map(([n, t, d]) => (
            <li key={n}>
              <p className="font-mono text-[11px] text-accent">{n}</p>
              <h2 className="mt-3 text-xl font-medium tracking-tight">{t}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-28 lg:grid lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-10 lg:pb-32">
        <div>
          <h2 className="text-2xl font-medium tracking-tight">Trust is operational.</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Claim checks. Disclosures. You approve before publish. Predicted scores
            stay labelled predicted.
          </p>
        </div>
        <ActionCard
          card={{
            id: "proof",
            kind: "amf",
            title: "Mei Lin · AMF 82",
            provenance: "predicted",
            score: { value: 82, label: "Avatar Market-Fit" },
            factors: [
              { label: "Market overlap", value: "High · KL dining" },
              { label: "Category lock", value: "Thai / tasting" },
              { label: "Distinctiveness", value: "Clear vs existing KOLs" },
            ],
            actions: [],
          }}
        />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 p-4 backdrop-blur-md lg:hidden" style={{ paddingBottom: "max(16px, var(--safe-bottom))" }}>
        <Button className="min-h-14 w-full" onClick={() => setOpen(true)}>
          Start a campaign
        </Button>
      </div>

      {open ? <GuestCampaign onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
