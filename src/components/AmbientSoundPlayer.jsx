import React, { useEffect, useRef, useState } from "react";
import { Headphones, Play, Pause, X, ChevronUp, Timer, Volume2, Save, Trash2, Upload } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { SoundIllustrationIcon } from "@/components/WellnessIllustration";

const CHANNELS = [
  { id: "rain" },
  { id: "ocean" },
  { id: "forest" },
  { id: "fire" },
  { id: "bowl" },
  { id: "lofi" },
];

const PRESETS = {
  focus: { rain: 0.15, ocean: 0, forest: 0.15, fire: 0, bowl: 0, lofi: 0.2 },
  rainy: { rain: 0.35, ocean: 0.05, forest: 0, fire: 0.08, bowl: 0, lofi: 0 },
  zen: { rain: 0, ocean: 0.06, forest: 0.16, fire: 0, bowl: 0.16, lofi: 0 },
  sleep: { rain: 0.25, ocean: 0.12, forest: 0, fire: 0.1, bowl: 0.05, lofi: 0 },
};
const MIXES_KEY = "safespace_sound_mixes_v1";
const SOUND_DB = "safespace_sound_uploads_v1";
const SOUND_STORE = "tracks";
const MAX_TRACK_BYTES = 30 * 1024 * 1024;

function readSavedMixes() {
  try {
    const saved = JSON.parse(localStorage.getItem(MIXES_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((mix) => mix && typeof mix.id === "string" && typeof mix.name === "string") : [];
  } catch { return []; }
}

function openSoundDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error("Browser storage is unavailable.")); return; }
    const request = window.indexedDB.open(SOUND_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(SOUND_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local audio storage."));
  });
}

async function storeTrack(record) {
  const db = await openSoundDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SOUND_STORE, "readwrite");
    transaction.objectStore(SOUND_STORE).put(record, "custom");
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error || new Error("Could not save this audio file.")); };
  });
}

async function loadStoredTrack() {
  const db = await openSoundDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(SOUND_STORE, "readonly").objectStore(SOUND_STORE).get("custom");
    request.onsuccess = () => { db.close(); resolve(request.result || null); };
    request.onerror = () => { db.close(); reject(request.error || new Error("Could not load the saved audio file.")); };
  });
}

