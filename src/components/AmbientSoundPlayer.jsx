import React, { useEffect, useRef, useState } from "react";
import { Headphones, Play, Pause, X, ChevronUp, Timer, Volume2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const CHANNELS = [
  { id: "rain", emoji: "🌧️" },
  { id: "ocean", emoji: "🌊" },
  { id: "forest", emoji: "🍃" },
  { id: "fire", emoji: "🔥" },
  { id: "bowl", emoji: "🔔" },
  { id: "lofi", emoji: "🎹" },
];

const PRESETS = {
  focus: { rain: 0.15, ocean: 0, forest: 0.15, fire: 0, bowl: 0, lofi: 0.2 },
  rainy: { rain: 0.35, ocean: 0.05, forest: 0, fire: 0.08, bowl: 0, lofi: 0 },
  zen: { rain: 0, ocean: 0.06, forest: 0.16, fire: 0, bowl: 0.16, lofi: 0 },
  sleep: { rain: 0.25, ocean: 0.12, forest: 0, fire: 0.1, bowl: 0.05, lofi: 0 },
};

function makeNoise(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

function createChannel(ctx, id) {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);

  if (id === "bowl") {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 432;
    g.gain.value = 0.035;

    lfo.type = "sine";
    lfo.frequency.value = 0.18;
    lfoGain.gain.value = 0.012;

    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    osc.connect(g);
    g.connect(gain);

    osc.start();
    lfo.start();
    return { input: gain, gain, nodes: [osc, g, lfo, lfoGain] };
  }

  if (id === "lofi") {
    const master = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const nodes = [master, filter, lfo, lfoGain];

    // A soft four-note chord pad that is clearly audible but still stays gentle.
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    master.gain.value = 0.22;

    [220, 261.63, 329.63, 392].forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = index === 0 ? "triangle" : "sine";
      osc.frequency.value = frequency;
      oscGain.gain.value = index === 0 ? 0.24 : 0.16;
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      nodes.push(osc, oscGain);
    });

    filter.connect(master);
    master.connect(gain);

    // Very slow movement adds warmth without pumping the volume up and down.
    lfo.frequency.value = 0.028;
    lfoGain.gain.value = 16;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    return { input: gain, gain, nodes };
  }

  if (id === "fire") {
    const noise = makeNoise(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.7;
    noise.connect(filter);
    filter.connect(gain);
    const crackle = ctx.createGain();
    crackle.gain.value = 0;
    crackle.connect(gain);
    const pulse = () => {
      const t = ctx.currentTime;
      crackle.gain.cancelScheduledValues(t);
      crackle.gain.setValueAtTime(0.001, t);
      crackle.gain.linearRampToValueAtTime(0.11, t + 0.015);
      crackle.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      setTimeout(() => { if (ctx.state !== "closed") pulse(); }, 180 + Math.random() * 650);
    };
    pulse();
    noise.start();
    return { input: gain, gain, nodes: [noise, filter, crackle] };
  }

  const noise = makeNoise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = id === "rain" ? "lowpass" : id === "ocean" ? "bandpass" : "lowpass";
  filter.frequency.value = id === "rain" ? 3200 : id === "ocean" ? 650 : 900;
  filter.Q.value = id === "ocean" ? 0.7 : 0.2;

  const lfo = ctx.createOscillator();
  const lfoDepth = ctx.createGain();
  lfo.frequency.value = id === "ocean" ? 0.08 : id === "forest" ? 0.05 : 0.18;

  // Modulate the filter instead of the output gain so volume=0 is truly silent.
  lfoDepth.gain.value = id === "ocean" ? 220 : 140;
  lfo.connect(lfoDepth);
  lfoDepth.connect(filter.frequency);

  noise.connect(filter);
  filter.connect(gain);
  noise.start();
  lfo.start();

  return { input: gain, gain, nodes: [noise, filter, lfo, lfoDepth] };
}

