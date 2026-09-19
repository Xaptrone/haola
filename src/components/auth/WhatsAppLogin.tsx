"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { continueAfterSignIn } from "@/lib/auth-redirect";

type Step = "phone" | "code";

export function WhatsAppLogin({ callbackUrl }: { callbackUrl: string }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [displayPhone, setDisplayPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(event?: { preventDefault(): void }) {
    event?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/whatsapp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json()) as {
        error?: string;
        phone?: string;
        sent?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? "Couldn't send a code.");
        return;
      }
      if (!data.sent) {
        setError("Couldn't send WhatsApp. Try again.");
        return;
      }
      setDisplayPhone(data.phone ?? phone);
      setCode("");
      setStep("code");
    } catch {
      setError("Couldn't send a code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event?: { preventDefault(): void }) {
    event?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await signIn("whatsapp", {
        phone,
        code,
        callbackUrl,
        redirect: false,
      });
      if (!result || result.error) {
        setError("That code didn't match. Try again.");
        return;
      }
      continueAfterSignIn(result.url, callbackUrl);
    } catch {
      setError("That code didn't match. Try again.");
    } finally {
      setBusy(false);
    }
  }

  switch (step) {
    case "phone":
      return (
        <form onSubmit={requestCode} className="space-y-3">
          <label className="block">
            <span className="sr-only">Mobile number</span>
            <div className="flex min-h-14 overflow-hidden rounded-[14px] border border-line bg-surface">
              <span className="flex items-center border-r border-line px-4 font-mono text-[13px] text-muted">
                +60 MY
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder="12 345 6789"
                className="min-h-14 min-w-0 flex-1 bg-transparent px-4 outline-none placeholder:text-muted"
              />
            </div>
          </label>
          {error ? <p className="text-sm text-rose">{error}</p> : null}
          <Button type="submit" className="min-h-14 w-full" disabled={busy}>
            {busy ? "Sending..." : "Send WhatsApp code"}
          </Button>
        </form>
      );
    case "code":
      return (
        <form onSubmit={verifyCode} className="space-y-3">
          <p className="text-sm leading-6 text-muted">
            Code sent to {displayPhone} on WhatsApp.
          </p>
          <label className="block">
            <span className="sr-only">Login code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              className="min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 tracking-[0.3em] outline-none placeholder:text-muted placeholder:tracking-normal"
            />
          </label>
          {error ? <p className="text-sm text-rose">{error}</p> : null}
          <Button type="submit" className="min-h-14 w-full" disabled={busy || code.length !== 6}>
            {busy ? "Checking..." : "Continue"}
          </Button>
          <div className="flex justify-between pt-1 text-sm">
            <button
              type="button"
              className="text-muted"
              onClick={() => {
                setStep("phone");
                setError(null);
              }}
            >
              Change number
            </button>
            <button
              type="button"
              className="text-muted"
              disabled={busy}
              onClick={() => {
                void requestCode();
              }}
            >
              Send again
            </button>
          </div>
        </form>
      );
    default: {
      const _never: never = step;
      throw new Error(`Unhandled login step: ${_never}`);
    }
  }
}