async function removeStoredTrack() {
  const db = await openSoundDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SOUND_STORE, "readwrite");
    transaction.objectStore(SOUND_STORE).delete("custom");
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error || new Error("Could not remove the saved audio file.")); };
  });
}

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
  const { t, lang } = useTranslation();
  const en = lang === "en";
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
    upload: 0,
  }));
  const [mixes, setMixes] = useState(readSavedMixes);
  const [mixName, setMixName] = useState("");
  const [customTrack, setCustomTrack] = useState(null);
  const [trackMessage, setTrackMessage] = useState("");
  const [mixMessage, setMixMessage] = useState("");
  const ctxRef = useRef(null);
  const channelsRef = useRef({});
  const timerRef = useRef(null);
  const customAudioRef = useRef(null);
  const customObjectUrlRef = useRef("");

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "metadata";
    customAudioRef.current = audio;
    let active = true;
    loadStoredTrack().then((track) => {
      if (!active || !track?.blob) return;
      const objectUrl = URL.createObjectURL(track.blob);
      customObjectUrlRef.current = objectUrl;
      audio.src = objectUrl;
      setCustomTrack({ name: track.name, size: track.blob.size });
    }).catch(() => {
      if (active && window.indexedDB) setTrackMessage("Could not load the saved track from this browser.");
    });
    return () => {
      active = false;
      audio.pause();
      audio.removeAttribute("src");
      if (customObjectUrlRef.current) URL.revokeObjectURL(customObjectUrlRef.current);
      customObjectUrlRef.current = "";
      customAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(MIXES_KEY, JSON.stringify(mixes)); } catch { /* Keep saved mixes for this visit if storage is unavailable. */ }
  }, [mixes]);

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
    if (customAudioRef.current) customAudioRef.current.volume = Math.max(0, Math.min(1, (volumes.upload || 0) * master));
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
      if (customAudioRef.current) customAudioRef.current.pause();
    };
  }, []);

  const togglePlaying = async () => {
    if (!playing) {
      await ensureAudio();
      applyVolumes();
      if (customAudioRef.current?.src) await customAudioRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      const ctx = ctxRef.current;
      if (ctx) await ctx.suspend();
      customAudioRef.current?.pause();
      setPlaying(false);
    }
  };

  const startTimer = (minutes) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimer(minutes);
    timerRef.current = setTimeout(async () => {
      if (ctxRef.current) await ctxRef.current.suspend();
      customAudioRef.current?.pause();
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

  const saveMix = () => {
    const name = mixName.trim().slice(0, 32);
    if (!name) { setMixMessage(en ? "Give your mix a name first." : "กรุณาตั้งชื่อมิกซ์ก่อน"); return; }
    const next = [{ id: `${Date.now()}`, name, volumes: { ...volumes }, master }, ...mixes].slice(0, 12);
    setMixes(next);
    setMixName("");
    setMixMessage(en ? "Mix saved on this device." : "บันทึกมิกซ์ไว้ในอุปกรณ์นี้แล้ว");
  };

  const useMix = (mix) => {
    if (!mix?.volumes) return;
    setVolumes((current) => ({ ...current, ...mix.volumes }));
    if (Number.isFinite(Number(mix.master))) setMaster(Number(mix.master));
    setMixMessage(en ? `${mix.name} loaded.` : `โหลดมิกซ์ ${mix.name} แล้ว`);
  };

  const importTrack = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!(file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3"))) {
      setTrackMessage(en ? "Please choose an MP3 file." : "กรุณาเลือกไฟล์ MP3");
      return;
    }
    if (file.size > MAX_TRACK_BYTES) {
      setTrackMessage(en ? "This MP3 is larger than 30 MB. Choose a smaller file." : "ไฟล์ MP3 นี้มีขนาดเกิน 30 MB กรุณาเลือกไฟล์ที่เล็กกว่า");
      return;
    }
    try {
      const record = { name: file.name, blob: file, savedAt: Date.now() };
      await storeTrack(record);
      const objectUrl = URL.createObjectURL(file);
      if (customObjectUrlRef.current) URL.revokeObjectURL(customObjectUrlRef.current);
      customObjectUrlRef.current = objectUrl;
      if (!customAudioRef.current) {
        customAudioRef.current = new Audio();
        customAudioRef.current.loop = true;
      }
      customAudioRef.current.src = objectUrl;
      setCustomTrack({ name: file.name, size: file.size });
      setVolumes((current) => ({ ...current, upload: current.upload || 0.18 }));
      setTrackMessage(en ? "MP3 saved privately in this browser." : "บันทึก MP3 ไว้ในเบราว์เซอร์นี้แล้วและจะไม่ถูกส่งออกไป");
      if (playing) await customAudioRef.current.play().catch(() => {});
    } catch {
      setTrackMessage(en ? "Could not save this MP3 in browser storage. Check available device storage and try again." : "บันทึก MP3 ในเบราว์เซอร์ไม่สำเร็จ กรุณาตรวจสอบพื้นที่จัดเก็บแล้วลองอีกครั้ง");
    }
  };

  const removeTrack = async () => {
    customAudioRef.current?.pause();
    if (customAudioRef.current) {
      customAudioRef.current.removeAttribute("src");
      customAudioRef.current.load();
    }
    if (customObjectUrlRef.current) URL.revokeObjectURL(customObjectUrlRef.current);
    customObjectUrlRef.current = "";
    setCustomTrack(null);
    setVolumes((current) => ({ ...current, upload: 0 }));
    try { await removeStoredTrack(); setTrackMessage(en ? "Imported MP3 removed from this browser." : "ลบ MP3 ที่นำเข้าออกจากเบราว์เซอร์นี้แล้ว"); }
    catch { setTrackMessage(en ? "Removed for this visit; browser storage could not be updated." : "ลบออกสำหรับการเข้าชมนี้แล้ว แต่แก้ไขที่จัดเก็บในเบราว์เซอร์ไม่สำเร็จ"); }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("sound.title")}
        className="fixed right-4 bottom-20 md:bottom-6 z-[120] w-12 h-12 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <ChevronUp className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
      </button>

      {open && (
        <div className="fixed right-4 bottom-36 md:bottom-20 z-[120] max-h-[calc(100dvh-10rem)] w-[min(94vw,400px)] overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t("sound.title")}</h3>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(PRESETS).map(([id]) => {
              const preset = PRESETS[id];
              const selected = Math.abs(volumes.upload || 0) < 0.001 && Object.keys(preset).every((key) => Math.abs((volumes[key] || 0) - preset[key]) < 0.001);
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

          <section className="mb-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60" aria-label={en ? "Save a custom sound mix" : "บันทึกมิกซ์เสียงของคุณ"}>
            <div className="flex gap-2">
              <input value={mixName} onChange={(event) => setMixName(event.target.value)} maxLength={32} aria-label={en ? "Mix name" : "ชื่อมิกซ์"} placeholder={en ? "Name this mix" : "ตั้งชื่อมิกซ์นี้"} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-violet-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
              <button type="button" onClick={saveMix} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-700 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-800"><Save className="h-3.5 w-3.5" />{en ? "Save mix" : "บันทึก"}</button>
            </div>
            {mixMessage && <p role="status" className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">{mixMessage}</p>}
            {mixes.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{mixes.map((mix) => <span key={mix.id} className="inline-flex items-center rounded-full border border-violet-200 bg-white dark:border-violet-400/20 dark:bg-slate-950"><button type="button" onClick={() => useMix(mix)} className="max-w-32 truncate px-2.5 py-1.5 text-[10px] font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-200">{mix.name}</button><button type="button" onClick={() => setMixes((current) => current.filter((item) => item.id !== mix.id))} aria-label={en ? `Delete ${mix.name}` : `ลบ ${mix.name}`} className="px-2 py-1.5 text-slate-400 hover:text-rose-600"><X className="h-3 w-3" /></button></span>)}</div>}
          </section>

          <section className="mb-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-3 dark:border-sky-400/10 dark:bg-sky-400/5" aria-label={en ? "Import an MP3 file" : "นำเข้าไฟล์ MP3"}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0"><p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{en ? "Your own MP3" : "เสียง MP3 ของคุณ"}</p><p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">{customTrack?.name || (en ? "Stored privately on this device" : "เก็บไว้ในอุปกรณ์นี้เท่านั้น")}</p></div>
              {customTrack ? <button type="button" onClick={removeTrack} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-400/10"><Trash2 className="h-3.5 w-3.5" />{en ? "Remove" : "ลบ"}</button> : <label className="relative inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-sky-700 shadow-sm hover:bg-sky-100 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-slate-800"><Upload className="h-3.5 w-3.5" />{en ? "Import MP3" : "นำเข้า MP3"}<input type="file" accept=".mp3,audio/mpeg" onChange={importTrack} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" /></label>}
            </div>
            {customTrack && <div className="mt-2 flex items-center gap-2"><Volume2 className="h-3.5 w-3.5 text-slate-500" /><input aria-label={en ? "Imported MP3 volume" : "ระดับเสียง MP3 ที่นำเข้า"} type="range" min="0" max="1" step="0.01" value={volumes.upload || 0} onChange={(event) => setVolumes((current) => ({ ...current, upload: Number(event.target.value) }))} className="flex-1" /><span className="w-8 text-right text-[10px] tabular-nums text-slate-500">{Math.round((volumes.upload || 0) * 100)}%</span></div>}
            <p className="mt-1 text-[9px] leading-relaxed text-slate-500 dark:text-slate-400">{en ? "MP3 up to 30 MB. Audio stays on this device and is never uploaded." : "ไฟล์ MP3 ไม่เกิน 30 MB เสียงจะอยู่ในอุปกรณ์นี้และไม่ถูกอัปโหลด"}</p>
            {trackMessage && <p role="status" className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{trackMessage}</p>}
          </section>

          <div className="space-y-2">
            {CHANNELS.map((ch) => (
              <div key={ch.id} className="flex items-center gap-2">
                <span className="w-7 h-7 shrink-0"><SoundIllustrationIcon type={ch.id} className="w-full h-full" /></span>
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
