export type StartContinue =
  | { type: "wait" }
  | { type: "login"; href: string }
  | { type: "go"; href: string }
  | { type: "attach"; role: "creator" | "business" }
  | { type: "pick" };

function loginHref(intent: string | null, next: string | null) {
  const params = new URLSearchParams();
  if (intent) params.set("intent", intent);
  if (next) params.set("next", next);
  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}

/** Where /start should send a signed-in user before the workspace picker. */
export function startContinue(input: {
  ready: boolean;
  hasIdentity: boolean;
  role: "anonymous" | "creator" | "business" | "manager";
  intent: string | null;
  next: string | null;
}): StartContinue {
  if (!input.ready) return { type: "wait" };
  if (!input.hasIdentity) return { type: "login", href: loginHref(input.intent, input.next) };
  switch (input.role) {
    case "business":
      return { type: "go", href: input.next || "/work/business" };
    case "creator":
      return { type: "go", href: input.next || "/work/studio" };
    case "manager":
      return { type: "go", href: input.next || "/oversight/manager" };
    case "anonymous":
      if (input.intent === "creator") return { type: "attach", role: "creator" };
      if (input.intent === "business") return { type: "attach", role: "business" };
      return { type: "pick" };
    default: {
      const _never: never = input.role;
      throw new Error(`Unhandled start role: ${_never}`);
    }
  }
}
