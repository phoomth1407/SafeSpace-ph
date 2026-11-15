import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { DEFAULT_ADVANCED_GRAPHICS, usePerformanceSettings } from "@/lib/performanceSettings";

function RangeSetting({ label, value, min, max, step, display, onChange, help }) {
  return <label className="block rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-700/80 dark:bg-slate-950/30">
    <span className="flex items-start justify-between gap-3">
      <span>
        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
        {help && <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">{help}</span>}
      </span>
      <span className="shrink-0 rounded-lg bg-violet-50 px-2 py-1 text-xs font-bold tabular-nums text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">{display}</span>
    </span>
    <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-4 w-full accent-violet-600" />
  </label>;
}

export default function AdvancedGraphicsSettings() {
  const { lang } = useTranslation();
  const { quality, setQuality, advancedGraphics, setAdvancedGraphics, recommendedAdvancedGraphics } = usePerformanceSettings();
  const en = lang === "en";
  const update = (key, value) => setAdvancedGraphics((current) => ({ ...current, [key]: value }));
  const reset = () => setAdvancedGraphics(DEFAULT_ADVANCED_GRAPHICS);
  const paletteLabels = en
    ? { aurora: "Aurora · cool color sparks", cosmic: "Cosmic · vivid star colors", soft: "Soft · gentle pastel glow" }
    : { aurora: "แสงเหนือ · ประกายสีเย็น", cosmic: "จักรวาล · สีดาวสดใส", soft: "ละมุน · แสงพาสเทลอ่อน ๆ" };
  const baseQualityLabels = en
    ? { low: "Low", balanced: "Balanced", high: "High", ultra: "Ultra" }
    : { low: "ต่ำ", balanced: "สมดุล", high: "สูง", ultra: "อัลตรา" };

  return <div className="mx-auto max-w-4xl space-y-6 pb-8">
    <Link to="/settings" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/60 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-violet-200">
      <ArrowLeft className="h-4 w-4" />{en ? "Back to Settings" : "กลับไปหน้าตั้งค่า"}
    </Link>

    <header className="rounded-3xl border border-violet-200/70 bg-gradient-to-br from-white/95 via-violet-50/80 to-sky-50/80 p-6 shadow-sm dark:border-violet-300/10 dark:from-slate-900/90 dark:via-violet-950/30 dark:to-sky-950/30 md:p-8">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-violet-600 dark:text-violet-300">SafeSpace · {en ? "Fine controls" : "ควบคุมอย่างละเอียด"}</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{en ? "Advanced graphics" : "กราฟิกขั้นสูง"}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{en ? "Shape how the thought-release scene moves and looks. These settings stay on this device and apply when Custom is selected." : "ปรับการเคลื่อนไหวและรูปลักษณ์ของฉากวางความคิด การตั้งค่าจะอยู่ในอุปกรณ์นี้และใช้เมื่อเลือกโหมดกำหนดเอง"}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800/75 dark:text-slate-300">
          <Sparkles className="h-4 w-4 text-violet-500" />
          {en ? `Auto recommendation: ${baseQualityLabels[recommendedAdvancedGraphics.baseQuality]}, ${recommendedAdvancedGraphics.particleCount} particles` : `ค่าแนะนำอัตโนมัติ: ${baseQualityLabels[recommendedAdvancedGraphics.baseQuality]}, ${recommendedAdvancedGraphics.particleCount} อนุภาค`}
        </span>
        {quality === "custom" ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200"><CheckCircle2 className="h-4 w-4" />{en ? "Custom is active" : "กำลังใช้ค่ากำหนดเอง"}</span> : <button type="button" onClick={() => setQuality("custom")} className="rounded-full bg-violet-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-800">{en ? "Use custom settings" : "ใช้ค่ากำหนดเอง"}</button>}
        <button type="button" onClick={() => setQuality("auto")} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"><Sparkles className="h-3.5 w-3.5" />{en ? "Switch back to Auto" : "กลับไปโหมดอัตโนมัติ"}</button>
      </div>
    </header>

    <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/65 md:p-6" aria-labelledby="particle-physics-title">
      <div className="mb-4"><h2 id="particle-physics-title" className="text-lg font-bold text-slate-900 dark:text-white">{en ? "Particle physics & feel" : "ฟิสิกส์และสัมผัสของอนุภาค"}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{en ? "Tune how the dots scatter, drift, and settle." : "ปรับการแตกกระจาย ล่องลอย และค่อย ๆ สงบนิ่งของจุดแสง"}</p></div>
      <div className="grid gap-3 md:grid-cols-2">
        <RangeSetting label={en ? "Particle count" : "จำนวนอนุภาค"} value={advancedGraphics.particleCount} min={120} max={1400} step={20} display={advancedGraphics.particleCount} onChange={(value) => update("particleCount", value)} help={en ? "More dots create finer lettering and a denser release." : "จุดมากขึ้นทำให้ตัวอักษรละเอียดและการสลายตัวหนาแน่นขึ้น"} />
        <RangeSetting label={en ? "Dot size" : "ขนาดจุด"} value={advancedGraphics.particleSize} min={0.3} max={1.4} step={0.05} display={`${advancedGraphics.particleSize.toFixed(2)}×`} onChange={(value) => update("particleSize", value)} />
        <RangeSetting label={en ? "Animation speed" : "ความเร็วแอนิเมชัน"} value={advancedGraphics.motionSpeed} min={0.5} max={1.8} step={0.05} display={`${advancedGraphics.motionSpeed.toFixed(2)}×`} onChange={(value) => update("motionSpeed", value)} help={en ? "Make the particle movement slower or more lively." : "ปรับการเคลื่อนไหวของอนุภาคให้ช้าลงหรือมีชีวิตชีวามากขึ้น"} />
        <RangeSetting label={en ? "Gravity" : "แรงโน้มถ่วง"} value={advancedGraphics.gravity} min={0} max={2.5} step={0.05} display={`${advancedGraphics.gravity.toFixed(2)}×`} onChange={(value) => update("gravity", value)} help={en ? "Controls how strongly particles fall and return toward their resting points." : "ควบคุมแรงที่ดึงอนุภาคให้ตกและกลับสู่ตำแหน่งพัก"} />
        <RangeSetting label={en ? "Swirl & turbulence" : "กระแสวนและความปั่นป่วน"} value={advancedGraphics.turbulence} min={0} max={2.5} step={0.05} display={`${advancedGraphics.turbulence.toFixed(2)}×`} onChange={(value) => update("turbulence", value)} help={en ? "Adds soft currents and less predictable movement." : "เพิ่มกระแสลมเบา ๆ และการเคลื่อนไหวที่คาดเดาได้น้อยลง"} />
        <RangeSetting label={en ? "Bounce" : "แรงเด้ง"} value={advancedGraphics.bounce} min={0} max={1} step={0.02} display={`${Math.round(advancedGraphics.bounce * 100)}%`} onChange={(value) => update("bounce", value)} />
        <RangeSetting label={en ? "Glow" : "แสงเรือง"} value={advancedGraphics.glow} min={0} max={2} step={0.05} display={`${advancedGraphics.glow.toFixed(2)}×`} onChange={(value) => update("glow", value)} />
      </div>
      <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/30">
        <span><span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{en ? "Motion trails" : "แสงลากตามการเคลื่อนไหว"}</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{en ? "Leave a short luminous trail behind moving dots." : "ทิ้งแสงเป็นทางสั้น ๆ ตามหลังจุดที่เคลื่อนที่"}</span></span>
        <input type="checkbox" checked={advancedGraphics.trails} onChange={(event) => update("trails", event.target.checked)} className="h-5 w-5 accent-violet-600" />
      </label>
    </section>

    <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/65 md:p-6" aria-labelledby="canvas-title">
      <div className="mb-4"><h2 id="canvas-title" className="text-lg font-bold text-slate-900 dark:text-white">{en ? "Canvas & color" : "แคนวาสและสีสัน"}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{en ? "Higher resolution uses more memory and battery." : "ความละเอียดสูงจะใช้หน่วยความจำและแบตเตอรี่มากขึ้น"}</p></div>
      <div className="grid gap-3 md:grid-cols-2">
        <RangeSetting label={en ? "Canvas resolution" : "ความละเอียดแคนวาส"} value={advancedGraphics.canvasScale} min={0.75} max={2.5} step={0.05} display={`${advancedGraphics.canvasScale.toFixed(2)}×`} onChange={(value) => update("canvasScale", value)} help={en ? "Maximum pixel ratio; the device screen ratio still sets the ceiling." : "อัตราส่วนพิกเซลสูงสุด โดยอัตราส่วนหน้าจอจริงยังเป็นเพดานอีกชั้น"} />
        <label className="block rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-700/80 dark:bg-slate-950/30"><span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{en ? "Base visual effects" : "ระดับเอฟเฟกต์ภาพพื้นฐาน"}</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{en ? "Controls the broader scene detail beneath your custom values." : "ควบคุมรายละเอียดโดยรวมของฉากร่วมกับค่ากำหนดเอง"}</span><select value={advancedGraphics.baseQuality} onChange={(event) => update("baseQuality", event.target.value)} className="mt-3 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{["balanced", "high", "ultra"].map((value) => <option key={value} value={value}>{baseQualityLabels[value]}</option>)}</select></label>
        <label className="block rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-700/80 dark:bg-slate-950/30"><span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{en ? "Particle color palette" : "ชุดสีอนุภาค"}</span><select value={advancedGraphics.palette} onChange={(event) => update("palette", event.target.value)} className="mt-3 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{Object.entries(paletteLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
    </section>

    <footer className="flex flex-wrap justify-between gap-3">
      <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/75 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"><RotateCcw className="h-4 w-4" />{en ? "Reset custom values" : "คืนค่ากำหนดเอง"}</button>
      <Link to="/settings" className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800">{en ? "Done" : "เสร็จสิ้น"}</Link>
    </footer>
  </div>;
}
