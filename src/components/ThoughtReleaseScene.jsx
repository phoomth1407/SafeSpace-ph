import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Wind } from "lucide-react";

const RELEASE_AT = 4.8;
const BREATH_CARD_AT = 13.4;
const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (from, to, value) => {
  const progress = clamp((value - from) / (to - from));
  return progress * progress * (3 - 2 * progress);
};
const mix = (from, to, amount) => from + (to - from) * amount;

const RITUALS = {
  wind: {
    colors: ["#29245e", "#6650ad", "#c980aa", "#f6c4ba"],
    caption: ["Watch it drift beyond your reach.", "มองดูมันลอยไปไกลเกินเอื้อม"],
  },
  river: {
    colors: ["#18305e", "#456ba5", "#9ebee0", "#e6d9dc"],
    caption: ["Let the water carry it onward.", "ให้สายน้ำค่อย ๆ พาไป"],
  },
  garden: {
    colors: ["#244552", "#4f8984", "#a5d1b2", "#f1e8c8"],
    caption: ["Set it down and let the earth hold it.", "วางไว้ให้ผืนดินช่วยรับน้ำหนัก"],
  },
  starlight: {
    colors: ["#07091f", "#171746", "#3a2c78", "#82508f"],
    caption: ["Let it grow smaller beneath a wide sky.", "ปล่อยให้มันเล็กลงใต้ท้องฟ้ากว้าง"],
  },
};

function makeTextParticles(text, width, height, ritual) {
  const stamp = document.createElement("canvas");
  stamp.width = Math.ceil(width);
  stamp.height = Math.ceil(height);
  const stampContext = stamp.getContext("2d", { willReadFrequently: true });
  if (!stampContext) return [];

  const maxWidth = width * 0.82;
  const words = text.trim().split(/\s+/).filter(Boolean);
  let fontSize = Math.min(76, width / 5.2);
  let lines = [];
  for (; fontSize >= 16; fontSize -= 2) {
    stampContext.font = `500 ${fontSize}px Mali, "Segoe Print", "Bradley Hand", cursive`;
    lines = [];
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (current && stampContext.measureText(next).width > maxWidth) {
        lines.push(current);
        current = word;
      } else current = next;
    }
    if (current) lines.push(current);
    if (lines.length <= 5 && lines.length * fontSize * 1.22 < height * 0.48) break;
  }

  stampContext.clearRect(0, 0, stamp.width, stamp.height);
  stampContext.font = `500 ${fontSize}px Mali, "Segoe Print", "Bradley Hand", cursive`;
  stampContext.textAlign = "center";
  stampContext.textBaseline = "middle";
  stampContext.fillStyle = "#fff";
  const lineHeight = fontSize * 1.22;
  const firstY = height * 0.43 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => stampContext.fillText(line, width / 2, firstY + index * lineHeight, maxWidth));

  const pixels = stampContext.getImageData(0, 0, stamp.width, stamp.height).data;
  let sample = 3;
  let points = [];
  for (const stride of [3, 4, 5, 6, 8]) {
    sample = stride;
    points = [];
    for (let y = 0; y < stamp.height; y += stride) {
      for (let x = 0; x < stamp.width; x += stride) {
        if (pixels[(y * stamp.width + x) * 4 + 3] > 120) points.push({ x, y });
      }
    }
    if (points.length <= 3400) break;
  }

  return points.map(({ x, y }, index) => ({
    homeX: x,
    homeY: y,
    x,
    y,
    size: sample * (0.45 + Math.random() * 0.55),
    delay: ritual === "wind" ? ((x / width) * 2.4) + Math.random() * 0.6 : Math.random() * 2.4,
    phase: Math.random() * Math.PI * 2,
    targetX: width * (0.08 + Math.random() * 0.84),
    targetY: height * (0.06 + Math.random() * 0.4),
    sway: (Math.random() - 0.5) * 90,
    waterY: height * (0.68 + Math.random() * 0.17),
    soilY: height * (0.78 + Math.random() * 0.08),
    color: `hsl(${Math.random() < 0.35 ? 335 : 145 + Math.random() * 25} 78% 86%)`,
    index,
  }));
}

