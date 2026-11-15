import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, LockKeyhole, Loader2, ShieldCheck, Sparkles, Gauge, MonitorSmartphone, Trash2 } from "lucide-react";
import { clearCachedPrivateAssessments } from "@/api/appClient";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { usePerformanceSettings } from "@/lib/performanceSettings";
import { DESKTOP_MODE_EVENT, isMobileDevice, readDesktopMode, saveDesktopMode } from "@/lib/desktopMode";
import { appClient } from "@/api/appClient";

const QUALITY_OPTIONS = ["auto", "low", "balanced", "high", "ultra", "custom"];
const localDateString = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function SharingPreferences() {
  const { isAuthenticated, user, checkUserAuth } = useAuth();
  const { lang } = useTranslation();
  const { quality, setQuality, activeQuality, recommendedQuality, recommendedAdvancedGraphics } = usePerformanceSettings();
  const navigate = useNavigate();
  const en = lang === "en";
  const todayString = localDateString();
  const [desktopMode, setDesktopMode] = useState(readDesktopMode);
  const [mobileDevice] = useState(isMobileDevice);
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [username, setUsername] = useState(user?.username || "");
  const [birthDate, setBirthDate] = useState(user?.birth_date || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileConfirm, setProfileConfirm] = useState(null);
  const [setupShareChoice, setSetupShareChoice] = useState(null);

  useEffect(() => {
    setUsername(user?.username || "");
    setBirthDate(user?.birth_date || "");
  }, [user?.username, user?.birth_date]);

  useEffect(() => {
    const syncDesktopMode = (event) => setDesktopMode(Boolean(event.detail?.enabled));
    const syncStoredPreference = (event) => {
      if (event.key === "safespace_mobile_desktop_mode_v1") setDesktopMode(event.newValue === "true");
    };
    window.addEventListener(DESKTOP_MODE_EVENT, syncDesktopMode);
    window.addEventListener("storage", syncStoredPreference);
    return () => {
      window.removeEventListener(DESKTOP_MODE_EVENT, syncDesktopMode);
      window.removeEventListener("storage", syncStoredPreference);
    };
  }, []);

  useEffect(() => {
    if (!showDeleteDialog) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !deletingAccount) setShowDeleteDialog(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showDeleteDialog, deletingAccount]);

  useEffect(() => {
    if (!profileConfirm) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !savingProfile) setProfileConfirm(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [profileConfirm, savingProfile]);

  useEffect(() => {
    if (!showDeleteDialog && !profileConfirm) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [showDeleteDialog, profileConfirm]);

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
      await appClient.auth.setMyAssessmentSharing(next);
      setSharing(next); setSaved(true);
    } catch {
      setError(en ? "Could not save this change. Please try again." : "บันทึกการตั้งค่าไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally { setSaving(false); }
  };

  const persistProfile = async () => {
    if (!user?.id || savingProfile) return;
    const nextUsername = username.trim();
    setProfileConfirm(null);
    setSavingProfile(true); setProfileError(""); setProfileSaved(false);
    try {
      if (!user.birth_date) {
        await appClient.auth.setMyAssessmentSharing(setupShareChoice);
        setSharing(setupShareChoice);
      }
      await appClient.auth.saveMyProfile({ username: nextUsername, birthDate });
      await checkUserAuth();
      setProfileSaved(true);
    } catch (err) {
      const message = err?.message || "";
      if (message.includes("already taken") || err?.code === "23505") setProfileError(en ? "That username is already in use. Choose another one." : "มีผู้ใช้ชื่อนี้แล้ว กรุณาเลือกชื่ออื่น");
      else setProfileError(message || (en ? "Could not save your profile." : "บันทึกโปรไฟล์ไม่สำเร็จ"));
    } finally { setSavingProfile(false); }
  };

  const saveProfile = async () => {
    if (!user?.id || savingProfile) return;
    const nextUsername = username.trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(nextUsername)) {
      setProfileError(en ? "Use 3–20 letters, numbers, or underscores for your username." : "ชื่อผู้ใช้ต้องมี 3–20 ตัว และใช้ได้เฉพาะตัวอักษร ตัวเลข หรือ _");
      return;
    }
    if (!birthDate || birthDate > todayString) {
      setProfileError(en ? "Choose a valid birthdate." : "กรุณาเลือกวันเกิดที่ถูกต้อง");
      return;
    }
    if (!user.birth_date && typeof setupShareChoice !== "boolean") {
      setProfileError(en ? "Choose Yes or No for sharing assessment risk scores." : "กรุณาเลือกว่าจะอนุญาตให้แบ่งปันคะแนนความเสี่ยงหรือไม่");
      return;
    }
    const usernameChanged = !!user.username && nextUsername !== user.username;
    const birthDateChanged = !!user.birth_date && birthDate !== user.birth_date;
    if (usernameChanged || birthDateChanged) {
      setProfileConfirm({ usernameChanged, birthDateChanged });
      return;
    }
    await persistProfile();
  };

  const deletePhrase = en ? "DELETE" : "ลบข้อมูล";
  const deleteAccount = async () => {
    if (!user?.id || deletingAccount || deleteConfirmation.trim() !== deletePhrase) return;
    setDeletingAccount(true);
    setDeleteError("");
    try {
      const { data: ownedAssessments } = await supabase.from("assessments")
        .select("id")
        .eq("created_by_id", user.id);
      const { error: deletionError } = await supabase.functions.invoke("delete-account", { method: "POST" });
      if (deletionError) throw deletionError;

      clearCachedPrivateAssessments((ownedAssessments || []).map((item) => item.id), user.id);
      try { window.localStorage.removeItem(`safespace_assessment_policy_accepted:${user.id}`); } catch {}
      try { await supabase.auth.signOut({ scope: "local" }); } catch {}
      setShowDeleteDialog(false);
      navigate("/", { replace: true });
    } catch {
      setDeleteError(en
        ? "We couldn't finish deleting the account. Some records may already be removed; please sign in and try again or contact support."
        : "ลบบัญชีไม่สำเร็จ ข้อมูลบางส่วนอาจถูกลบไปแล้ว กรุณาเข้าสู่ระบบแล้วลองอีกครั้ง หรือติดต่อฝ่ายช่วยเหลือ");
    } finally {
      setDeletingAccount(false);
    }
  };

  const optionLabels = {
    auto: en ? "Auto" : "อัตโนมัติ",
    low: en ? "Low" : "ต่ำ",
    balanced: en ? "Balanced" : "สมดุล",
    high: en ? "High" : "สูง",
    ultra: en ? "Ultra" : "อัลตรา",
    custom: en ? "Advanced" : "ขั้นสูง",
  };
  const optionCopy = {
    auto: en ? "Automatically tunes canvas resolution, particle count, and motion for this device." : "ปรับความละเอียดแคนวาส จำนวนอนุภาค และการเคลื่อนไหวให้เหมาะกับอุปกรณ์นี้โดยอัตโนมัติ",
    low: en ? "Keep the page lightweight and turn off most decorative motion and heavy visual effects." : "ลดการเคลื่อนไหวและเอฟเฟกต์ตกแต่งส่วนใหญ่ เพื่อให้หน้าเว็บเบาและตอบสนองไว",
    balanced: en ? "Keep the core atmosphere with fewer continuous effects." : "คงบรรยากาศหลักไว้ พร้อมลดเอฟเฟกต์ที่ทำงานต่อเนื่อง",
    high: en ? "Keep the full visual atmosphere, motion, and layered effects." : "คงบรรยากาศ การเคลื่อนไหว และเอฟเฟกต์เต็มรูปแบบ",
    ultra: en ? "For high-end phones and PCs: richer ambient color, stronger glass depth, glow, and more fluid motion." : "สำหรับมือถือและคอมพิวเตอร์ประสิทธิภาพสูง เพิ่มสีสัน มิติของกระจก แสงเรือง และการเคลื่อนไหวที่ลื่นไหลยิ่งขึ้น",
    custom: en ? "Fine-tune particle physics, animation, glow, and canvas resolution." : "ปรับฟิสิกส์อนุภาค แอนิเมชัน แสงเรือง และความละเอียดแคนวาสได้เอง",
  };

  return <div className="max-w-3xl mx-auto space-y-6">
    <header className="flex items-center gap-3 pt-2">
      <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center"><SettingsIcon /></div>
      <div><p className="text-xs uppercase tracking-wider text-violet-500 font-semibold">SafeSpace</p><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{en ? "Settings" : "ตั้งค่า"}</h1></div>
    </header>

    {profileConfirm && createPortal(<div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto overscroll-contain bg-slate-950/55 p-4 backdrop-blur-md" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingProfile) setProfileConfirm(null); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="profile-confirm-title" aria-describedby="profile-confirm-description" className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-violet-200 bg-white shadow-2xl shadow-violet-950/20 dark:border-violet-400/20 dark:bg-slate-900">
        <div className="bg-gradient-to-br from-violet-100 via-indigo-50 to-sky-50 p-6 dark:from-violet-500/15 dark:via-indigo-500/10 dark:to-slate-900 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/90 text-violet-700 shadow-sm dark:bg-violet-400/15 dark:text-violet-200"><ShieldCheck className="h-6 w-6" /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">SafeSpace · {en ? "Account security" : "ความปลอดภัยบัญชี"}</p><h2 id="profile-confirm-title" className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{en ? "Confirm account changes" : "ยืนยันการเปลี่ยนแปลงบัญชี"}</h2><p id="profile-confirm-description" className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{en ? "Please review what will change before saving your profile." : "โปรดตรวจสอบข้อมูลที่จะเปลี่ยนก่อนบันทึกโปรไฟล์"}</p></div>
          </div>
        </div>
        <div className="space-y-3 p-6 sm:p-7">
          {profileConfirm.usernameChanged && <div className="rounded-2xl border border-violet-100 bg-violet-50/80 p-4 dark:border-violet-400/15 dark:bg-violet-400/5"><p className="text-sm font-semibold text-slate-900 dark:text-white">{en ? "Username" : "ชื่อผู้ใช้"} · <span className="text-violet-700 dark:text-violet-300">{username.trim()}</span></p><p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{en ? "Your new username will replace your name on your named Community posts and comments. Anonymous posts stay anonymous." : "ชื่อใหม่นี้จะแทนชื่อเดิมในโพสต์และความคิดเห็นที่ระบุตัวตน ส่วนโพสต์นิรนามจะยังคงนิรนาม"}</p></div>}
          {profileConfirm.birthDateChanged && <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 dark:border-sky-400/15 dark:bg-sky-400/5"><p className="text-sm font-semibold text-slate-900 dark:text-white">{en ? "Date of birth" : "วันเดือนปีเกิด"} · <span className="text-sky-700 dark:text-sky-300">{en ? "Private to your account" : "เป็นข้อมูลส่วนตัวของคุณ"}</span></p><p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{en ? "Age-based features and previous assessment history may no longer match. You can change your birthdate once every 365 days." : "ฟีเจอร์ที่อิงอายุและประวัติแบบประเมินเดิมอาจไม่ตรงกัน และคุณเปลี่ยนวันเกิดได้ทุก 365 วัน"}</p></div>}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" disabled={savingProfile} onClick={() => setProfileConfirm(null)} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">{en ? "Go back" : "กลับไปแก้ไข"}</button>
            <button type="button" disabled={savingProfile} onClick={persistProfile} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-800 disabled:opacity-60 dark:bg-violet-600 dark:hover:bg-violet-500">{savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{savingProfile ? (en ? "Saving…" : "กำลังบันทึก…") : (en ? "Confirm changes" : "ยืนยันการเปลี่ยนแปลง")}</button>
          </div>
        </div>
      </section>
    </div>, document.body)}

    <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8 space-y-5 shadow-sm">
      <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 dark:bg-violet-500/15"><ShieldCheck className="h-5 w-5 text-violet-600 dark:text-violet-300" /></div><div><h2 className="font-semibold text-slate-900 dark:text-white">{en ? "Account identity" : "ข้อมูลบัญชี"}</h2><p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{en ? "Your username is the fixed name used on Community posts and comments unless you choose to stay anonymous. Your birthdate is saved to your account so sign-in will not ask for it again." : "ชื่อผู้ใช้นี้จะแสดงในโพสต์และความคิดเห็น เว้นแต่คุณเลือกไม่ระบุตัวตน วันเกิดจะบันทึกไว้กับบัญชีเพื่อไม่ต้องกรอกซ้ำเมื่อลงชื่อเข้าใช้"}</p></div></div>
      {!isAuthenticated ? <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">{en ? "Sign in to manage your account identity." : "เข้าสู่ระบบเพื่อจัดการข้อมูลบัญชี"} <Link className="font-semibold text-violet-600 underline dark:text-violet-300" to="/login?returnTo=/settings">{en ? "Sign in" : "เข้าสู่ระบบ"}</Link></div> : <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-800 dark:text-slate-100">{en ? "Username" : "ชื่อผู้ใช้"}<input value={username} onChange={(event) => setUsername(event.target.value)} maxLength={20} autoComplete="username" className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-slate-600 dark:bg-slate-950 dark:text-white" /><span className="block text-xs font-normal text-slate-500">{user?.username_changed_at ? (en ? "Change limit: once every 30 days." : "เปลี่ยนได้ทุก 30 วัน") : (en ? "3–20 letters, numbers, or underscores." : "3–20 ตัวอักษร ตัวเลข หรือ _")}</span></label>
        <label className="space-y-2 text-sm font-medium text-slate-800 dark:text-slate-100">{en ? "Date of birth" : "วันเดือนปีเกิด"}<input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} max={todayString} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-slate-600 dark:bg-slate-950 dark:text-white" /><span className="block text-xs font-normal text-slate-500">{user?.birth_date_changed_at ? (en ? "Private · change limit: once every 365 days." : "ข้อมูลส่วนตัว · เปลี่ยนได้ทุก 365 วัน") : (en ? "Private to your account; administrators cannot see it." : "เก็บเป็นข้อมูลส่วนตัว ผู้ดูแลจะไม่เห็นข้อมูลนี้")}</span></label>
      </div>}
      {isAuthenticated && !user?.birth_date && <div className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 dark:border-violet-400/20 dark:bg-violet-400/5"><div><p className="text-sm font-semibold text-slate-900 dark:text-white">{en ? "Share assessment risk scores with admins?" : "อนุญาตให้ผู้ดูแลดูคะแนนความเสี่ยงจากแบบประเมินหรือไม่?"}</p><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{en ? "Only scores and risk levels are shared, never your answers or written responses. You can change this in Settings later." : "แบ่งปันเฉพาะคะแนนและระดับความเสี่ยง ไม่รวมคำตอบหรือข้อความที่เขียน และเปลี่ยนได้ภายหลังในตั้งค่า"}</p></div><div className="grid grid-cols-2 gap-3"><button type="button" aria-pressed={setupShareChoice === true} onClick={() => setSetupShareChoice(true)} className={`min-h-10 rounded-xl border px-3 text-sm font-medium ${setupShareChoice === true ? "border-violet-500 bg-violet-700 text-white" : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"}`}>{en ? "Yes, share" : "ใช่ แบ่งปัน"}</button><button type="button" aria-pressed={setupShareChoice === false} onClick={() => setSetupShareChoice(false)} className={`min-h-10 rounded-xl border px-3 text-sm font-medium ${setupShareChoice === false ? "border-violet-500 bg-violet-700 text-white" : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"}`}>{en ? "No, keep private" : "ไม่ แยกเป็นส่วนตัว"}</button></div></div>}
      {isAuthenticated && <><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={saveProfile} disabled={savingProfile || (!username.trim() || !birthDate)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50">{savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}{en ? "Save account details" : "บันทึกข้อมูลบัญชี"}</button>{profileSaved && <span role="status" className="text-sm text-emerald-600">{en ? "Saved." : "บันทึกแล้ว"}</span>}</div>{profileError && <p role="alert" className="text-sm text-rose-600">{profileError}</p>}</>}
      <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400"><LockKeyhole className="h-4 w-4 shrink-0" />{en ? "Username changes are limited to once every 30 days. Birthdate changes are limited to once every 365 days and can affect age-based features and assessment history." : "จำกัดการเปลี่ยนชื่อผู้ใช้ทุก 30 วัน และวันเกิดทุก 365 วัน การเปลี่ยนวันเกิดอาจกระทบฟีเจอร์และประวัติแบบประเมินที่อิงอายุ"}</p>
    </section>

    <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8 space-y-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/15 grid place-items-center shrink-0"><Gauge className="w-5 h-5 text-sky-600 dark:text-sky-300" /></div>
        <div><h2 className="font-semibold text-slate-900 dark:text-white">{en ? "Graphics & performance" : "กราฟิกและประสิทธิภาพ"}</h2><p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mt-1">{en ? "SafeSpace checks available browser device hints and motion preferences to suggest a starting level. Your choice stays on this device." : "SafeSpace ใช้ข้อมูลอุปกรณ์ที่เบราว์เซอร์เปิดเผยและการตั้งค่าการเคลื่อนไหว เพื่อแนะนำระดับเริ่มต้น การเลือกของคุณจะบันทึกไว้ในอุปกรณ์นี้"}</p></div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 px-4 py-3 text-sm text-slate-600 dark:text-slate-300"><MonitorSmartphone className="w-5 h-5 shrink-0 text-slate-500" /><span>{en ? `Auto recommendation: ${optionLabels[recommendedQuality]} · ${recommendedAdvancedGraphics.particleCount} particles · ${recommendedAdvancedGraphics.canvasScale.toFixed(2)}× canvas` : `ค่าแนะนำอัตโนมัติ: ${optionLabels[recommendedQuality]} · ${recommendedAdvancedGraphics.particleCount} อนุภาค · แคนวาส ${recommendedAdvancedGraphics.canvasScale.toFixed(2)}×`}{quality !== "auto" && <span className="text-slate-400"> · {en ? `currently using ${optionLabels[quality]}` : `กำลังใช้ระดับ${optionLabels[quality]}`}</span>}</span></div>
      <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label={en ? "Graphics quality" : "คุณภาพกราฟิก"}>
        {QUALITY_OPTIONS.map((option) => {
          const selected = quality === option;
          return <button key={option} type="button" role="radio" aria-checked={selected} onClick={() => { if (option === "custom") { setQuality("custom"); navigate("/settings/graphics"); } else setQuality(option); }} className={`text-left rounded-2xl border p-4 transition-colors ${selected ? "border-violet-400 bg-violet-50 dark:border-violet-400/60 dark:bg-violet-500/10" : "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500/50"}`}>
            <span className="flex items-center justify-between gap-2"><span className="font-semibold text-slate-900 dark:text-white">{optionLabels[option]}{option === "auto" ? ` · ${en ? "Recommended" : "แนะนำ"}` : ""}</span>{selected && <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-300" />}</span>
            <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">{optionCopy[option]}</span>
          </button>;
        })}
      </div>
      <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><Sparkles className="w-4 h-4" />{en ? `Active rendering base: ${optionLabels[activeQuality]}` : `พื้นฐานการเรนเดอร์ที่ใช้อยู่: ${optionLabels[activeQuality]}`}</p>
    </section>

    {mobileDevice && <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 md:p-8" aria-labelledby="desktop-mode-title">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-100 dark:bg-indigo-400/15"><MonitorSmartphone className="h-5 w-5 text-indigo-600 dark:text-indigo-300" /></div>
          <div>
            <h2 id="desktop-mode-title" className="font-semibold text-slate-900 dark:text-white">{en ? "Desktop mode" : "โหมดเดสก์ท็อป"}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{en ? "Use the wider PC layout on this phone. You can pinch to zoom when needed." : "ใช้รูปแบบหน้าเว็บแบบคอมพิวเตอร์บนโทรศัพท์ และซูมเข้าออกได้ตามต้องการ"}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{desktopMode ? (en ? "On · the page may appear smaller until you zoom in." : "เปิดอยู่ · หน้าเว็บอาจดูเล็กลงจนกว่าจะซูมเข้า") : (en ? "Off by default. Your choice is saved on this device." : "ปิดไว้ตามค่าเริ่มต้น และบันทึกตัวเลือกนี้ในอุปกรณ์นี้")}</p>
          </div>
        </div>
        <button type="button" role="switch" aria-checked={desktopMode} aria-label={en ? "Use desktop mode on this phone" : "ใช้โหมดเดสก์ท็อปบนโทรศัพท์นี้"} onClick={() => { const next = !desktopMode; setDesktopMode(next); saveDesktopMode(next); }} className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ${desktopMode ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}>
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${desktopMode ? "translate-x-7" : "translate-x-1"}`} />
        </button>
      </div>
    </section>}

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

    <section className="rounded-3xl border border-rose-200 dark:border-rose-500/30 bg-white/90 dark:bg-slate-900/80 p-6 md:p-8 space-y-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 dark:bg-rose-500/15"><Trash2 className="h-5 w-5 text-rose-700 dark:text-rose-300" /></div>
        <div><h2 className="font-semibold text-slate-900 dark:text-white">{en ? "Delete your account and data" : "ลบบัญชีและข้อมูลของคุณ"}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{en ? "Permanently remove your SafeSpace account and the records linked to it. You will be signed out." : "ลบบัญชี SafeSpace และข้อมูลที่เชื่อมโยงกับบัญชีอย่างถาวร แล้วออกจากระบบ"}</p>
        </div>
      </div>
      {!isAuthenticated ? <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-4 text-sm text-slate-600 dark:text-slate-300">{en ? "Sign in to delete your account data." : "เข้าสู่ระบบเพื่อลบข้อมูลบัญชีของคุณ"} <Link className="font-semibold text-violet-600 dark:text-violet-300 underline underline-offset-2" to="/login?returnTo=/settings">{en ? "Sign in" : "เข้าสู่ระบบ"}</Link></div> : <button type="button" onClick={() => { setDeleteConfirmation(""); setDeleteError(""); setShowDeleteDialog(true); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20"> <Trash2 className="h-4 w-4" />{en ? "Delete account and data" : "ลบบัญชีและข้อมูล"}</button>}
    </section>

    {showDeleteDialog && isAuthenticated && createPortal(<div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto overscroll-contain bg-slate-950/65 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !deletingAccount) setShowDeleteDialog(false); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-account-title" aria-describedby="delete-account-description delete-account-caveat" className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-500/30 dark:bg-slate-900 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-100 dark:bg-rose-500/15"><AlertTriangle className="h-5 w-5 text-rose-700 dark:text-rose-300" /></div>
          <div><h2 id="delete-account-title" className="text-xl font-bold text-slate-950 dark:text-white">{en ? "Permanently delete this account?" : "ยืนยันลบบัญชีนี้อย่างถาวรหรือไม่?"}</h2>
            <p id="delete-account-description" className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{en ? "This deletes your sign-in and account profile, assessment history, saved mood check-ins, sharing and policy preferences, your community posts and comments, reports/contact requests you submitted or that concern your account, and your reactions on other posts." : "ระบบจะลบการเข้าสู่ระบบและโปรไฟล์ ประวัติแบบประเมิน การเช็กอินอารมณ์ การตั้งค่าการแบ่งปันและการยอมรับนโยบาย โพสต์และความคิดเห็นของคุณ รายงาน/คำขอติดต่อที่คุณส่งหรือเกี่ยวข้องกับบัญชี และการกดตอบสนองของคุณในโพสต์อื่น"}</p>
          </div>
        </div>
        <div id="delete-account-caveat" className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">{en ? "This cannot be undone. Guest data and device-only settings or imported sounds are not account records and are not deleted. This cannot immediately erase provider security logs, backups, or data already processed by external AI services." : "ไม่สามารถกู้คืนบัญชีได้ ข้อมูลผู้เยี่ยมชม การตั้งค่าที่เก็บไว้ในอุปกรณ์ และเสียงที่นำเข้าไม่ใช่ข้อมูลบัญชี จึงไม่ถูกลบ และไม่สามารถลบ log ความปลอดภัย backup หรือข้อมูลที่ผู้ให้บริการ AI ภายนอกประมวลผลแล้วได้ทันที"}</div>
        <label htmlFor="delete-account-confirmation" className="mt-5 block text-sm font-medium text-slate-800 dark:text-slate-100">{en ? `Type ${deletePhrase} to confirm` : `พิมพ์ ${deletePhrase} เพื่อยืนยัน`}</label>
        <input id="delete-account-confirmation" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} autoComplete="off" disabled={deletingAccount} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:focus:ring-rose-500/20" />
        {deleteError && <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">{deleteError}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" disabled={deletingAccount} onClick={() => setShowDeleteDialog(false)} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">{en ? "Cancel" : "ยกเลิก"}</button>
          <button type="button" disabled={deletingAccount || deleteConfirmation.trim() !== deletePhrase} onClick={deleteAccount} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-600 dark:hover:bg-rose-500">{deletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}{deletingAccount ? (en ? "Deleting…" : "กำลังลบ…") : (en ? "Permanently delete" : "ลบอย่างถาวร")}</button>
        </div>
      </section>
    </div>, document.body)}
  </div>;
}

function SettingsIcon() {
  return <ShieldCheck className="w-6 h-6 text-violet-600 dark:text-violet-300" />;
}

