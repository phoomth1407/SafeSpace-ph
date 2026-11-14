import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "safespace_graphics_quality";
const PerformanceSettingsContext = createContext(null);

export function getRecommendedGraphicsQuality({
  isMobile = false,
  prefersReducedMotion = false,
  cores = null,
  memory = null,
} = {}) {
  if (prefersReducedMotion || (isMobile && ((cores != null && cores <= 6) || (memory != null && memory <= 4))) || (cores != null && cores <= 4) || (memory != null && memory <= 4)) return "low";
  if ((isMobile && cores >= 8 && memory >= 8) || (!isMobile && cores >= 12 && memory >= 8)) return "ultra";
  if (!isMobile && cores >= 8 && memory >= 8) return "high";
  return "balanced";
}

function detectRecommendedQuality() {
  if (typeof window === "undefined") return "balanced";
  return getRecommendedGraphicsQuality({
    isMobile: window.matchMedia?.("(max-width: 767px)").matches || false,
    prefersReducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false,
    // Unknown browser hints stay conservative and never auto-select Ultra.
    cores: navigator.hardwareConcurrency || null,
    memory: navigator.deviceMemory || null,
  });
}

function readPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return ["auto", "low", "balanced", "high", "ultra"].includes(saved) ? saved : "auto";
  } catch {
    return "auto";
  }
}

export function PerformanceSettingsProvider({ children }) {
  const [quality, setQuality] = useState(readPreference);
  const [recommendedQuality, setRecommendedQuality] = useState(detectRecommendedQuality);
  const activeQuality = quality === "auto" ? recommendedQuality : quality;

  useEffect(() => {
    const update = () => setRecommendedQuality(detectRecommendedQuality());
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    media?.addEventListener?.("change", update);
    window.addEventListener("resize", update);
    return () => {
      media?.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.graphicsQuality = activeQuality;
    document.documentElement.dataset.graphicsMode = quality;
    try { localStorage.setItem(STORAGE_KEY, quality); } catch { /* Keep the current preference for this session. */ }
  }, [activeQuality, quality]);

  const value = useMemo(() => ({ quality, setQuality, activeQuality, recommendedQuality }), [quality, activeQuality, recommendedQuality]);
  return <PerformanceSettingsContext.Provider value={value}>{children}</PerformanceSettingsContext.Provider>;
}

export function usePerformanceSettings() {
  const context = useContext(PerformanceSettingsContext);
  if (!context) throw new Error("usePerformanceSettings must be used within PerformanceSettingsProvider");
  return context;
}