function drawRidges(context, width, height, y, amplitude, frequency, phase, color) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, height);
  for (let x = 0; x <= width + 10; x += 10) {
    const curve = Math.sin(x * frequency + phase) * amplitude
      + Math.sin(x * frequency * 2.1 + phase * 1.8) * amplitude * 0.34;
    context.lineTo(x, y + curve);
  }
  context.lineTo(width, height);
  context.closePath();
  context.fill();
}

function drawScene(context, width, height, time, ritual, particles) {
  const palette = RITUALS[ritual] || RITUALS.wind;
  const sky = context.createLinearGradient(0, 0, 0, height);
  palette.colors.forEach((color, index) => sky.addColorStop(index / 3, color));
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  if (ritual === "starlight") {
    const moonX = width * 0.8;
    const moonY = height * 0.2;
    const moonGlow = context.createRadialGradient(moonX, moonY, 0, moonX, moonY, height * 0.52);
    moonGlow.addColorStop(0, "rgba(225,205,255,.48)");
    moonGlow.addColorStop(1, "rgba(225,205,255,0)");
    context.fillStyle = moonGlow;
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#fff3dd";
    context.beginPath();
    context.arc(moonX, moonY, Math.max(7, height * 0.035), 0, Math.PI * 2);
    context.fill();
    for (let index = 0; index < 100; index += 1) {
      const x = ((index * 97 + 21) % 997) / 997 * width;
      const y = ((index * 193 + 87) % 991) / 991 * height * 0.76;
      const twinkle = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(time * 1.4 + index));
      context.globalAlpha = twinkle;
      context.fillStyle = "#fff";
      context.beginPath();
      context.arc(x, y, 0.7 + (index % 3) * 0.35, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    drawRidges(context, width, height, height * 0.8, 14, 0.009, 2, "#151239");
    drawRidges(context, width, height, height * 0.88, 10, 0.013, 5, "#0c0a28");
    return;
  }

  const sunX = ritual === "river" ? width * 0.74 : width * 0.3;
  const sunY = height * (ritual === "river" ? 0.53 : 0.42);
  const sunGlow = context.createRadialGradient(sunX, sunY, 1, sunX, sunY, height * 0.55);
  sunGlow.addColorStop(0, "rgba(255,224,197,.6)");
  sunGlow.addColorStop(1, "rgba(255,224,197,0)");
  context.fillStyle = sunGlow;
  context.fillRect(0, 0, width, height);

  // Slow cloud wisps help the quiet landscape feel alive before the word moves.
  for (let index = 0; index < 5; index += 1) {
    const x = ((index * width * 0.31 + time * (7 + index * 2)) % (width + 140)) - 70;
    const y = height * (0.14 + index * 0.075);
    context.globalAlpha = 0.16;
    context.fillStyle = "#fff";
    context.beginPath();
    context.ellipse(x, y, 42, 8, 0, 0, Math.PI * 2);
    context.ellipse(x + 28, y + 2, 32, 7, 0, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  if (ritual === "river") {
    const waterY = height * 0.67;
    drawRidges(context, width, height, waterY - 19, 14, 0.007, 2, "#3a4787");
    drawRidges(context, width, height, waterY - 4, 9, 0.012, 5, "#29356d");
    const water = context.createLinearGradient(0, waterY, 0, height);
    water.addColorStop(0, "#7289d0");
    water.addColorStop(1, "#1e2b66");
    context.fillStyle = water;
    context.fillRect(0, waterY, width, height - waterY);
    for (let row = 0; row < 12; row += 1) {
      const y = waterY + 8 + row * (height - waterY) / 12;
      context.globalAlpha = 0.13 + row * 0.012;
      context.strokeStyle = row % 3 === 0 ? "#ffe6c6" : "#d9e8ff";
      context.lineWidth = row % 3 === 0 ? 1.8 : 1;
      context.beginPath();
      for (let x = 0; x <= width; x += 12) {
        const waveY = y + Math.sin(x * 0.025 - time * 1.1 + row) * (2 + row * 0.25);
        if (x === 0) context.moveTo(x, waveY);
        else context.lineTo(x, waveY);
      }
      context.stroke();
    }
    context.globalAlpha = 1;
  } else if (ritual === "garden") {
    drawRidges(context, width, height, height * 0.63, 16, 0.008, 4, "#3d8580");
    drawRidges(context, width, height, height * 0.72, 11, 0.011, 1, "#2d6974");
    const soilY = height * 0.78;
    const soil = context.createLinearGradient(0, soilY, 0, height);
    soil.addColorStop(0, "#60445f");
    soil.addColorStop(1, "#302047");
    context.fillStyle = soil;
    context.fillRect(0, soilY, width, height - soilY);
    context.strokeStyle = "rgba(176,241,198,.7)";
    context.lineWidth = 1.5;
    for (let index = 0; index < 45; index += 1) {
      const x = index * width / 45;
      const heightOfGrass = 5 + (index * 7) % 11;
      const lean = Math.sin(time * 1.3 + index) * 4;
      context.beginPath();
      context.moveTo(x, soilY + 1);
      context.quadraticCurveTo(x + lean, soilY - heightOfGrass * 0.5, x + lean * 1.5, soilY - heightOfGrass);
      context.stroke();
    }
    const growth = smooth(RELEASE_AT + 2.4, RELEASE_AT + 9.5, time);
    if (growth > 0) {
      const stemHeight = height * 0.3 * (1 - Math.pow(1 - growth, 3));
      const rootX = width * 0.5;
      const flowerX = rootX + Math.sin(time * 1.2) * 6;
      const flowerY = soilY - stemHeight;
      context.strokeStyle = "#8fe3b0";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(rootX, soilY);
      context.quadraticCurveTo(rootX + 12, soilY - stemHeight * 0.55, flowerX, flowerY);
      context.stroke();
      for (let petal = 0; petal < 6; petal += 1) {
        context.save();
        context.translate(flowerX, flowerY);
        context.rotate(petal * Math.PI / 3 + time * 0.08);
        context.fillStyle = `rgba(255,194,221,${growth})`;
        context.beginPath();
        context.ellipse(0, -10 * growth, 4 * growth, 9 * growth, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      context.fillStyle = "#ffe58a";
      context.beginPath();
      context.arc(flowerX, flowerY, 3.5 * growth, 0, Math.PI * 2);
      context.fill();
    }
  } else {
    drawRidges(context, width, height, height * 0.65, 14, 0.008, 1, "#4b4387");
    drawRidges(context, width, height, height * 0.75, 12, 0.011, 3, "#393477");
    drawRidges(context, width, height, height * 0.85, 8, 0.014, 5, "#282354");
    context.strokeStyle = "rgba(210,194,255,.5)";
    context.lineWidth = 1.6;
    for (let index = 0; index < 60; index += 1) {
      const x = (index / 60) * width;
      const y = height * (0.87 + ((index * 13) % 9) / 9 * 0.12);
      const blade = height * (0.045 + ((index * 37) % 17) / 17 * 0.06);
      const bend = Math.sin(time * 1.7 + index * 0.7) * 4;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(x + bend * 0.3, y - blade * 0.6, x + bend, y - blade);
      context.stroke();
    }
  }

  if (ritual === "wind") {
    const wind = smooth(RELEASE_AT - 0.6, RELEASE_AT + 1.5, time)
      * (1 - smooth(RELEASE_AT + 6, RELEASE_AT + 8.5, time));
    context.strokeStyle = "rgba(255,255,255,.55)";
    context.lineWidth = 1.2;
    for (let index = 0; index < 13; index += 1) {
      const x = ((time * (95 + index * 13) + index * 115) % (width * 1.35)) - width * 0.15;
      const y = height * (0.16 + (index % 7) * 0.09);
      context.globalAlpha = 0.3 * wind;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(x + 30, y - 4, x + 70, y + Math.sin(time + index) * 3);
      context.stroke();
    }
    context.globalAlpha = 1;
  }

  particles.forEach((particle) => {
    const age = time - (RELEASE_AT + particle.delay);
    let alpha = smooth(1.4, 2.8, time);
    let { x, y, size } = particle;
    if (age <= 0) {
      const tremble = age > -0.5 ? (1 + age * 2) * 1.4 : 0;
      x = particle.homeX + Math.sin(time * 1.2 + particle.phase) * 0.55
        + (Math.random() - 0.5) * tremble;
      y = particle.homeY + Math.cos(time + particle.phase * 1.7) * 0.55
        + (Math.random() - 0.5) * tremble;
    } else if (ritual === "wind") {
      const drift = age * (58 + Math.min(age, 3.5) * 35 + (particle.index % 4) * 8);
      x = particle.homeX + drift;
      y = particle.homeY + Math.sin(age * 2 + particle.phase * 5) * (10 + age * 9);
      alpha *= 1 - smooth(1.5, 5, age);
    } else if (ritual === "river") {
      const fall = smooth(0, 0.8, age);
      const landingY = height * 0.69;
      x = particle.homeX + Math.max(0, age - 0.8) * (18 + particle.index % 20);
      y = mix(particle.homeY, Math.min(particle.waterY, landingY + height * 0.14), fall)
        + (age > 0.8 ? Math.sin(time * 1.8 + particle.phase) * 2 : 0);
      size *= age > 0.8 ? 0.9 : 1;
      alpha *= 1 - smooth(3, 7.5, age);
      if (age > 0.72 && age < 0.78 && particle.index % 15 === 0) {
        context.globalAlpha = 0.36;
        context.strokeStyle = "#fff";
        context.beginPath();
        context.ellipse(x, y, 5 + (age - 0.72) * 80, 2.5, 0, 0, Math.PI * 2);
        context.stroke();
      }
    } else if (ritual === "garden") {
      const fall = smooth(0, 1.1, age);
      x = particle.homeX + Math.sin(age * 1.6 + particle.phase) * 12;
      y = mix(particle.homeY, particle.soilY, fall);
      alpha *= 1 - smooth(1.1, 2.2, age);
    } else {
      const progress = smooth(0, 2.6 + (particle.index % 10) * 0.2, age);
      const arc = Math.sin(progress * Math.PI);
      x = mix(particle.homeX, particle.targetX, progress) + arc * particle.sway;
      y = mix(particle.homeY, particle.targetY, progress) - arc * 22;
      size *= mix(1, 0.65, progress);
      alpha = age < 3 ? alpha * (1 - smooth(2.2, 3.2, age)) : 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(time * 2 + particle.phase * 4));
    }
    if (alpha <= 0.01) return;
    context.globalAlpha = alpha;
    context.fillStyle = ritual === "garden" && age > 0.4 ? particle.color : "#fff";
    context.beginPath();
    context.arc(x, y, Math.max(0.65, size * (ritual === "river" && age > 0.8 ? 1.5 : 1)), 0, Math.PI * 2);
    context.fill();
  });
  context.globalAlpha = 1;
}

function captionAt(time, ritual, language) {
  if (time >= 0.2 && time <= 2.4) return language === "en" ? "Breathe in…" : "หายใจเข้า…";
  if (time >= 2.8 && time <= 4.6) return language === "en" ? "Hold it lightly." : "ค่อย ๆ รับรู้ความคิดนี้";
  if (time >= 5 && time <= 10.6) return RITUALS[ritual]?.caption[language === "en" ? 0 : 1];
  if (time >= 11 && time <= 13.2) return language === "en" ? "It has gone where it needs to go." : "ปล่อยให้มันเดินทางต่อไป";
  return "";
}

export default function ThoughtReleaseScene({ thought, ritual, language, onContinue }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [caption, setCaption] = useState("");
  const [breathReady, setBreathReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !stage || !context) return undefined;

    let width = 0;
    let height = 0;
    let ratio = 1;
    let particles = [];
    let animationFrame = 0;
    let startTime = performance.now();
    let lastCaption = "";
    let hasShownBreath = false;

    const fit = () => {
      const bounds = stage.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = makeTextParticles(thought || "love", width, height, ritual);
    };
    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(stage);

    const render = (now) => {
      const time = reduceMotion ? BREATH_CARD_AT : (now - startTime) / 1000;
      drawScene(context, width, height, time, ritual, particles);

      const nextCaption = reduceMotion ? "" : captionAt(time, ritual, language);
      if (nextCaption !== lastCaption) {
        lastCaption = nextCaption;
        setCaption(nextCaption);
      }
      if (!hasShownBreath && time >= BREATH_CARD_AT) {
        hasShownBreath = true;
        setBreathReady(true);
      }
      if (!reduceMotion) animationFrame = requestAnimationFrame(render);
    };

    if (reduceMotion) {
      setBreathReady(true);
      render(startTime);
    } else {
      animationFrame = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [thought, ritual, language, reduceMotion]);

  return (
    <div ref={stageRef} className="relative mx-auto aspect-[5/4] min-h-[280px] w-full max-w-2xl overflow-hidden rounded-[1.8rem] bg-[#171746] shadow-[0_22px_70px_rgba(34,24,80,.3)] sm:min-h-[350px]">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      <motion.p
        aria-live="polite"
        initial={{ opacity: 0 }}
        animate={{ opacity: caption ? 1 : 0 }}
        transition={{ duration: 0.65 }}
        className="pointer-events-none absolute left-4 right-4 top-[11%] text-center text-sm tracking-wide text-white [text-shadow:0_1px_12px_rgba(0,0,0,.6)] sm:text-base"
      >
        {caption}
      </motion.p>
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 text-center text-[10px] tracking-wide text-white/75 sm:text-xs">
        {language === "en" ? "Nothing here is saved or sent." : "สิ่งที่เขียนจะไม่ถูกบันทึกหรือส่งไปที่ใด"}
      </div>

      {breathReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[linear-gradient(160deg,#eeeaff,#ffe8ee_70%,#e3efff)] px-5 py-4 text-center text-[#1d1a33]"
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/75 text-violet-700 shadow-sm"><Wind className="h-5 w-5" /></div>
          <p className="text-[10px] font-bold uppercase tracking-[.17em] text-violet-600">{language === "en" ? "A quiet moment" : "ช่วงเวลาแห่งความสงบ"}</p>
          <h3 className="text-2xl font-bold sm:text-3xl">{language === "en" ? "Take one easy breath" : "หายใจสบาย ๆ หนึ่งครั้ง"}</h3>
          <p className="text-sm text-[#6b6788]">{language === "en" ? "Follow the glow as it rises… and softens." : "มองแสงที่ค่อย ๆ สว่างขึ้น… แล้วนุ่มนวลลง"}</p>
          <motion.div
            aria-hidden="true"
            animate={reduceMotion ? { scale: 1, opacity: 0.75 } : { scale: [0.85, 1.25, 0.85], opacity: [0.8, 0.48, 0.8] }}
            transition={reduceMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="my-1 h-14 w-14 rounded-full bg-[radial-gradient(circle,#fff_0,#cdbcff_55%,rgba(205,188,255,0)_72%)] sm:h-[4.5rem] sm:w-[4.5rem]"
          />
          <button
            type="button"
            onClick={onContinue}
            className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#6d3fd8] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#5b31bd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          >
            {language === "en" ? "Continue" : "ไปต่อ"}<ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
