import { useEffect, useRef, useState } from "react";
import "./Preloader.css";

const PALETTE = [
  [75, 123, 255], [139, 92, 246], [52, 211, 181], [255, 107, 157],
];

const TITLE = [
  { text: "Safe", cls: "word w1", delay: 0.55 },
  { text: "Space", cls: "word w2 serif", delay: 0.78 },
];

export default function Preloader({ onComplete }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const fillRef = useRef(null);
  const statusRef = useRef(null);
  const shieldRef = useRef(null);
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const [gone, setGone] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const soundOnRef = useRef(false);

  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  useEffect(() => {
    const pre = rootRef.current;
    const canvas = canvasRef.current;
    if (!pre || !canvas) return;

    const ctx = canvas.getContext("2d");
    const fill = fillRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none)").matches;

    let W = 0, H = 0, dpr = 1;
    const particles = [];
    const sparkles = [];
    const shockwaves = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = pre.clientWidth;
      H = pre.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnParticles(n) {
      particles.length = 0;
      for (let i = 0; i < n; i += 1) {
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const baseR = .8 + Math.random() * 2.2;
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
          r: baseR, baseR, alpha: .25 + Math.random() * .55,
          color, phase: Math.random() * Math.PI * 2,
        });
      }
    }

    let cursorX = -999, cursorY = -999;
    let cursorSX = -999, cursorSY = -999;
    let mxPct = 50, myPct = 50, txPct = 50, tyPct = 50;
    let tiltX = 0, tiltY = 0, sTiltX = 0, sTiltY = 0;
    let ringX = window.innerWidth / 2, ringY = window.innerHeight / 2;

    function onMove(event) {
      const rect = pre.getBoundingClientRect();
      const rx = event.clientX - rect.left;
      const ry = event.clientY - rect.top;
      cursorX = rx; cursorY = ry;
      txPct = (rx / rect.width) * 100;
      tyPct = (ry / rect.height) * 100;
      tiltX = ((event.clientY / window.innerHeight - .5) * 2) * -14;
      tiltY = ((event.clientX / window.innerWidth - .5) * 2) * 16;

      if (!isTouch && !reduced && cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${event.clientX}px, ${event.clientY}px) translate(-50%,-50%)`;
      }

      if (!isTouch && Math.random() < .28) {
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        sparkles.push({
          x: rx, y: ry,
          vx: (Math.random() - .5) * 1.2,
          vy: (Math.random() - .5) * 1.2 - .4,
          life: 1, color, size: .6 + Math.random() * 1.4,
        });
      }
    }

    function onClick(event) {
      if (isTouch) return;
      const rect = pre.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      shockwaves.push({ x, y, r: 20, strength: 1 });

      const ripple = document.createElement("div");
      ripple.className = "shockwave";
      ripple.style.left = event.clientX + "px";
      ripple.style.top = event.clientY + "px";
      document.body.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 1500);

      for (let i = 0; i < 14; i += 1) {
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const angle = (i / 14) * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        sparkles.push({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 1, color, size: 1 + Math.random() * 2,
        });
      }
    }

    let raf = 0;
    function loop() {
      ctx.clearRect(0, 0, W, H);
      cursorSX += (cursorX - cursorSX) * .18;
      cursorSY += (cursorY - cursorSY) * .18;

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.phase += .02;
        p.r = p.baseR + Math.sin(p.phase) * .4;
        const dx = cursorSX - p.x, dy = cursorSY - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / 161) * .9;
          p.x += (dx / d) * f; p.y += (dy / d) * f;
        }
        for (const sw of shockwaves) {
          const sdx = p.x - sw.x, sdy = p.y - sw.y;
          const sd = Math.sqrt(sdx * sdx + sdy * sdy) || 1;
          const rd = Math.abs(sd - sw.r);
          if (rd < 60) {
            const f = (1 - rd / 60) * sw.strength;
            p.x += (sdx / sd) * f * 3; p.y += (sdy / sd) * f * 3;
          }
        }
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;
      }

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 8000) {
            const alpha = (1 - d2 / 8000) * .18;
            const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
            const md2 = (midX - cursorSX) ** 2 + (midY - cursorSY) ** 2;
            const boost = md2 < 30000 ? (1 - md2 / 30000) * .5 : 0;
            ctx.strokeStyle = `rgba(75,123,255,${alpha + boost})`;
            ctx.lineWidth = .7;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const [r, g, b] = p.color;
        const d2 = (p.x - cursorSX) ** 2 + (p.y - cursorSY) ** 2;
        const boost = d2 < 26000 ? (1 - d2 / 26000) * .7 : 0;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `rgba(${r},${g},${b},${(p.alpha + boost) * .9})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, p.alpha + boost + .2)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }

      for (let i = sparkles.length - 1; i >= 0; i -= 1) {
        const s = sparkles[i];
        s.x += s.vx; s.y += s.vy; s.vy += .025; s.vx *= .98; s.vy *= .98; s.life -= .018;
        if (s.life <= 0) { sparkles.splice(i, 1); continue; }
        const [r, g, b] = s.color;
        ctx.fillStyle = `rgba(${r},${g},${b},${s.life * .7})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2); ctx.fill();
      }

      for (let i = shockwaves.length - 1; i >= 0; i -= 1) {
        const sw = shockwaves[i];
        sw.r += 14; sw.strength *= .93;
        if (sw.strength < .02) { shockwaves.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(75,123,255,${sw.strength * .5})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(139,92,246,${sw.strength * .35})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r * 1.14, 0, Math.PI * 2); ctx.stroke();
      }

      raf = requestAnimationFrame(loop);
    }

    let raf2 = 0;
    function smooth() {
      mxPct += (txPct - mxPct) * .09;
      myPct += (tyPct - myPct) * .09;
      pre.style.setProperty("--mx", mxPct + "%");
      pre.style.setProperty("--my", myPct + "%");
      sTiltX += (tiltX - sTiltX) * .08;
      sTiltY += (tiltY - sTiltY) * .08;

      if (shieldRef.current) {
        shieldRef.current.style.transform =
          `rotateX(${sTiltX}deg) rotateY(${sTiltY}deg)`;
      }

      pre.querySelectorAll(".blob").forEach((blob, index) => {
        const depth = (index + 1) * 12;
        blob.style.marginLeft = ((mxPct - 50) / 50 * depth) + "px";
        blob.style.marginTop = ((myPct - 50) / 50 * depth) + "px";
      });

      if (!isTouch && !reduced && ringRef.current) {
        const rect = pre.getBoundingClientRect();
        const targetX = rect.left + (mxPct / 100) * rect.width;
        const targetY = rect.top + (myPct / 100) * rect.height;
        ringX += (targetX - ringX) * .14;
        ringY += (targetY - ringY) * .14;
        ringRef.current.style.transform =
          `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      }

      raf2 = requestAnimationFrame(smooth);
    }

    let audioCtx = null;
    function playTone(freq, dur, type = "sine", vol = .05) {
      if (!soundOnRef.current) return;
      if (!audioCtx) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch { return; }
      }
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(vol, audioCtx.currentTime + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + dur);
      oscillator.connect(gain).connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + dur);
    }

    let started = false;
    function start() {
      if (started) return;
      started = true;
      resize();
      if (!isTouch) spawnParticles(70);

      const t0 = performance.now();
      let progress = 0;
      let lastShown = -1;

      function tick(now) {
        const t = (now - t0) / 1000;
        let target;
        if (t < 1.7) target = 90 * (1 - Math.exp(-t * 1.05));
        else if (t < 2.35) target = 90 + 10 * ((t - 1.7) / .65);
        else target = 100;

        progress += (target - progress) * .09;
        if (target === 100 && progress > 99.6) progress = 100;

        const p = Math.round(progress);
        if (p !== lastShown) {
          const str = String(Math.min(100, p)).padStart(3, "0");
          rootRef.current.querySelectorAll(".digit .col").forEach((col, index) => {
            const digit = parseInt(str[index], 10);
            const parent = col.parentElement;
            if (index === 0 && p < 100) {
              parent.style.opacity = "0";
              parent.style.width = "0";
            } else {
              parent.style.opacity = "1";
              parent.style.width = ".58em";
            }
            col.style.transform = `translateY(-${digit * 34}px)`;
          });
          lastShown = p;
        }

        if (fill) fill.style.transform = `scaleX(${progress / 100})`;
        if (statusRef.current) {
          statusRef.current.textContent =
            p < 35 ? "Initialising" :
            p < 70 ? "Preparing space" :
            p < 99 ? "Almost ready" : "Welcome";
        }

        if (progress >= 100) {
          pre.classList.add("preloader-ready");
          playTone(880, .4, "sine", .06);
          window.setTimeout(() => playTone(1320, .5, "sine", .05), 120);
          window.setTimeout(exit, 600);
          return;
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    function exit() {
      pre.classList.add("exiting");

      if (!isTouch) {
        for (const p of particles) {
          const dx = p.x - W / 2, dy = p.y - H / 2;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          p.vx = (dx / distance) * 6 + (Math.random() - .5) * 2;
          p.vy = (dy / distance) * 6 + (Math.random() - .5) * 2;
        }

        for (let i = 0; i < 40; i += 1) {
          const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
          const angle = Math.random() * Math.PI * 2;
          const speed = 4 + Math.random() * 8;
          sparkles.push({
            x: W / 2, y: H / 2,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: 1, color, size: 1 + Math.random() * 2.5,
          });
        }
      }

      window.setTimeout(() => {
        pre.classList.add("collapsing");
        onComplete?.();
      }, 620);

      window.setTimeout(() => {
        pre.classList.add("gone");
        document.body.classList.remove("locked");
        setGone(true);
      }, 2200);
    }

    document.body.classList.add("locked");

    if (reduced) {
      fill.style.transform = "scaleX(1)";
      window.setTimeout(exit, 400);
    } else {
      resize();
      if (!isTouch) {
        spawnParticles(70);
        window.addEventListener("mousemove", onMove);
        pre.addEventListener("click", onClick);
        raf = requestAnimationFrame(loop);
        raf2 = requestAnimationFrame(smooth);
      }
      window.addEventListener("resize", resize);
      window.addEventListener("load", start);
      if (document.readyState === "complete") start();
      const safety = window.setTimeout(start, 300);

      return () => {
        cancelAnimationFrame(raf);
        cancelAnimationFrame(raf2);
        window.clearTimeout(safety);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMove);
        pre.removeEventListener("click", onClick);
        window.removeEventListener("load", start);
        document.body.classList.remove("locked");
      };
    }

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(raf2);
      document.body.classList.remove("locked");
    };
  }, [onComplete]);

  if (gone) return null;

  return (
    <div id="preloader" ref={rootRef}>
      <div className="aurora" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-4" />
      <canvas id="canvas" ref={canvasRef} />
      <div className="spotlight" />
      <div className="grain" />
      <div className="vignette" />
      <div className="streak" />
      <div className="flash" />

      <button
        className={`sound-toggle ${soundOn ? "" : "off"}`}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setSoundOn((value) => !value);
        }}
        aria-label="Toggle sound"
      >
        <svg className="on" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
        <svg className="muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      </button>

      <div className="pre-content">
        <header className="pre-top">
          <div className="pre-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" />
            </svg>
            SafeSpace
          </div>
          <div className="pre-status"><span className="dot" /><span ref={statusRef}>Initialising</span></div>
        </header>

        <div className="pre-center">
          <div className="shield-wrap" ref={shieldRef}>
            <div className="shield-glow" />
            <svg className="shield" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="safespace-preloader-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4b7bff" />
                  <stop offset="45%" stopColor="#8b5cf6" />
                  <stop offset="75%" stopColor="#ff6b9d" />
                  <stop offset="100%" stopColor="#34d3b5" />
                </linearGradient>
              </defs>
              <path className="outline" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path className="check" d="m9 12 2 2 4-4" />
            </svg>
          </div>

          <h1 className="pre-title">
            {TITLE.map(({ text, cls, delay }) => (
              <span key={text} className={cls}>
                {text.split("").map((character, index) => (
                  <span key={index} className="ch" style={{ animationDelay: `${delay + index * .045}s` }}>{character}</span>
                ))}
              </span>
            ))}
          </h1>

          <p className="pre-tagline">A calm place for your mind</p>

          <div className="pre-progress">
            <div className="track"><div className="fill" ref={fillRef} /></div>
            <div className="counter">
              <span>Loading</span>
              <span className="num">
                {[0, 1, 2].map((index) => (
                  <span className="digit" key={index}>
                    <span className="col">{[0,1,2,3,4,5,6,7,8,9].map((digit) => <span key={digit}>{digit}</span>)}</span>
                  </span>
                ))}
                <small>%</small>
              </span>
            </div>
          </div>
        </div>

        <footer className="pre-bottom">
          <span>© 2025 — SafeSpace</span>
          <span className="right">Crafted with care</span>
        </footer>
      </div>

      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />
    </div>
  );
}
