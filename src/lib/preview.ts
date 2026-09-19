export type DemoPreset =
  | "guest"
  | "creator-new"
  | "creator-active"
  | "business-new"
  | "business-draft"
  | "business-ready"
  | "manager";

type PreviewEnv = {
  NODE_ENV?: string;
  NEXT_PUBLIC_FXGEN_PREVIEW?: string;
};

/** Internal demo surfaces. Off unless NEXT_PUBLIC_FXGEN_PREVIEW=1. */
export function previewSurfacesEnabled(env: PreviewEnv = process.env): boolean {
  return env.NEXT_PUBLIC_FXGEN_PREVIEW === "1";
}

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

/** URL mapping, but only when preview surfaces are enabled. */
export function activePreviewPreset(
  pathname: string,
  search = "",
  env: PreviewEnv = process.env,
): DemoPreset | null {
  if (!previewSurfacesEnabled(env)) return null;
  return previewPresetFromLocation(pathname, search);
}
