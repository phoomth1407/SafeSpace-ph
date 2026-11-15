import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, LockKeyhole, Loader2, ShieldCheck, Sparkles, Gauge, MonitorSmartphone, Trash2 } from "lucide-react";
import { clearCachedPrivateAssessments } from "@/api/appClient";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { usePerformanceSettings } from "@/lib/performanceSettings";
import { DESKTOP_MODE_EVENT, isMobileDevice, readDesktopMode, saveDesktopMode } from "@/lib/desktopMode";

const QUALITY_OPTIONS = ["auto", "low", "balanced", "high", "ultra", "custom"];

export default function SharingPreferences() {
  const { isAuthenticated, user } = useAuth();
  const { lang } = useTranslation();
  const { quality, setQuality, activeQuality, recommendedQuality, recommendedAdvancedGraphics } = usePerformanceSettings();
  const navigate = useNavigate();
  const en = lang === "en";
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

    {showDeleteDialog && isAuthenticated && <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !deletingAccount) setShowDeleteDialog(false); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-account-title" aria-describedby="delete-account-description delete-account-caveat" className="my-auto w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-500/30 dark:bg-slate-900 sm:p-8">
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
    </div>}
  </div>;
}

function SettingsIcon() {
  return <ShieldCheck className="w-6 h-6 text-violet-600 dark:text-violet-300" />;
}
