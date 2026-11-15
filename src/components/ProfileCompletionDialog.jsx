import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, CheckCircle2, Loader2, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { appClient } from "@/api/appClient";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";

const localDateString = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function ProfileCompletionDialog() {
  const { user, checkUserAuth } = useAuth();
  const { lang } = useTranslation();
  const en = lang === "en";
  const [username, setUsername] = useState(user?.username || "");
  const [birthDate, setBirthDate] = useState(user?.birth_date || "");
  const [shareRiskScore, setShareRiskScore] = useState(false);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const needsProfile = Boolean(user?.id && (!user.username || !user.birth_date));

  useEffect(() => {
    setUsername(user?.username || "");
    setBirthDate(user?.birth_date || "");
  }, [user?.id, user?.username, user?.birth_date]);

  useEffect(() => {
    setDismissed(false);
    setError("");
  }, [user?.id]);

  useEffect(() => {
    let active = true;
    async function loadPreference() {
      if (!user?.id) { setPreferenceLoaded(true); return; }
      setPreferenceLoaded(false);
      const { data } = await supabase.from("assessment_sharing_preferences")
        .select("share_risk_score").eq("user_id", user.id).maybeSingle();
      if (active) {
        setShareRiskScore(data?.share_risk_score === true);
        setPreferenceLoaded(true);
      }
    }
    loadPreference();
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    if (!needsProfile || dismissed) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !saving) setDismissed(true);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [needsProfile, dismissed, saving]);

  if (!needsProfile || dismissed) return null;
  const today = localDateString();

  const saveProfile = async (event) => {
    event.preventDefault();
    if (saving || !preferenceLoaded) return;
    const nextUsername = username.trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(nextUsername)) {
      setError(en ? "Use 3–20 letters, numbers, or underscores for your username." : "ชื่อผู้ใช้ต้องมี 3–20 ตัว และใช้ได้เฉพาะตัวอักษร ตัวเลข หรือ _");
      return;
    }
    if (!birthDate || birthDate > today) {
      setError(en ? "Choose your date of birth." : "กรุณาเลือกวันเดือนปีเกิด");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await appClient.auth.setMyAssessmentSharing(shareRiskScore);
      await appClient.auth.saveMyProfile({ username: nextUsername, birthDate });
      await checkUserAuth();
    } catch (saveError) {
      setError(saveError?.message || (en ? "Could not save your account details. Please try again." : "บันทึกข้อมูลบัญชีไม่สำเร็จ กรุณาลองอีกครั้ง"));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(<div className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto overscroll-contain bg-slate-950/65 p-4 backdrop-blur-md" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setDismissed(true); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="profile-welcome-title" aria-describedby="profile-welcome-description" className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-violet-200 bg-white shadow-2xl shadow-violet-950/30 dark:border-violet-400/20 dark:bg-slate-900">
      <div className="bg-gradient-to-br from-violet-100 via-indigo-50 to-sky-50 p-6 dark:from-violet-500/15 dark:via-indigo-500/10 dark:to-slate-900 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/90 text-violet-700 shadow-sm dark:bg-violet-400/15 dark:text-violet-200"><ShieldCheck className="h-6 w-6" /></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">SafeSpace · {en ? "A little more about you" : "ข้อมูลบัญชีของคุณ"}</p><h2 id="profile-welcome-title" className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{en ? "Welcome to SafeSpace" : "ยินดีต้อนรับสู่ SafeSpace"}</h2><p id="profile-welcome-description" className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{en ? "Add your account name and birthdate to finish setting up your profile." : "เพิ่มชื่อบัญชีและวันเกิดเพื่อจัดเตรียมโปรไฟล์ให้เรียบร้อย"}</p></div>
        </div>
      </div>
      <form onSubmit={saveProfile} className="space-y-5 p-6 sm:p-8">
        <label className="block space-y-2 text-sm font-medium text-slate-800 dark:text-slate-100"><span className="flex items-center gap-2"><UserRound className="h-4 w-4 text-violet-600 dark:text-violet-300" />{en ? "Username" : "ชื่อผู้ใช้"}</span><input value={username} onChange={(event) => setUsername(event.target.value)} maxLength={20} autoComplete="username" required className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-slate-600 dark:bg-slate-950 dark:text-white" /><span className="block text-xs font-normal text-slate-500">{en ? "3–20 letters, numbers, or underscores." : "3–20 ตัวอักษร ตัวเลข หรือ _"}</span></label>
        <label className="block space-y-2 text-sm font-medium text-slate-800 dark:text-slate-100"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-sky-600 dark:text-sky-300" />{en ? "Date of birth" : "วันเดือนปีเกิด"}</span><input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} max={today} required className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-slate-600 dark:bg-slate-950 dark:text-white" /><span className="flex items-start gap-1.5 text-xs font-normal leading-relaxed text-slate-500"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />{en ? "Your birthdate stays private to your account; administrators cannot see it." : "วันเกิดเป็นข้อมูลส่วนตัวของบัญชี ผู้ดูแลจะไม่เห็นข้อมูลนี้"}</span></label>

        <fieldset className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-400/20 dark:bg-violet-400/5"><legend className="px-1 text-sm font-semibold text-slate-900 dark:text-white">{en ? "Share assessment risk scores with admins?" : "อนุญาตให้ผู้ดูแลดูคะแนนความเสี่ยงจากแบบประเมินหรือไม่?"}</legend><p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{en ? "Only risk scores and levels are shared, never your answers or written responses." : "แบ่งปันเฉพาะคะแนนและระดับความเสี่ยง ไม่รวมคำตอบหรือข้อความที่เขียน"}</p><div className="grid grid-cols-2 gap-3"><button type="button" aria-pressed={shareRiskScore} onClick={() => setShareRiskScore(true)} className={`min-h-10 rounded-xl border px-3 text-sm font-semibold transition ${shareRiskScore ? "border-violet-600 bg-violet-700 text-white" : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"}`}>{en ? "Yes, share" : "ใช่ แบ่งปัน"}</button><button type="button" aria-pressed={!shareRiskScore} onClick={() => setShareRiskScore(false)} className={`min-h-10 rounded-xl border px-3 text-sm font-semibold transition ${!shareRiskScore ? "border-violet-600 bg-violet-700 text-white" : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"}`}>{en ? "No, keep private" : "ไม่ แยกเป็นส่วนตัว"}</button></div></fieldset>

        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end"><button type="button" disabled={saving} onClick={() => setDismissed(true)} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">{en ? "Not now" : "ภายหลัง"}</button><button type="submit" disabled={saving || !preferenceLoaded} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-800 disabled:cursor-wait disabled:opacity-60 dark:bg-violet-600 dark:hover:bg-violet-500">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{saving ? (en ? "Saving…" : "กำลังบันทึก…") : (en ? "Save and continue" : "บันทึกและดำเนินการต่อ")}</button></div>
      </form>
    </section>
  </div>, document.body);
}

