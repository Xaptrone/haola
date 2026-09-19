/** Keep post-login navigation on the tab's origin.

Auth.js builds an absolute `callbackUrl` from the server bind host. `next
dev --hostname 0.0.0.0` therefore returns `http://0.0.0.0:3000/...` even
when the browser is on localhost, which drops the session cookie. */
export function sameOriginContinuePath(
  url: string | null | undefined,
  fallback: string,
  origin = "",
): string {
  const safeFallback = fallback.startsWith("/") ? fallback : "/start";
  if (!url) return safeFallback;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url, origin || "http://local.invalid");
    if (origin && parsed.origin !== origin) return safeFallback;
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return path.startsWith("/") ? path : safeFallback;
  } catch {
    return safeFallback;
  }
}

export function continueAfterSignIn(
  url: string | null | undefined,
  fallback: string,
) {
  const path = sameOriginContinuePath(
    url,
    fallback,
    typeof window === "undefined" ? "" : window.location.origin,
  );
  window.location.assign(path);
}
