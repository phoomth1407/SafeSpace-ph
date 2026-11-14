const DESKTOP_MODE_KEY = "safespace_mobile_desktop_mode_v1";
const DESKTOP_MODE_EVENT = "safespace:desktop-mode";

export function readDesktopMode() {
  try {
    return window.localStorage.getItem(DESKTOP_MODE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveDesktopMode(enabled) {
  const value = Boolean(enabled);
  try {
    window.localStorage.setItem(DESKTOP_MODE_KEY, String(value));
  } catch {
    // Keep the preference active for this page view if storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(DESKTOP_MODE_EVENT, { detail: { enabled: value } }));
}

export function isMobileDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  if (navigator.userAgentData?.mobile === true) return true;

  const userAgent = navigator.userAgent || "";
  const isIpad = /iPad/i.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isMobileAgent = /Android|iPhone|iPod|Mobile/i.test(userAgent);
  const hasCoarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
  const screenWidth = window.screen?.width || window.innerWidth;
  return isMobileAgent || isIpad || Boolean(hasCoarsePointer && screenWidth <= 1100);
}

export { DESKTOP_MODE_EVENT };
