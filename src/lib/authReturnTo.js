// Read a safe return route from either the normal URL query or the HashRouter query.
export function safeReturnTo() {
  const hashQuery = window.location.hash.includes("?")
    ? window.location.hash.slice(window.location.hash.indexOf("?") + 1)
    : "";
  const params = new URLSearchParams(window.location.search || hashQuery);
  const raw = params.get("returnTo");
  if (!raw) return "/";
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    for (const p of ["access_token", "clear_access_token", "app_id", "app_base_url", "functions_version", "from_url"]) {
      url.searchParams.delete(p);
    }
    const target = url.pathname + url.search + url.hash;
    if (!target.startsWith("/") || target.startsWith("//") || target.includes("\\")) return "/";
    return target;
  } catch {
    return "/";
  }
}
