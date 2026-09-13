export type DemoPreset =
  | "guest"
  | "creator-new"
  | "creator-active"
  | "business-new"
  | "business-draft"
  | "business-ready"
  | "manager";

/** Map a preview URL to the demo preset it should boot. */
export function previewPresetFromLocation(
  pathname: string,
  search = "",
): DemoPreset | null {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const preview =
    params.get("preview") === "1" || pathname === "/preview";
  if (!preview) return null;

  if (pathname.startsWith("/oversight")) return "manager";
  if (pathname.startsWith("/work/studio")) {
    return params.get("as") === "new" ? "creator-new" : "creator-active";
  }
  if (pathname.startsWith("/work/business") && params.get("as") === "new") {
    return "business-new";
  }
  if (pathname.startsWith("/work") || pathname === "/preview") {
    return "business-ready";
  }
  return "guest";
}
