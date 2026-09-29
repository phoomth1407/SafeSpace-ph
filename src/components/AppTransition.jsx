import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_NAMES = {
  "/": { en: "Home", th: "หน้าหลัก" },
  "/assessment": { en: "Assessment", th: "แบบประเมิน" },
  "/result": { en: "Results", th: "ผลการประเมิน" },
  "/community": { en: "Community", th: "ชุมชน" },
  "/resources": { en: "Resources", th: "แหล่งช่วยเหลือ" },
  "/history": { en: "History", th: "ประวัติ" },
  "/contact-admin": { en: "Contact", th: "ติดต่อผู้ดูแล" },
  "/admin": { en: "Admin", th: "ผู้ดูแลระบบ" },
  "/login": { en: "Sign in", th: "เข้าสู่ระบบ" },
  "/register": { en: "Create account", th: "สร้างบัญชี" },
  "/forgot-password": { en: "Password reset", th: "รีเซ็ตรหัสผ่าน" },
  "/reset-password": { en: "Password reset", th: "รีเซ็ตรหัสผ่าน" },
};

const getRouteName = (pathname, lang) => {
  const key = Object.keys(ROUTE_NAMES).find((route) =>
    route === pathname || (route === "/result" && pathname.startsWith("/result/"))
  );
  const entry = ROUTE_NAMES[key] || { en: "SafeSpace", th: "SafeSpace" };
  return lang === "th" ? entry.th : entry.en;
};

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function ProgressRing({ progress }) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (circumference * progress) / 100;

  return (
    <div className="safespace-transition-ring" aria-hidden="true">
      <svg viewBox="0 0 64 64" className="safespace-transition-ring__svg">
        <defs>
          <linearGradient id="safespace-transition-ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4b7bff" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle className="safespace-transition-ring__bg" cx="32" cy="32" r="28" />
        <circle
          className="safespace-transition-ring__fg"
          cx="32"
          cy="32"
          r="28"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <span className="safespace-transition-shield">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>
    </div>
  );
}

function BootSequence({ lang, onDone }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1650;

    const tick = (now) => {
      const raw = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - raw, 3);
      setProgress(Math.round(eased * 100));

      if (raw < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        window.setTimeout(onDone, 420);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <div className="safespace-boot" role="status" aria-live="polite" aria-label="SafeSpace loading">
      <div className="safespace-boot__ambient" />
      <div className="safespace-boot__content">
        <div className="safespace-boot__brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div className="safespace-boot__title" aria-label="SafeSpace">
          <span>Safe</span><span>Space</span>
        </div>
        <p className="safespace-boot__tagline">
          {lang === "th" ? "พื้นที่ที่ปลอดภัยสำหรับคุณ" : "A safe space for you"}
        </p>
        <div className="safespace-boot__progress">
          <div className="safespace-boot__progress-fill" style={{ width: progress + "%" }} />
        </div>
        <div className="safespace-boot__meta">
          <span>{lang === "th" ? "กำลังเตรียม SafeSpace" : "Preparing SafeSpace"}</span>
          <span>{String(progress).padStart(3, "0")}</span>
        </div>
      </div>
    </div>
  );
}

function RouteSequence({ name, lang, onDone }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 720;

    const tick = (now) => {
      const raw = Math.min(1, (now - start) / duration);
      setProgress(Math.round((1 - Math.pow(1 - raw, 2.5)) * 100));
      if (raw < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    const finish = window.setTimeout(onDone, 930);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(finish);
    };
  }, [onDone]);

  return (
    <div className="safespace-route-transition" role="status" aria-live="polite">
      <div className="safespace-route-transition__inner">
        <ProgressRing progress={progress} />
        <p className="safespace-route-transition__label">
          {lang === "th" ? "กำลังเปิด" : "Opening"}
        </p>
        <p className="safespace-route-transition__name">{name}</p>
      </div>
      <div className="safespace-route-transition__bar">
        <div style={{ width: progress + "%" }} />
      </div>
    </div>
  );
}

export default function AppTransition({ children }) {
  const { pathname } = useLocation();
  const [lang, setLang] = useState("en");
  const [booting, setBooting] = useState(() => {
    try {
      return sessionStorage.getItem("safespace_boot_seen") !== "1";
    } catch {
      return true;
    }
  });
  const [routeTransition, setRouteTransition] = useState(false);
  const [routeKey, setRouteKey] = useState(pathname);
  const previousPath = useRef(pathname);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("safespace_lang");
      if (stored === "th" || stored === "en") setLang(stored);
    } catch {
      // Ignore storage errors.
    }
  }, [pathname]);

  useLayoutEffect(() => {
    if (booting || previousPath.current === pathname) return;

    previousPath.current = pathname;
    setRouteKey(pathname);
    setRouteTransition(true);
  }, [pathname, booting]);

  const finishBoot = () => {
    try {
      sessionStorage.setItem("safespace_boot_seen", "1");
    } catch {
      // Continue without session storage.
    }
    setBooting(false);
  };

  const finishRoute = () => setRouteTransition(false);

  return (
    <>
      {children}
      {booting && <BootSequence lang={lang} onDone={finishBoot} />}
      {!booting && routeTransition && (
        <RouteSequence
          key={routeKey}
          name={getRouteName(routeKey, lang)}
          lang={lang}
          onDone={finishRoute}
        />
      )}
    </>
  );
}
