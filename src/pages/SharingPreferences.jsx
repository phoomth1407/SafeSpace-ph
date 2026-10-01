import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { CheckCircle2, LockKeyhole, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";

export default function SharingPreferences() {
  const { isAuthenticated, user } = useAuth();
  const { lang } = useTranslation();
  const en = lang === "en";
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?.id) { setLoading(false); return; }
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

  const save = async (next) => {
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
    } catch (e) {
      setError(en ? "Could not save this change. Please try again." : "บันทึกการตั้งค่าไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally { setSaving(false); }
  };

  if (!isAuthenticated) return <Navigate to="/login?returnTo=/sharing-preferences" replace />;
  return <div className="max-w-2xl mx-auto space-y-6">
    <header className="flex items-center gap-3 pt-2">
      <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-violet-600 dark:text-violet-300"/></div>
      <div><p className="text-xs uppercase tracking-wider text-violet-500 font-semibold">SafeSpace</p><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{en ? "Sharing Preferences" : "การตั้งค่าการแบ่งปันข้อมูล"}</h1></div>
    </header>
    <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8 space-y-5 shadow-sm">
      <div className="flex items-start gap-3"><LockKeyhole className="w-5 h-5 mt-1 text-slate-500 shrink-0"/><div><h2 className="font-semibold text-slate-900 dark:text-white">{en ? "Your assessment scores are private by default" : "คะแนนแบบประเมินของคุณจะเป็นส่วนตัวโดยค่าเริ่มต้น"}</h2><p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mt-2">{en ? "You can choose whether SafeSpace administrators may view your risk score and risk level to help monitor overall wellbeing trends. Your answers and written responses are not shared through this setting." : "คุณเลือกได้ว่าจะอนุญาตให้ผู้ดูแล SafeSpace ดูคะแนนความเสี่ยงและระดับความเสี่ยง เพื่อช่วยติดตามแนวโน้มสุขภาวะโดยรวมได้หรือไม่ การตั้งค่านี้จะไม่แบ่งปันคำตอบหรือข้อความที่คุณเขียน"}</p></div></div>
      <div className="h-px bg-slate-200 dark:bg-slate-700"/>
      {loading ? <div className="flex justify-center py-5"><Loader2 className="w-6 h-6 animate-spin text-violet-500"/></div> : <div className="flex items-center justify-between gap-4">
        <div><p className="font-semibold text-slate-900 dark:text-white">{en ? "Share my risk scores with admins" : "อนุญาตให้ผู้ดูแลดูคะแนนความเสี่ยง"}</p><p className="text-xs mt-1 text-slate-500">{sharing ? (en ? "Sharing is on" : "เปิดการแบ่งปันอยู่") : (en ? "Sharing is off" : "ปิดการแบ่งปันอยู่")}</p></div>
        <button type="button" role="switch" aria-checked={sharing} disabled={saving} onClick={() => save(!sharing)} className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${sharing ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-600"}`}><span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${sharing ? "translate-x-7" : "translate-x-1"}`}/><span className="sr-only">{en ? "Toggle score sharing" : "เปิดหรือปิดการแบ่งปันคะแนน"}</span></button>
      </div>}
      {saving && <p className="text-sm text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>{en ? "Saving…" : "กำลังบันทึก…"}</p>}
      {saved && <p role="status" className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/>{en ? "Your preference has been saved." : "บันทึกการตั้งค่าของคุณแล้ว"}</p>}
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
    </section>
    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{en ? "You can change this choice at any time. Turning sharing off removes your existing scores from the admin shared-scores view but does not delete your personal assessment history. Assessment results are screening information, not a medical diagnosis." : "คุณเปลี่ยนการตั้งค่านี้ได้ทุกเมื่อ เมื่อปิดการแบ่งปัน คะแนนเดิมของคุณจะไม่แสดงในหน้าคะแนนที่แบ่งปันของผู้ดูแล แต่จะไม่ถูกลบออกจากประวัติแบบประเมินส่วนตัว ผลประเมินเป็นข้อมูลคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์"}</p>
  </div>;
}
