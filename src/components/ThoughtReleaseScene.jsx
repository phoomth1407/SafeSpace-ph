import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Wind } from "lucide-react";
import { usePerformanceSettings } from "@/lib/performanceSettings";

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
    caption: ["Watch your thought become starlight.", "มองความคิดค่อย ๆ กลายเป็นแสงดาว"],
  },
};

const QUALITY_BUDGET = { low: 200, balanced: 380, high: 650, ultra: 950 };
const seededRandom = (value, salt) => {
  const raw = Math.sin((value + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return raw - Math.floor(raw);
};

function splitLongToken(token, context, maxWidth) {
  const graphemes = typeof Intl.Segmenter === "function"
    ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(token), (item) => item.segment)
    : Array.from(token);
  const pieces = [];
  let piece = "";
  for (const grapheme of graphemes) {
    if (piece && context.measureText(piece + grapheme).width > maxWidth) {
      pieces.push(piece);
      piece = grapheme;
    } else piece += grapheme;
  }
  if (piece) pieces.push(piece);
  return pieces;
}

function wrapThought(text, context, maxWidth) {
  const lines = [];
  for (const paragraph of text.trim().split(/\n+/)) {
    let line = "";
    for (const token of paragraph.match(/\s+|[^\s]+/gu) || []) {
      if (/^\s+$/u.test(token)) {
        if (line) line += " ";
        continue;
      }
      const pieces = context.measureText(token).width <= maxWidth
        ? [token]
        : splitLongToken(token, context, maxWidth);
      for (const piece of pieces) {
        const next = line ? `${line}${piece}` : piece;
        if (line && context.measureText(next).width > maxWidth) {
          lines.push(line);
          line = piece;
        } else line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines.length ? lines : [""];
}

function makeTextParticles(text, width, height, ritual, quality, graphics) {
  const stamp = document.createElement("canvas");
  stamp.width = Math.ceil(width);
  stamp.height = Math.ceil(height);
  const stampContext = stamp.getContext("2d", { willReadFrequently: true });
  if (!stampContext) return [];

  const maxWidth = width * 0.84;
  let fontSize = Math.min(76, width / 5.2);
  let lines = [text];
  for (; fontSize >= 10; fontSize -= 2) {
    stampContext.font = `500 ${fontSize}px Mali, "Segoe Print", "Bradley Hand", cursive`;
    lines = wrapThought(text || "love", stampContext, maxWidth);
    if (lines.length * fontSize * 1.18 <= height * 0.5) break;
  }

  stampContext.clearRect(0, 0, stamp.width, stamp.height);
  stampContext.font = `500 ${fontSize}px Mali, "Segoe Print", "Bradley Hand", cursive`;
  stampContext.textAlign = "center";
  stampContext.textBaseline = "middle";
  stampContext.fillStyle = "#fff";
  const lineHeight = Math.min(fontSize * 1.22, (height * 0.5) / Math.max(1, lines.length));
  const firstY = height * 0.44 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => stampContext.fillText(line, width / 2, firstY + index * lineHeight, maxWidth));

  const pixels = stampContext.getImageData(0, 0, stamp.width, stamp.height).data;
  const budget = graphics?.particleCount || QUALITY_BUDGET[quality] || QUALITY_BUDGET.balanced;
  let sample = 3;
  let points = [];
  for (const stride of [3, 4, 5, 6, 8, 10, 12, 14]) {
    sample = stride;
    points = [];
    for (let y = 0; y < stamp.height; y += stride) {
      for (let x = 0; x < stamp.width; x += stride) {
        if (pixels[(y * stamp.width + x) * 4 + 3] > 120) points.push({ x, y });
      }
    }
    if (points.length <= budget) break;
  }

  const clusters = [
    { x: width * 0.25, y: height * 0.2, rx: width * 0.16, ry: height * 0.15 },
    { x: width * 0.69, y: height * 0.25, rx: width * 0.18, ry: height * 0.17 },
    { x: width * 0.47, y: height * 0.49, rx: width * 0.2, ry: height * 0.13 },
  ];
  const targets = points.map((_, index) => {
    const cluster = clusters[index % clusters.length];
    const radial = Math.min(2.2, Math.sqrt(-2 * Math.log(Math.max(0.002, seededRandom(index, 4)))));
    const angle = seededRandom(index, 5) * Math.PI * 2;
    return {
      x: clamp((cluster.x + Math.cos(angle) * radial * cluster.rx * 0.5) / width),
      y: clamp((cluster.y + Math.sin(angle) * radial * cluster.ry * 0.5) / height),
    };
  }).map((target) => ({
    x: width * (0.05 + target.x * 0.9),
    y: height * (0.06 + target.y * 0.7),
  }));

  return points.map(({ x, y }, index) => ({
    homeX: x,
    homeY: y,
    x,
    y,
    size: sample * (0.45 + Math.random() * 0.55) * (graphics?.particleSize || 1),
    delay: ritual === "wind" ? ((x / width) * 2.4) + Math.random() * 0.6 : ritual === "starlight" ? 0.3 + Math.random() * 1.3 : Math.random() * 2.4,
    phase: Math.random() * Math.PI * 2,
    simX: x,
    simY: y,
    prevX: x,
    prevY: y,
    renderX: x,
    renderY: y,
    velocityX: 0,
    velocityY: 0,
    launched: false,
    targetX: targets[index]?.x ?? width * 0.5,
    targetY: targets[index]?.y ?? height * 0.3,
    sway: (Math.random() - 0.5) * width * 0.14,
    waterY: height * (0.68 + Math.random() * 0.17),
    soilY: height * (0.78 + Math.random() * 0.08),
    color: graphics?.palette === "soft"
      ? `hsl(${Math.random() * 360} 82% 82%)`
      : graphics?.palette === "cosmic" || ritual === "starlight"
        ? `hsl(${190 + Math.random() * 145} 100% ${72 + Math.random() * 20}%)`
        : `hsl(${145 + Math.random() * 185} 88% ${72 + Math.random() * 20}%)`,
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

function stepStarlightPhysics(particles, time, delta, width, height, graphics) {
  const dt = Math.min(0.05, Math.max(0, delta * graphics.motionSpeed));
  const movementTime = RELEASE_AT + Math.max(0, time - RELEASE_AT) * graphics.motionSpeed;
  if (!dt) return;

  const cellSize = 28;
  const cells = new Map();
  particles.forEach((particle) => {
    const age = time - (RELEASE_AT + particle.delay);
    if (!particle.launched && age > 0) {
      const dx = particle.homeX - width * 0.5;
      const dy = particle.homeY - height * 0.44;
      const angle = Math.atan2(dy, dx) + (seededRandom(particle.index, 8) - 0.5) * 1.15;
      const speed = 150 + seededRandom(particle.index, 9) * 250;
      particle.velocityX = Math.cos(angle) * speed;
      particle.velocityY = Math.sin(angle) * speed - 40;
      particle.launched = true;
    }
    if (!particle.launched) return;
    particle.prevX = particle.simX;
    particle.prevY = particle.simY;
    const cellX = Math.floor(particle.simX / cellSize);
    const cellY = Math.floor(particle.simY / cellSize);
    const key = `${cellX}:${cellY}`;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(particle);
  });

  particles.forEach((particle) => {
    if (!particle.launched) return;
    const age = Math.max(0, time - (RELEASE_AT + particle.delay));
    const settle = smooth(0.7, 5.2, age);
    let forceX = (particle.targetX - particle.simX) * (1.4 + settle * 5.2);
    let forceY = (particle.targetY - particle.simY) * (1.4 + settle * 5.2) + 12 * graphics.gravity;
    const vortexFade = 1 - settle;

    // Three moving gravity wells bend the initial burst into loose, curved streams.
    for (let well = 0; well < 3; well += 1) {
      const phase = movementTime * (0.42 + well * 0.08) + well * Math.PI * 2 / 3;
      const wellX = width * (0.5 + Math.cos(phase) * 0.22);
      const wellY = height * (0.34 + Math.sin(phase * 1.17) * 0.2);
      const dx = wellX - particle.simX;
      const dy = wellY - particle.simY;
      const distance = Math.max(28, Math.hypot(dx, dy));
      const influence = Math.exp(-distance / (height * 0.42)) * vortexFade;
      forceX += (dx / distance * 32 - dy / distance * 86) * influence * graphics.turbulence;
      forceY += (dy / distance * 32 + dx / distance * 86) * influence * graphics.turbulence;
    }

    const turbulence = (1 - settle * 0.82) * 68 * graphics.turbulence;
    forceX += Math.sin(particle.simY * 0.021 + movementTime * 2.4 + particle.phase) * turbulence;
    forceY += Math.cos(particle.simX * 0.018 - movementTime * 2.1 + particle.phase * 1.4) * turbulence;

    const cellX = Math.floor(particle.simX / cellSize);
    const cellY = Math.floor(particle.simY / cellSize);
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        const neighbors = cells.get(`${cellX + offsetX}:${cellY + offsetY}`) || [];
        neighbors.forEach((other) => {
          if (other === particle) return;
          const dx = particle.simX - other.simX;
          const dy = particle.simY - other.simY;
          const distanceSquared = dx * dx + dy * dy;
          const particleDistance = 8 + particle.size * 1.4;
          if (distanceSquared > 1 && distanceSquared < particleDistance * particleDistance) {
            const distance = Math.sqrt(distanceSquared);
            const push = (particleDistance - distance) * 5.8;
            forceX += dx / distance * push;
            forceY += dy / distance * push;
          }
        });
      }
    }

    particle.velocityX = (particle.velocityX + forceX * dt) * Math.exp(-(0.9 + settle * 3.8) * dt);
    particle.velocityY = (particle.velocityY + forceY * dt) * Math.exp(-(0.9 + settle * 3.8) * dt);
    const speed = Math.hypot(particle.velocityX, particle.velocityY);
    if (speed > 440) {
      particle.velocityX *= 440 / speed;
      particle.velocityY *= 440 / speed;
    }
    particle.simX += particle.velocityX * dt;
    particle.simY += particle.velocityY * dt;
    if (particle.simX < 4 || particle.simX > width - 4) {
      particle.simX = clamp(particle.simX / width) * width;
      particle.velocityX *= -graphics.bounce;
    }
    if (particle.simY < 4 || particle.simY > height * 0.75) {
      particle.simY = Math.min(height * 0.75, Math.max(4, particle.simY));
      particle.velocityY *= -graphics.bounce;
    }
  });
}

function drawScene(context, width, height, time, ritual, particles, quality, delta, graphics, physicsEnabled) {
  const palette = RITUALS[ritual] || RITUALS.wind;
  const enhanced = quality === "high" || quality === "ultra";
  const ultra = quality === "ultra";
  if (physicsEnabled && ritual === "starlight") stepStarlightPhysics(particles, time, delta, width, height, graphics);
  const sky = context.createLinearGradient(0, 0, 0, height);
  palette.colors.forEach((color, index) => sky.addColorStop(index / 3, color));
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  if (ritual === "starlight") {
    const moonX = width * 0.8;
    const moonY = height * 0.2;
    const nebula = context.createRadialGradient(width * 0.38, height * 0.34, 0, width * 0.38, height * 0.34, width * (ultra ? 0.64 : 0.52));
    nebula.addColorStop(0, `rgba(123,103,210,${ultra ? 0.3 : enhanced ? 0.22 : 0.12})`);
    nebula.addColorStop(1, "rgba(123,103,210,0)");
    context.fillStyle = nebula;
    context.fillRect(0, 0, width, height);
    const moonGlow = context.createRadialGradient(moonX, moonY, 0, moonX, moonY, height * (ultra ? 0.7 : 0.52));
    moonGlow.addColorStop(0, ultra ? "rgba(225,205,255,.58)" : "rgba(225,205,255,.42)");
    moonGlow.addColorStop(1, "rgba(225,205,255,0)");
    context.fillStyle = moonGlow;
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#fff3dd";
    context.beginPath();
    context.arc(moonX, moonY, Math.max(7, height * 0.035), 0, Math.PI * 2);
    context.fill();
    if (enhanced) {
      context.save();
      context.globalAlpha = 0.14;
      context.fillStyle = "#a69ad4";
      context.beginPath();
      context.arc(moonX - height * 0.012, moonY - height * 0.008, height * 0.009, 0, Math.PI * 2);
      context.arc(moonX + height * 0.011, moonY + height * 0.01, height * 0.006, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
    const starCount = quality === "low" ? 30 : quality === "balanced" ? 58 : ultra ? 170 : 110;
    for (let index = 0; index < starCount; index += 1) {
      const x = seededRandom(index, 1) * width;
      const y = seededRandom(index, 2) * height * 0.76;
      const twinkle = 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(time * 1.4 + index));
      context.globalAlpha = twinkle;
      context.fillStyle = index % 7 === 0 ? "#d8dcff" : "#fff8e8";
      context.beginPath();
      context.arc(x, y, 0.8 + (index % 3) * (ultra ? 0.7 : 0.35), 0, Math.PI * 2);
      context.fill();
      if (ultra && index % 17 === 0) {
        context.globalAlpha = twinkle * 0.36;
        context.strokeStyle = "#e8e5ff";
        context.lineWidth = 0.8;
        context.beginPath();
        context.moveTo(x - 4, y);
        context.lineTo(x + 4, y);
        context.moveTo(x, y - 4);
        context.lineTo(x, y + 4);
        context.stroke();
      }
    }
    if (enhanced) {
      for (let meteor = 0; meteor < (ultra ? 3 : 1); meteor += 1) {
        const cycle = (time + meteor * 3.7) % 9.5;
        if (cycle > 0.15 && cycle < 0.95) {
          const progress = (cycle - 0.15) / 0.8;
          const x = width * (0.12 + meteor * 0.2 + progress * 0.64);
          const y = height * (0.08 + meteor * 0.07 + progress * 0.31);
          const tail = width * (ultra ? 0.11 : 0.075);
          const trail = context.createLinearGradient(x - tail, y - tail * 0.48, x, y);
          trail.addColorStop(0, "rgba(205,214,255,0)");
          trail.addColorStop(1, "rgba(255,246,220,.95)");
          context.save();
          context.globalAlpha = Math.sin(progress * Math.PI) * (ultra ? 0.9 : 0.58);
          context.strokeStyle = trail;
          context.lineWidth = ultra ? 2.2 : 1.4;
          context.shadowColor = "rgba(210,220,255,.85)";
          context.shadowBlur = ultra ? 16 : 8;
          context.beginPath();
          context.moveTo(x - tail, y - tail * 0.48);
          context.lineTo(x, y);
          context.stroke();
          context.restore();
        }
      }
    }
    context.globalAlpha = 1;
    context.save();
    if (enhanced) {
      context.shadowColor = "rgba(4,5,30,.55)";
      context.shadowBlur = ultra ? 28 : 16;
    }
    drawRidges(context, width, height, height * 0.8, 14, 0.009, 2, "#151239");
    drawRidges(context, width, height, height * 0.88, 10, 0.013, 5, "#0c0a28");
    context.restore();
  } else {
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

  if (enhanced) {
    context.shadowColor = ritual === "starlight" ? "rgba(189,205,255,.9)" : "rgba(255,255,255,.65)";
    context.shadowBlur = ultra ? 14 : 8;
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
      if (physicsEnabled && ritual === "starlight") {
        x = particle.simX;
        y = particle.simY;
        const settled = smooth(2.8, 6.2, age);
        size *= mix(1.25, 1.4, settled);
        const twinkle = 0.5 + 0.46 * (0.5 + 0.5 * Math.sin(time * 3.1 + particle.phase * 3));
        alpha *= mix(0.76, twinkle, settled);
      } else {
        const progress = smooth(0, 2.6 + (particle.index % 10) * 0.2, age);
        const arc = Math.sin(progress * Math.PI);
        x = mix(particle.homeX, particle.targetX, progress) + arc * particle.sway;
        y = mix(particle.homeY, particle.targetY, progress) - arc * height * 0.11;
        size *= mix(1, ritual === "starlight" ? 1.2 : 0.65, progress);
        if (ritual === "starlight") {
        const arrived = smooth(1.65, 2.55, age);
        const twinkle = 0.46 + 0.48 * (0.5 + 0.5 * Math.sin(time * (ultra ? 3.2 : graphics.motionSpeed * 2.2) + particle.phase * 3));
        alpha *= mix(1 - smooth(0.25, 1.45, age), twinkle, arrived);
        } else {
          alpha = age < 3 ? alpha * (1 - smooth(2.2, 3.2, age)) : 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(time * 2 + particle.phase * 4));
        }
      }
    }
    if (alpha <= 0.01) return;
    if (graphics.trails && age > 0.12 && age < 4.5 && Math.hypot(x - particle.renderX, y - particle.renderY) > 0.5) {
      context.globalAlpha = alpha * (1 - smooth(3, 4.5, age)) * Math.min(0.46, graphics.glow * 0.28);
      context.strokeStyle = particle.color;
      context.lineWidth = Math.max(0.45, size * 0.19);
      context.beginPath();
      context.moveTo(particle.renderX, particle.renderY);
      context.lineTo(x, y);
      context.stroke();
    }
    particle.renderX = x;
    particle.renderY = y;
    if (graphics.glow > 0) {
      context.globalAlpha = alpha * Math.min(0.38, graphics.glow * 0.18);
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(x, y, Math.max(1, size * (1.8 + graphics.glow * 0.2)), 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = alpha;
    context.fillStyle = "#fff";
    context.beginPath();
    if (ritual === "starlight" && age > 1.5 && size >= 1.55) {
      const radius = Math.min(4.2, Math.max(1.1, size * 0.86));
      context.moveTo(x, y - radius * 1.8);
      context.quadraticCurveTo(x + radius * 0.22, y - radius * 0.22, x + radius * 1.8, y);
      context.quadraticCurveTo(x + radius * 0.22, y + radius * 0.22, x, y + radius * 1.8);
      context.quadraticCurveTo(x - radius * 0.22, y + radius * 0.22, x - radius * 1.8, y);
      context.quadraticCurveTo(x - radius * 0.22, y - radius * 0.22, x, y - radius * 1.8);
      context.closePath();
    } else context.arc(x, y, Math.max(0.65, size * (ritual === "river" && age > 0.8 ? 1.5 : 1)), 0, Math.PI * 2);
    context.fill();
  });
  context.shadowBlur = 0;
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
  const { quality, activeQuality, activeAdvancedGraphics } = usePerformanceSettings();
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
    let previousFrame = startTime;
    let lastCaption = "";
    let hasShownBreath = false;

    const fit = () => {
      const bounds = stage.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      ratio = Math.min(window.devicePixelRatio || 1, activeAdvancedGraphics.canvasScale);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = makeTextParticles(thought || "love", width, height, ritual, activeQuality, activeAdvancedGraphics);
    };
    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(stage);

    const render = (now) => {
      const time = reduceMotion ? BREATH_CARD_AT : (now - startTime) / 1000;
      const delta = reduceMotion ? 0 : Math.min(0.04, Math.max(0, (now - previousFrame) / 1000));
      previousFrame = now;
      const physicsEnabled = quality === "ultra" || quality === "custom" || (quality === "auto" && ["high", "ultra"].includes(activeAdvancedGraphics.baseQuality));
      drawScene(context, width, height, time, ritual, particles, activeQuality, delta, activeAdvancedGraphics, physicsEnabled);

      const nextCaption = reduceMotion ? "" : captionAt(time, ritual, language);
      if (nextCaption !== lastCaption) {
        lastCaption = nextCaption;
        setCaption(nextCaption);
      }
      if (!hasShownBreath && time >= BREATH_CARD_AT) {
        hasShownBreath = true;
        setBreathReady(true);
      }
      if (!reduceMotion && time < BREATH_CARD_AT) animationFrame = requestAnimationFrame(render);
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
  }, [thought, ritual, language, reduceMotion, activeQuality, activeAdvancedGraphics, quality]);

  return (
    <div ref={stageRef} data-scene-quality={activeQuality} className={`thought-release-scene relative mx-auto aspect-[5/4] min-h-[280px] w-full max-w-2xl overflow-hidden rounded-[1.8rem] bg-[#171746] ${activeQuality === "ultra" ? "shadow-[0_30px_100px_rgba(75,57,160,.44)]" : activeQuality === "low" ? "shadow-md" : "shadow-[0_22px_70px_rgba(34,24,80,.3)]"} sm:min-h-[350px]`}>
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
