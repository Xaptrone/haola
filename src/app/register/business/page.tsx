"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/session";

export default function RegisterBusinessPage() {
  const { registerBusiness, guestDraft } = useSession();
  const router = useRouter();
  const [name, setName] = useState("Shoant");
  const [email, setEmail] = useState("");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        Business workspace
      </p>
      <h1 className="mt-3 text-[32px] font-semibold tracking-[-0.03em]">
        Create the workspace
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        {guestDraft
          ? `Your ${guestDraft.restaurantName} draft comes with you.`
          : "The workspace exists the moment you continue. Setup happens inside, with AI."}
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="mt-8 min-h-14 rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Work email"
        className="mt-2 min-h-14 rounded-[14px] border border-line bg-surface px-4 outline-none placeholder:text-muted"
      />
      <Button
        className="mt-6 min-h-14 w-full"
        onClick={() => {
          registerBusiness(name || "Owner", email || "owner@haola.my");
          router.push("/work/business");
        }}
      >
        Enter workspace
      </Button>
    </div>
  );
}
