import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./RouteTransition.css";

const LABELS = {
  "/": { en: "Home", th: "หน้าหลัก" },
  "/resources": { en: "Resources", th: "แหล่งช่วยเหลือ" },
  "/community": { en: "Community", th: "ชุมชน" },
  "/assessment": { en: "Assessment", th: "แบบประเมิน" },
  "/history": { en: "History", th: "ประวัติ" },
  "/contact-admin": { en: "Contact", th: "ติดต่อผู้ดูแล" },
  "/admin": { en: "Admin", th: "ผู้ดูแลระบบ" },
  "/login": { en: "Sign in", th: "เข้าสู่ระบบ" },
  "/register": { en: "Create account", th: "สร้างบัญชี" },
};

const getLabel = (pathname) => {
  const key = Object.keys(LABELS).find((route) => route === pathname || pathname.startsWith(route + "/"));
  return LABELS[key] || { en: "SafeSpace", th: "SafeSpace" };
};

export default function RouteTransition({ lang = "en" }) {
  const { pathname } = useLocation();
  const veilRef = useRef(null);
  const nameRef = useRef(null);
  const ringRef = useRef(null);
  const barRef = useRef(null);
  const fillRef = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }

    const veil = veilRef.current;
    const ring = ringRef.current;
    const fill = fillRef.current;
    const bar = barRef.current;
    if (!veil || !ring || !fill || !bar) return undefined;

    const label = getLabel(pathname);
    nameRef.current.textContent = lang === "th" ? label.th : label.en;

    ring.style.transition = "none";
    ring.style.strokeDashoffset = "176";
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

    const t1 = window.setTimeout(() => { fill.style.width = "100%"; }, 480);
    const t2 = window.setTimeout(() => { veil.classList.add("leaving"); }, 720);
    const t3 = window.setTimeout(() => {
      veil.classList.remove("on", "leaving");
      fill.classList.add("done");
    }, 920);
    const t4 = window.setTimeout(() => {
      bar.classList.remove("on");
      fill.style.width = "0%";
      fill.classList.remove("done");
    }, 1220);

    return () => [t1, t2, t3, t4].forEach(window.clearTimeout);
  }, [pathname, lang]);

  return (
    <>
      <div className="veil" ref={veilRef} aria-hidden="true">
        <div className="veil__inner">
          <div className="ring">
            <svg className="ring__svg" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="safespace-route-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4b7bff" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle className="ring__bg" cx="32" cy="32" r="28" />
              <circle className="ring__fg" cx="32" cy="32" r="28" ref={ringRef} />
            </svg>
            <div className="ring__mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
          <div className="veil__copy">
            <p className="veil__label">{lang === "th" ? "กำลังเปิด" : "Opening"}</p>
            <p className="veil__name" ref={nameRef}>Home</p>
          </div>
        </div>
      </div>
      <div className="bar" ref={barRef}><div className="bar__fill" ref={fillRef} /></div>
    </>
  );
}
