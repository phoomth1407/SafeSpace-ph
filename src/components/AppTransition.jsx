import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const NAV_LABELS = {
  "/": { en: "Home", th: "หน้าแรก" },
  "/assessment": { en: "Assessment", th: "แบบประเมิน" },
  "/community": { en: "Community", th: "ชุมชน" },
  "/resources": { en: "Resources", th: "แหล่งข้อมูล" },
  "/history": { en: "History", th: "ประวัติ" },
  "/contact-admin": { en: "Contact Admin", th: "ติดต่อผู้ดูแล" },
  "/admin": { en: "Admin", th: "ผู้ดูแล" },
  "/login": { en: "Sign in", th: "เข้าสู่ระบบ" },
  "/register": { en: "Create account", th: "สร้างบัญชี" },
  "/forgot-password": { en: "Reset password", th: "รีเซ็ตรหัสผ่าน" },
  "/reset-password": { en: "Reset password", th: "รีเซ็ตรหัสผ่าน" },
};

const getLabel = (pathname, lang) => {
  const direct = NAV_LABELS[pathname];
  if (direct) return direct[lang] || direct.en;
  if (pathname.startsWith("/result")) return lang === "en" ? "Your result" : "ผลการประเมิน";
  return lang === "en" ? "SafeSpace" : "SafeSpace";
};

const isSameRoute = (a, b) => a.pathname === b.pathname;

export default function AppTransition({ children }) {
  const location = useLocation();
  const { lang } = useTranslation();
  const [appReady, setAppReady] = useState(false);
  const [bootOpen, setBootOpen] = useState(() => {
    try {
      return sessionStorage.getItem("safespace_boot_seen") !== "1";
    } catch {
      return true;
    }
  });
  const [routeState, setRouteState] = useState({ active: false, pathname: location.pathname });

  const destination = useMemo(
    () => getLabel(routeState.pathname, lang),
    [routeState.pathname, lang]
  );

  useEffect(() => {
    if (!bootOpen) return undefined;

    let cancelled = false;
    const started = performance.now();
    const minimum = 1050;
    let pageLoaded = document.readyState === "complete";

    const maybeFinish = () => {
      if (cancelled || !appReady || !pageLoaded) return;
      const remaining = Math.max(0, minimum - (performance.now() - started));
      window.setTimeout(() => {
        if (cancelled) return;
        setBootOpen(false);
        try {
          sessionStorage.setItem("safespace_boot_seen", "1");
        } catch {
          // Session storage can be unavailable; the animation still completes.
        }
      }, remaining);
    };

    const onReady = () => {
      pageLoaded = true;
      maybeFinish();
    };
    window.addEventListener("safespace:app-ready", () => {
      setAppReady(true);
    });
    if (!pageLoaded) window.addEventListener("load", onReady, { once: true });
    else maybeFinish();

    const fallback = window.setTimeout(() => {
      if (!cancelled) {
        setBootOpen(false);
        try { sessionStorage.setItem("safespace_boot_seen", "1"); } catch {}
      }
    }, 5000);

    return () => {
      cancelled = true;
      window.removeEventListener("load", onReady);
      window.clearTimeout(fallback);
    };
  }, [bootOpen, appReady]);

  useEffect(() => {
    if (bootOpen) return;
    setRouteState((previous) => {
      if (previous.pathname === location.pathname) return previous;
      return { active: true, pathname: location.pathname };
    });

    const started = performance.now();
    let frame = 0;
    let timer = 0;

    const finish = () => {
      const remaining = Math.max(0, 560 - (performance.now() - started));
      timer = window.setTimeout(() => {
        frame = window.requestAnimationFrame(() => {
          setRouteState((previous) => ({ ...previous, active: false }));
        });
      }, remaining);
    };

    frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(finish);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [location.pathname, bootOpen]);

  const reduced = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  return (
    <>
      <div className={bootOpen ? "ss-boot ss-boot-open" : "ss-boot ss-boot-closing"} aria-hidden={!bootOpen}>
        <div className="ss-boot-aurora ss-boot-aurora-a" />
        <div className="ss-boot-aurora ss-boot-aurora-b" />
        <div className="ss-boot-particles" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => <i key={index} style={{ "--i": index }} />)}
        </div>
        <div className="ss-boot-center">
          <div className="ss-boot-mark">
            <Heart className="ss-boot-heart" strokeWidth={1.7} />
            <span className="ss-boot-ring ss-boot-ring-one" />
            <span className="ss-boot-ring ss-boot-ring-two" />
          </div>
          <div className="ss-boot-wordmark">SafeSpace<span>.</span></div>
          <div className="ss-boot-tagline">
            {lang === "en" ? "A calmer place to check in." : "พื้นที่เล็ก ๆ สำหรับดูแลใจ"}
          </div>
          <div className="ss-boot-progress"><span /></div>
        </div>
        <div className="ss-boot-footer">
          <span>SAFESPACE</span>
          <span>{lang === "en" ? "Preparing your space" : "กำลังเตรียมพื้นที่ของคุณ"}</span>
        </div>
      </div>

      <div className={routeState.active && !reduced ? "ss-route-veil ss-route-veil-on" : "ss-route-veil"} aria-hidden="true">
        <div className="ss-route-inner">
          <div className="ss-route-ring">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle className="ss-route-ring-bg" cx="32" cy="32" r="28" />
              <circle className="ss-route-ring-fg" cx="32" cy="32" r="28" pathLength="1" />
            </svg>
            <Heart className="ss-route-heart" strokeWidth={1.7} />
          </div>
          <span className="ss-route-kicker">SafeSpace</span>
          <strong>{destination}</strong>
        </div>
      </div>

      <div className={bootOpen ? "ss-app-content ss-app-hidden" : "ss-app-content"}>
        {children}
      </div>
    </>
  );
}
