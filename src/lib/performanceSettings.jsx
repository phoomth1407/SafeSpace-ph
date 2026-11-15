import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isMobileDevice } from "@/lib/desktopMode";

const STORAGE_KEY = "safespace_graphics_quality";
const ADVANCED_STORAGE_KEY = "safespace_advanced_graphics_v1";
const PerformanceSettingsContext = createContext(null);

export const DEFAULT_ADVANCED_GRAPHICS = {
  canvasScale: 1.4,
  particleCount: 650,
  particleSize: 0.68,
  motionSpeed: 1,
  gravity: 1,
  turbulence: 1,
  bounce: 0.42,
  glow: 0.9,
  trails: true,
  palette: "aurora",
  baseQuality: "high",
};

const QUALITY_PRESETS = {
  low: { canvasScale: 0.9, particleCount: 260, particleSize: 0.56, motionSpeed: 0.82, gravity: 0.58, turbulence: 0.48, bounce: 0.22, glow: 0.25, trails: false, palette: "soft", baseQuality: "low" },
  balanced: { canvasScale: 1.15, particleCount: 460, particleSize: 0.62, motionSpeed: 0.92, gravity: 0.76, turbulence: 0.72, bounce: 0.3, glow: 0.55, trails: false, palette: "aurora", baseQuality: "balanced" },
  high: { canvasScale: 1.65, particleCount: 760, particleSize: 0.68, motionSpeed: 1, gravity: 1, turbulence: 1, bounce: 0.42, glow: 0.9, trails: true, palette: "aurora", baseQuality: "high" },
  ultra: { canvasScale: 2.25, particleCount: 1050, particleSize: 0.7, motionSpeed: 1.18, gravity: 1.2, turbulence: 1.28, bounce: 0.56, glow: 1.35, trails: true, palette: "cosmic", baseQuality: "ultra" },
};

function normalizeAdvancedGraphics(value = {}) {
  const number = (candidate, fallback, min, max) => {
    const parsed = Number(candidate);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
  };
  return {
    canvasScale: number(value.canvasScale, DEFAULT_ADVANCED_GRAPHICS.canvasScale, 0.75, 2.5),
    particleCount: Math.round(number(value.particleCount, DEFAULT_ADVANCED_GRAPHICS.particleCount, 120, 1400)),
    particleSize: number(value.particleSize, DEFAULT_ADVANCED_GRAPHICS.particleSize, 0.3, 1.4),
    motionSpeed: number(value.motionSpeed, DEFAULT_ADVANCED_GRAPHICS.motionSpeed, 0.5, 1.8),
    gravity: number(value.gravity, DEFAULT_ADVANCED_GRAPHICS.gravity, 0, 2.5),
    turbulence: number(value.turbulence, DEFAULT_ADVANCED_GRAPHICS.turbulence, 0, 2.5),
    bounce: number(value.bounce, DEFAULT_ADVANCED_GRAPHICS.bounce, 0, 1),
    glow: number(value.glow, DEFAULT_ADVANCED_GRAPHICS.glow, 0, 2),
    trails: value.trails !== false,
    palette: ["aurora", "cosmic", "soft"].includes(value.palette) ? value.palette : "aurora",
    baseQuality: ["low", "balanced", "high", "ultra"].includes(value.baseQuality) ? value.baseQuality : "high",
  };
}

function readAdvancedGraphics() {
  try {
    const saved = localStorage.getItem(ADVANCED_STORAGE_KEY);
    return saved ? normalizeAdvancedGraphics(JSON.parse(saved)) : DEFAULT_ADVANCED_GRAPHICS;
  } catch {
    return DEFAULT_ADVANCED_GRAPHICS;
  }
}

export function getRecommendedGraphicsQuality({ isMobile = false, prefersReducedMotion = false, cores = null, memory = null } = {}) {
  if (prefersReducedMotion || (isMobile && ((cores != null && cores <= 6) || (memory != null && memory <= 4))) || (cores != null && cores <= 4) || (memory != null && memory <= 4)) return "low";
  if ((isMobile && cores >= 8 && memory >= 8) || (!isMobile && cores >= 12 && memory >= 8)) return "ultra";
  if (!isMobile && cores >= 8 && memory >= 8) return "high";
  return "balanced";
}

