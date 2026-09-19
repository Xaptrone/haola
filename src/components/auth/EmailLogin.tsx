"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { WhatsAppLogin } from "@/components/auth/WhatsAppLogin";
import {
  creatorNameError,
  stashPendingCreatorName,
} from "@/lib/creator-registration";

type Mode = "login" | "register";
export type AuthIntent = "creator" | "business";

const fieldClass =
  "min-h-14 w-full rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted";

export function EmailLogin({
  callbackUrl,
  googleConfigured,
  whatsappConfigured,
  intent,
  initialMode = "register",
  stepLabel,
  loginHref,
  registerHref,
}: {
  callbackUrl: string;
  googleConfigured: boolean;
  whatsappConfigured: boolean;
  intent?: AuthIntent;
  initialMode?: Mode;
  stepLabel?: string;
  loginHref?: string;
  registerHref?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherMethods = googleConfigured || whatsappConfigured;
  const creator = intent === "creator";

  function stashCreatorName() {
    if (creator) stashPendingCreatorName(name);
  }

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
    router.push(result.url || callbackUrl);
    router.refresh();
  }

  async function onSubmit(event: { preventDefault(): void }) {
    event.preventDefault();
    setError(null);
    if (mode === "register" && creator) {
      const nameError = creatorNameError(name);
      if (nameError) {
        setError(nameError);
        return;
      }
    }
    if (mode === "register" && password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") {
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
        stashCreatorName();
      }
      await loginWithEmail();
    } catch {
      setError(mode === "register" ? "Couldn't create that account." : "Couldn't sign in.");
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "register"
      ? creator
        ? "Open your studio"
        : "Create account"
      : creator
        ? "Welcome back"
        : "Log in";
  const body =
    mode === "register"
      ? creator
        ? "Your creator name is what brands see. Not a company name."
        : intent === "business"
          ? "Use email. Then we'll open your business workspace."
          : "Use email. Then choose whether you are a business or a creator."
      : creator
        ? "Log in to open your studio."
        : "Use the email you registered with.";
  const canSubmit =
    Boolean(email && password) &&
    (mode !== "register" || !creator || Boolean(name.trim()));

  return (
    <div>
      {stepLabel ? (
        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          {stepLabel}
        </p>
      ) : null}
      <h1
        className={`${stepLabel ? "mt-3" : "mt-8"} text-[32px] font-semibold tracking-[-0.03em]`}
      >
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        {mode === "register" ? (
          <label className="block">
            <span className="sr-only">{creator ? "Creator name" : "Name"}</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              autoComplete={creator ? "nickname" : "name"}
              placeholder={creator ? "Creator name" : "Your name"}
              className={fieldClass}
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
            placeholder={creator ? "you@email.com" : "you@brand.my"}
            className={fieldClass}
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
            className={fieldClass}
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
              className={fieldClass}
            />
          </label>
        ) : null}
        {error ? <p className="text-sm text-rose">{error}</p> : null}
        <Button type="submit" className="min-h-14 w-full" disabled={busy || !canSubmit}>
          {busy
            ? mode === "register"
              ? creator
                ? "Opening..."
                : "Creating..."
              : "Signing in..."
            : mode === "register"
              ? creator
                ? "Continue"
                : "Create account"
              : "Log in"}
        </Button>
      </form>
      <button
        type="button"
        className="mt-4 text-sm text-muted hover:text-ink"
        onClick={() => {
          if (mode === "register" && loginHref) {
            router.push(loginHref);
            return;
          }
          if (mode === "login" && registerHref) {
            router.push(registerHref);
            return;
          }
          setMode(mode === "register" ? "login" : "register");
          setError(null);
        }}
      >
        {mode === "register"
          ? creator
            ? "Already have a studio? Log in"
            : "Already have an account? Log in"
          : creator
            ? "New here? Open a studio"
            : "New here? Create an account"}
      </button>
      {otherMethods ? (
        <div className="mt-8">
          <p className="mb-3 text-center text-[13px] text-muted">or</p>
          {googleConfigured ? (
            <GoogleButton
              variant="ghost"
              callbackUrl={callbackUrl}
              onBeforeSignIn={stashCreatorName}
            />
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
