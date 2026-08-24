"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/session";

export default function LoginPage() {
  const { loginReadyBusiness, loginActiveCreator, loginManager } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <h1 className="text-[32px] font-semibold tracking-[-0.03em]">Log in</h1>
      <p className="mt-2 text-sm text-muted">
        Demo: pick a workspace. Real auth comes later.
      </p>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="mt-8 min-h-14 rounded-[14px] border border-line bg-surface px-4 text-ink outline-none placeholder:text-muted"
      />
      <div className="mt-6 space-y-2">
        <Button
          className="min-h-14 w-full"
          onClick={() => {
            loginReadyBusiness();
            router.push("/work/business");
          }}
        >
          Enter business workspace
        </Button>
        <Button
          variant="ghost"
          className="min-h-14 w-full"
          onClick={() => {
            loginActiveCreator();
            router.push("/work/studio");
          }}
        >
          Enter creator studio
        </Button>
        <Button
          variant="quiet"
          className="min-h-14 w-full"
          onClick={() => {
            loginManager();
            router.push("/oversight/manager");
          }}
        >
          Enter manager
        </Button>
      </div>
    </div>
  );
}