function detectDeviceProfile() {
  if (typeof window === "undefined") return { quality: "balanced", cores: null, memory: null, mobile: false, reducedMotion: false };
  const mobile = isMobileDevice();
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
  const cores = navigator.hardwareConcurrency || null;
  const memory = navigator.deviceMemory || null;
  return { quality: getRecommendedGraphicsQuality({ isMobile: mobile, prefersReducedMotion: reducedMotion, cores, memory }), cores, memory, mobile, reducedMotion };
}

export function getRecommendedAdvancedGraphics(profile = detectDeviceProfile()) {
  const { quality, cores, memory, mobile, reducedMotion } = profile;
  const coreHeadroom = Math.min(1, Math.max(0.2, (cores || (mobile ? 4 : 6)) / (mobile ? 10 : 20)));
  const memoryHeadroom = Math.min(1, Math.max(0.2, (memory || (mobile ? 4 : 8)) / (mobile ? 12 : 32)));
  const capability = Math.min(1, Math.max(0.2, coreHeadroom * 0.62 + memoryHeadroom * 0.38));
  const values = {
    baseQuality: quality,
    canvasScale: mobile ? 0.85 + capability * 0.95 : 0.9 + capability * 1.6,
    particleCount: Math.round(240 + capability * 900),
    particleSize: 0.54 + capability * 0.17,
    motionSpeed: 0.78 + capability * 0.45,
    gravity: 0.62 + capability * 0.62,
    turbulence: 0.42 + capability * 0.95,
    bounce: 0.22 + capability * 0.38,
    glow: 0.24 + capability * 1.22,
    trails: capability >= 0.46,
    palette: capability >= 0.78 ? "cosmic" : "aurora",
  };
  if (reducedMotion) {
    values.trails = false;
    values.turbulence *= 0.55;
    values.bounce *= 0.7;
    values.baseQuality = "low";
  }
  return normalizeAdvancedGraphics(values);
}

function readPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return ["auto", "low", "balanced", "high", "ultra", "custom"].includes(saved) ? saved : "auto";
  } catch {
    return "auto";
  }
}

export function PerformanceSettingsProvider({ children }) {
  const [quality, setQuality] = useState(readPreference);
  const [advancedGraphics, setAdvancedGraphicsState] = useState(readAdvancedGraphics);
  const [profile, setProfile] = useState(detectDeviceProfile);
  const recommendedQuality = profile.quality;
  const recommendedAdvancedGraphics = useMemo(() => getRecommendedAdvancedGraphics(profile), [profile]);
  const activeAdvancedGraphics = quality === "auto"
    ? recommendedAdvancedGraphics
    : quality === "custom"
      ? advancedGraphics
      : normalizeAdvancedGraphics(QUALITY_PRESETS[quality] || QUALITY_PRESETS.balanced);
  const activeQuality = quality === "auto" ? recommendedQuality : quality === "custom" ? advancedGraphics.baseQuality : quality;

  const setAdvancedGraphics = (next) => {
    setAdvancedGraphicsState((current) => normalizeAdvancedGraphics(typeof next === "function" ? next(current) : next));
  };

  useEffect(() => {
    const update = () => {
      const next = detectDeviceProfile();
      setProfile((current) => Object.keys(next).every((key) => next[key] === current[key]) ? current : next);
    };
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
    try {
      localStorage.setItem(STORAGE_KEY, quality);
      localStorage.setItem(ADVANCED_STORAGE_KEY, JSON.stringify(advancedGraphics));
    } catch { /* Keep the current values active for this session if storage is unavailable. */ }
  }, [activeQuality, advancedGraphics, quality]);

  const value = useMemo(() => ({
    quality,
    setQuality,
    activeQuality,
    recommendedQuality,
    advancedGraphics,
    setAdvancedGraphics,
    activeAdvancedGraphics,
    recommendedAdvancedGraphics,
  }), [quality, activeQuality, recommendedQuality, advancedGraphics, activeAdvancedGraphics, recommendedAdvancedGraphics]);
  return <PerformanceSettingsContext.Provider value={value}>{children}</PerformanceSettingsContext.Provider>;
}

export function usePerformanceSettings() {
  const context = useContext(PerformanceSettingsContext);
  if (!context) throw new Error("usePerformanceSettings must be used within PerformanceSettingsProvider");
  return context;
}
