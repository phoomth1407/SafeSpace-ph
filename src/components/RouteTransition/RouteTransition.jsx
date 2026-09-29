import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import "./RouteTransition.css";

const LABELS = {
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
  const entry = Object.entries(LABELS).find(([route]) =>
    route === pathname || (route === "/result" && pathname.startsWith("/result/"))
  )?.[1] || { en: "SafeSpace", th: "SafeSpace" };
  return lang === "th" ? entry.th : entry.en;
};

const RING_LEN = 176;

export default function RouteTransition() {
  const { pathname } = useLocation();
  const { lang } = useTranslation();
  const veilRef = useRef(null);
  const nameRef = useRef(null);
  const ringRef = useRef(null);
  const barRef = useRef(null);
  const fillRef = useRef(null);
  const first = useRef(true);
  const timers = useRef([]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }

    const veil = veilRef.current;
    const ring = ringRef.current;
    const bar = barRef.current;
    const fill = fillRef.current;
    const name = nameRef.current;
    if (!veil || !ring || !bar || !fill || !name) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const destination = getRouteName(pathname, lang);
    name.textContent = destination;

    timers.current.forEach(window.clearTimeout);
    timers.current = [];

    if (reduced) {
      veil.classList.remove("on", "leaving");
      bar.classList.remove("on");
      return undefined;
    }

    ring.style.transition = "none";
    ring.style.strokeDashoffset = String(RING_LEN);
    veil.classList.remove("leaving");

    requestAnimationFrame(() => {
      veil.classList.add("on");
      requestAnimationFrame(() => {
        ring.style.transition = "";
        ring.style.strokeDashoffset = "0";
      });
    });

    bar.classList.add("on");
    fill.classList.remove("done");
    fill.style.width = "0%";
    void fill.offsetWidth;
    requestAnimationFrame(() => { fill.style.width = "60%"; });

    const swap = window.setTimeout(() => {
      fill.style.width = "100%";
    }, 480);
    const leave = window.setTimeout(() => {
      veil.classList.add("leaving");
    }, 720);
    const hide = window.setTimeout(() => {
      veil.classList.remove("on", "leaving");
      fill.classList.add("done");
    }, 920);
    const cleanup = window.setTimeout(() => {
      bar.classList.remove("on");
      fill.style.width = "0%";
      fill.classList.remove("done");
    }, 1220);
    timers.current = [swap, leave, hide, cleanup];

    return () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, [pathname, lang]);

  return (
    <>
      <div className="veil" ref={veilRef} aria-hidden="true">
        <div className="veil__inner">
          <div className="ring">
            <svg className="ring__svg" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="safespace-route-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4b7bff" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle className="ring__bg" cx="32" cy="32" r="28" />
              <circle className="ring__fg" cx="32" cy="32" r="28" ref={ringRef} />
            </svg>
            <div className="ring__mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
            <p className="veil__label">Opening</p>
            <p className="veil__name" ref={nameRef}>Home</p>
          </div>
        </div>
      </div>
      <div className="bar" ref={barRef}>
        <div className="bar__fill" ref={fillRef} />
      </div>
    </>
  );
}