export default function AmbientSoundPlayer() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [master, setMaster] = useState(0.6);
  const [timer, setTimer] = useState(0);
  const [volumes, setVolumes] = useState(() => ({
    rain: 0.22,
    ocean: 0,
    forest: 0,
    fire: 0,
    bowl: 0,
    lofi: 0,
  }));
  const ctxRef = useRef(null);
  const channelsRef = useRef({});
  const timerRef = useRef(null);

  const ensureAudio = async () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctxRef.current) {
      const ctx = new AC();
      ctxRef.current = ctx;
      CHANNELS.forEach((c) => { channelsRef.current[c.id] = createChannel(ctx, c.id); });
    }
    if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
    return ctxRef.current;
  };

  const applyVolumes = () => {
    Object.entries(volumes).forEach(([id, value]) => {
      const ch = channelsRef.current[id];
      if (ch) ch.gain.gain.setTargetAtTime(value * master, ctxRef.current.currentTime, 0.05);
    });
  };

  useEffect(() => {
    if (ctxRef.current) applyVolumes();
  }, [volumes, master]);

  useEffect(() => {
    const openPlayer = () => setOpen(true);
    window.addEventListener("safespace:open-sounds", openPlayer);
    return () => window.removeEventListener("safespace:open-sounds", openPlayer);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (ctxRef.current) ctxRef.current.close().catch(() => {});
    };
  }, []);

  const togglePlaying = async () => {
    if (!playing) {
      await ensureAudio();
      applyVolumes();
      setPlaying(true);
    } else {
      const ctx = ctxRef.current;
      if (ctx) await ctx.suspend();
      setPlaying(false);
    }
  };

  const startTimer = (minutes) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimer(minutes);
    timerRef.current = setTimeout(async () => {
      if (ctxRef.current) await ctxRef.current.suspend();
      setPlaying(false);
      setTimer(0);
    }, minutes * 60 * 1000);
  };

  const setPreset = async (name) => {
    const next = PRESETS[name];
    setVolumes(next);
    await ensureAudio();
    if (!playing) setPlaying(true);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("sound.title")}
        className="fixed right-4 bottom-20 md:bottom-6 z-[60] w-12 h-12 rounded-full !bg-white dark:!bg-slate-900 !text-slate-900 dark:!text-white shadow-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <ChevronUp className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
      </button>

      {open && (
        <div className="fixed right-4 bottom-36 md:bottom-20 z-[60] w-[min(92vw,360px)] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold !text-slate-900 dark:!text-slate-100">{t("sound.title")}</h3>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(PRESETS).map(([id]) => {
              const preset = PRESETS[id];
              const selected = Object.keys(preset).every((key) => Math.abs((volumes[key] || 0) - preset[key]) < 0.001);
              return (
                <button
                  key={id}
                  onClick={() => setPreset(id)}
                  className={`px-3 py-2 rounded-xl border text-xs transition-colors ${selected
                    ? "bg-sky-500/10 border-sky-400/40 text-sky-800 dark:text-sky-200"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"}`}
                >
                  {t(`sound.preset.${id}`)}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {CHANNELS.map((ch) => (
              <div key={ch.id} className="flex items-center gap-2">
                <span className="w-7 text-base">{ch.emoji}</span>
                <span className="w-20 text-[11px] text-slate-700 dark:text-slate-300">{t(`sound.${ch.id}`)}</span>
                <input
                  aria-label={t(`sound.${ch.id}`)}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volumes[ch.id]}
                  onChange={(e) => setVolumes((v) => ({ ...v, [ch.id]: Number(e.target.value) }))}
                  className="flex-1"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Volume2 className="w-4 h-4 text-slate-500" />
            <input type="range" min="0" max="1" step="0.01" value={master} onChange={(e) => setMaster(Number(e.target.value))} className="flex-1" />
            <button onClick={togglePlaying} className="h-9 px-3 rounded-xl !bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900 text-xs font-semibold flex items-center gap-1">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {playing ? t("sound.pause") : t("sound.play")}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Timer className="w-4 h-4 text-slate-500" />
            {[15, 30, 60].map((m) => (
              <button key={m} onClick={() => startTimer(m)} className={`px-3 py-1.5 rounded-lg text-[11px] border ${timer === m ? "bg-sky-500/10 border-sky-400/30 text-sky-700 dark:text-sky-300" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"}`}>
                {m}m
              </button>
            ))}
            {timer > 0 && <span className="text-[10px] text-slate-500">{t("sound.timerSet")}</span>}
          </div>
        </div>
      )}
    </>
  );
}
