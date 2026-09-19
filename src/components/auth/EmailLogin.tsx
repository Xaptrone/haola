"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { WhatsAppLogin } from "@/components/auth/WhatsAppLogin";
import { continueAfterSignIn } from "@/lib/auth-redirect";

type Mode = "login" | "register";

export function EmailLogin({
  callbackUrl,
  googleConfigured,
  whatsappConfigured,
}: {
  callbackUrl: string;
  googleConfigured: boolean;
  whatsappConfigured: boolean;
}) {
  const [mode, setMode] = useState<Mode>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherMethods = googleConfigured || whatsappConfigured;

  async function loginWithEmail() {
    const result = await signIn("email-password", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });
    if (!result || result.error) {
      setError("That email or password didn't match.");
      return;
    }
    continueAfterSignIn(result.url, callbackUrl);
  }

  async function onSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "register") {
        if (password.length < 8) {
          setError("Use at least 8 characters.");
          return;
        }
        if (password !== confirm) {
          setError("Those passwords don't match.");
          return;
        }
        const res = await fetch("/api/auth/email/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Couldn't create that account.");
          return;
        }
      }
      await loginWithEmail();
    } catch {
      setError(mode === "register" ? "Couldn't create that account." : "Couldn't sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mt-8 text-[32px] font-semibold tracking-[-0.03em]">
        {mode === "register" ? "Create account" : "Log in"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        {mode === "register"
          ? "Use email. Then choose whether you are a business or a creator."
          : "Use the email you registered with."}
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        {mode === "register" ? (
          <label className="block">
            <span className="sr-only">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Your name"
              className="min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@brand.my"
            className="min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted"
          />
        </label>
        <label className="block">
          <span className="sr-only">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            placeholder="Password"
            className="min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted"
          />
        </label>
        {mode === "register" ? (
          <label className="block">
            <span className="sr-only">Confirm password</span>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Confirm password"
              className="min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted"
            />
          </label>
        ) : null}
        {error ? <p className="text-sm text-rose">{error}</p> : null}
        <Button type="submit" className="min-h-14 w-full" disabled={busy || !email || !password}>
          {busy
            ? mode === "register"
              ? "Creating..."
              : "Signing in..."
            : mode === "register"
              ? "Create account"
              : "Log in"}
        </Button>
      </form>
      <button
        type="button"
        className="mt-4 text-sm text-muted hover:text-ink"
        onClick={() => {
          setMode(mode === "register" ? "login" : "register");
          setError(null);
        }}
      >
        {mode === "register" ? "Already have an account? Log in" : "New here? Create an account"}
      </button>
      {otherMethods ? (
        <div className="mt-8">
          <p className="mb-3 text-center text-[13px] text-muted">or</p>
          {googleConfigured ? (
            <GoogleButton variant="ghost" callbackUrl={callbackUrl} />
          ) : null}
          {whatsappConfigured ? (
            <div className={googleConfigured ? "mt-3" : undefined}>
              <WhatsAppLogin callbackUrl={callbackUrl} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
