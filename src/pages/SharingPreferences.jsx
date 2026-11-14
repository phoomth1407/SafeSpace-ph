import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, LockKeyhole, Loader2, ShieldCheck, Sparkles, Gauge, MonitorSmartphone } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { usePerformanceSettings } from "@/lib/performanceSettings";

const QUALITY_OPTIONS = ["auto", "low", "balanced", "high"];

export default function SharingPreferences() {
  const { isAuthenticated, user } = useAuth();
  const { lang } = useTranslation();
  const { quality, setQuality, activeQuality, recommendedQuality } = usePerformanceSettings();
  const en = lang === "en";
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?.id) { setLoading(false); return; }
      setLoading(true);
      const { data, error: readError } = await supabase.from("assessment_sharing_preferences")
        .select("share_risk_score").eq("user_id", user.id).maybeSingle();
      if (!active) return;
      if (readError) setError(en ? "Could not load your sharing preference." : "ไม่สามารถโหลดการตั้งค่าการแบ่งปันได้");
      else setSharing(data?.share_risk_score === true);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [user?.id, en]);

  const saveSharing = async (next) => {
    if (!user?.id || saving) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      const { error: prefError } = await supabase.from("assessment_sharing_preferences").upsert({
        user_id: user.id, share_risk_score: next, updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
      if (prefError) throw prefError;
      const { error: scoreError } = await supabase.from("assessments")
        .update({ share_with_admin: next }).eq("created_by_id", user.id);
      if (scoreError) throw scoreError;
      setSharing(next); setSaved(true);
    } catch {
      setError(en ? "Could not save this change. Please try again." : "บันทึกการตั้งค่าไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally { setSaving(false); }
  };

  const optionLabels = {
    auto: en ? "Auto" : "อัตโนมัติ",
    low: en ? "Low" : "ต่ำ",
    balanced: en ? "Balanced" : "สมดุล",
    high: en ? "High" : "สูง",
  };
  const optionCopy = {
    auto: en ? `Use the ${optionLabels[recommendedQuality]} preset recommended for this device.` : `ใช้ค่าที่แนะนำสำหรับอุปกรณ์นี้: ${optionLabels[recommendedQuality]}`,
    low: en ? "Keep the page lightweight and turn off most decorative motion and heavy visual effects." : "ลดการเคลื่อนไหวและเอฟเฟกต์ตกแต่งส่วนใหญ่ เพื่อให้หน้าเว็บเบาและตอบสนองไว",
    balanced: en ? "Keep the core atmosphere with fewer continuous effects." : "คงบรรยากาศหลักไว้ พร้อมลดเอฟเฟกต์ที่ทำงานต่อเนื่อง",
    high: en ? "Keep the full visual atmosphere, motion, and layered effects." : "คงบรรยากาศ การเคลื่อนไหว และเอฟเฟกต์เต็มรูปแบบ",
  };

  return <div className="max-w-3xl mx-auto space-y-6">
    <header className="flex items-center gap-3 pt-2">
      <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center"><SettingsIcon /></div>
      <div><p className="text-xs uppercase tracking-wider text-violet-500 font-semibold">SafeSpace</p><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{en ? "Settings" : "ตั้งค่า"}</h1></div>
    </header>

    <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8 space-y-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/15 grid place-items-center shrink-0"><Gauge className="w-5 h-5 text-sky-600 dark:text-sky-300" /></div>
        <div><h2 className="font-semibold text-slate-900 dark:text-white">{en ? "Graphics & performance" : "กราฟิกและประสิทธิภาพ"}</h2><p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mt-1">{en ? "SafeSpace checks available browser device hints and motion preferences to suggest a starting level. Your choice stays on this device." : "SafeSpace ใช้ข้อมูลอุปกรณ์ที่เบราว์เซอร์เปิดเผยและการตั้งค่าการเคลื่อนไหว เพื่อแนะนำระดับเริ่มต้น การเลือกของคุณจะบันทึกไว้ในอุปกรณ์นี้"}</p></div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 px-4 py-3 text-sm text-slate-600 dark:text-slate-300"><MonitorSmartphone className="w-5 h-5 shrink-0 text-slate-500" /><span>{en ? `Recommended for this device: ${optionLabels[recommendedQuality]}` : `ค่าที่แนะนำสำหรับอุปกรณ์นี้: ${optionLabels[recommendedQuality]}`}{quality !== "auto" && <span className="text-slate-400"> · {en ? `currently using ${optionLabels[activeQuality]}` : `กำลังใช้ระดับ${optionLabels[activeQuality]}`}</span>}</span></div>
      <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label={en ? "Graphics quality" : "คุณภาพกราฟิก"}>
        {QUALITY_OPTIONS.map((option) => {
          const selected = quality === option;
          return <button key={option} type="button" role="radio" aria-checked={selected} onClick={() => setQuality(option)} className={`text-left rounded-2xl border p-4 transition-colors ${selected ? "border-violet-400 bg-violet-50 dark:border-violet-400/60 dark:bg-violet-500/10" : "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500/50"}`}>
            <span className="flex items-center justify-between gap-2"><span className="font-semibold text-slate-900 dark:text-white">{optionLabels[option]}{option === "auto" ? ` · ${en ? "Recommended" : "แนะนำ"}` : ""}</span>{selected && <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-300" />}</span>
            <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">{optionCopy[option]}</span>
          </button>;
        })}
      </div>
      <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Sparkles className="w-4 h-4" />{en ? `Active graphics level: ${optionLabels[activeQuality]}` : `ระดับกราฟิกที่ใช้อยู่: ${optionLabels[activeQuality]}`}</p>
    </section>

    <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8 space-y-5 shadow-sm">
      <div className="flex items-start gap-3"><ShieldCheck className="w-5 h-5 mt-1 text-violet-500 shrink-0"/><div><h2 className="font-semibold text-slate-900 dark:text-white">{en ? "Data sharing" : "การแบ่งปันข้อมูล"}</h2><p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mt-1">{en ? "Choose whether SafeSpace administrators may see your assessment risk scores and risk levels. Your answers and written responses are never included in this setting." : "เลือกว่าจะอนุญาตให้ผู้ดูแล SafeSpace เห็นคะแนนและระดับความเสี่ยงจากแบบประเมินหรือไม่ การตั้งค่านี้ไม่รวมคำตอบหรือข้อความที่คุณเขียน"}</p></div></div>
      {!isAuthenticated ? <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-4 text-sm text-slate-600 dark:text-slate-300">{en ? "Sign in to manage your data-sharing choice." : "เข้าสู่ระบบเพื่อจัดการการแบ่งปันข้อมูล"} <Link className="font-semibold text-violet-600 dark:text-violet-300 underline underline-offset-2" to="/login?returnTo=/settings">{en ? "Sign in" : "เข้าสู่ระบบ"}</Link></div> : <>
        <div className="h-px bg-slate-200 dark:bg-slate-700" />
        {loading ? <div className="flex justify-center py-5"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div> : <div className="flex items-center justify-between gap-4">
          <div><p className="font-semibold text-slate-900 dark:text-white">{en ? "Share my risk scores with admins" : "อนุญาตให้ผู้ดูแลดูคะแนนความเสี่ยง"}</p><p className="text-xs mt-1 text-slate-500">{sharing ? (en ? "Sharing is on" : "เปิดการแบ่งปันอยู่") : (en ? "Sharing is off" : "ปิดการแบ่งปันอยู่")}</p></div>
          <button type="button" role="switch" aria-checked={sharing} disabled={saving || loading} onClick={() => saveSharing(!sharing)} className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${sharing ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-600"}`}><span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${sharing ? "translate-x-7" : "translate-x-1"}`} /><span className="sr-only">{en ? "Toggle score sharing" : "เปิดหรือปิดการแบ่งปันคะแนน"}</span></button>
        </div>}
        {saving && <p className="text-sm text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{en ? "Saving…" : "กำลังบันทึก…"}</p>}
        {saved && <p role="status" className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{en ? "Your preference has been saved." : "บันทึกการตั้งค่าของคุณแล้ว"}</p>}
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      </>}
      <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400"><LockKeyhole className="w-4 h-4 shrink-0" />{en ? "You can change this choice at any time. Turning sharing off removes existing scores from the admin shared-scores view, but does not delete your personal assessment history. Results are screening information, not a medical diagnosis." : "คุณเปลี่ยนการตั้งค่านี้ได้ทุกเมื่อ เมื่อปิดการแบ่งปัน คะแนนเดิมจะไม่แสดงในหน้าคะแนนที่แบ่งปันของผู้ดูแล แต่จะไม่ลบประวัติแบบประเมินส่วนตัว ผลประเมินเป็นข้อมูลคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์"}</p>
    </section>
  </div>;
}

function SettingsIcon() {
  return <ShieldCheck className="w-6 h-6 text-violet-600 dark:text-violet-300" />;
}
