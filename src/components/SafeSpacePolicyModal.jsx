import React, { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import {
  SAFESPACE_POLICY_EN,
  SAFESPACE_POLICY_TH,
  SAFESPACE_POLICY_VERSION,
  SAFESPACE_POLICY_LAST_UPDATED_EN,
  SAFESPACE_POLICY_LAST_UPDATED_TH,
} from "@/lib/safespacePolicy";

export const SAFESPACE_POLICY_STORAGE_KEY = "safespace_policy_acknowledged_version";

export function hasAcceptedSafeSpacePolicy() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAFESPACE_POLICY_STORAGE_KEY) || "null");
    return saved?.accepted === true && saved?.version === SAFESPACE_POLICY_VERSION;
  } catch {
    return false;
  }
}

export function acknowledgeSafeSpacePolicy() {
  try {
    window.localStorage.setItem(SAFESPACE_POLICY_STORAGE_KEY, JSON.stringify({
      accepted: true,
      version: SAFESPACE_POLICY_VERSION,
      acceptedAt: new Date().toISOString(),
    }));
  } catch {}
}

const PopupText = ({ lang }) => (
  <div className="space-y-4">
    <p>{lang === "en"
      ? <>SafeSpace is a youth wellbeing and awareness web app created as an independent school project. It is <strong>not a hospital, clinic, therapist, doctor, emergency service, or replacement for professional care</strong>. The school is not the owner or operator of SafeSpace.</>
      : <>SafeSpace เป็นเว็บแอปด้านสุขภาวะและการตระหนักรู้สำหรับเยาวชน พัฒนาเป็นโครงการอิสระที่เริ่มจากงานโรงเรียน <strong>ไม่ใช่โรงพยาบาล คลินิก นักบำบัด แพทย์ บริการฉุกเฉิน หรือสิ่งทดแทนการดูแลจากผู้เชี่ยวชาญ</strong> และโรงเรียนไม่ได้เป็นเจ้าของหรือผู้ดำเนินการ SafeSpace</>}</p>
    <p>{lang === "en" ? "When you use an account, SafeSpace may process account data, wellbeing/assessment data, Community data, and technical/security data needed to operate the service." : "เมื่อใช้บัญชี SafeSpace อาจประมวลผลข้อมูลบัญชี ข้อมูลสุขภาวะ/แบบประเมิน ข้อมูลชุมชน และข้อมูลทางเทคนิค/ความปลอดภัยที่จำเป็นต่อการให้บริการ"}</p>
    <p>{lang === "en"
      ? "Assessment and wellbeing information may be processed by OpenAI or Google Gemini. Supabase provides backend services and GitHub Pages hosts the frontend. These providers may process information outside Thailand. SafeSpace relies on their standard contractual safeguards but does not claim third-party processing is risk-free."
      : "ข้อมูลแบบประเมินและสุขภาวะอาจถูกประมวลผลโดย OpenAI หรือ Google Gemini ส่วน Supabase ให้บริการ backend และ GitHub Pages ให้บริการโฮสต์ frontend ผู้ให้บริการเหล่านี้อาจประมวลผลข้อมูลนอกประเทศไทย โดย SafeSpace อาศัยมาตรการคุ้มครองตามสัญญามาตรฐาน แต่ไม่รับรองว่าการประมวลผลโดยผู้ให้บริการภายนอกไม่มีความเสี่ยง"}</p>
    <p>{lang === "en"
      ? <>Privacy contact: <strong>safespacect@gmail.com</strong>. Rights may include access, copying/portability, correction, deletion, objection, restriction, and withdrawal of consent, subject to applicable law.</>
      : <>ติดต่อเรื่องความเป็นส่วนตัว: <strong>safespacect@gmail.com</strong> สิทธิอาจรวมถึงการเข้าถึง ขอสำเนา/โอนย้าย แก้ไข ลบ คัดค้าน จำกัดการประมวลผล และถอนความยินยอม ภายใต้กฎหมายที่เกี่ยวข้อง</>}</p>
    <p>{lang === "en" ? <>Legal basis: account data — <strong>contractual necessity</strong>; wellbeing/assessment — <strong>explicit consent</strong>; Community content — <strong>legitimate interest for technical and security processing</strong>; technical/security — <strong>legitimate interest for technical and security processing</strong>.</> : <>ฐานทางกฎหมาย: ข้อมูลบัญชี — <strong>ความจำเป็นตามสัญญา</strong>; สุขภาวะ/แบบประเมิน — <strong>ความยินยอมโดยชัดแจ้ง</strong>; เนื้อหาชุมชน — <strong>[TO CONFIRM — ฐานทางกฎหมาย]</strong>; เทคนิค/ความปลอดภัย — <strong>[TO CONFIRM — ฐานทางกฎหมาย]</strong></>}</p>
    <p>{lang === "en" ? "Privacy contact: safespacect@gmail.com." : "ติดต่อเรื่องความเป็นส่วนตัว: safespacect@gmail.com"}</p>
    <p>{lang === "en" ? <>You have the right to complain to the Thai Personal Data Protection Committee (PDPC) at <strong>pdpc.or.th</strong> if you believe your personal data has been mishandled.</> : <>คุณมีสิทธิร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (PDPC) ที่ <strong>pdpc.or.th</strong> หากเชื่อว่าข้อมูลส่วนบุคคลของคุณถูกจัดการอย่างไม่เหมาะสม</>}</p>
    <div>
      <p className="font-semibold text-slate-200">{lang === "en" ? "Emergency support in Thailand" : "ช่องทางฉุกเฉินในประเทศไทย"}</p>
      <p>1669 — {lang === "en" ? "medical emergency" : "เหตุฉุกเฉินทางการแพทย์"}</p>
      <p>1323 — {lang === "en" ? "Department of Mental Health hotline" : "สายด่วนสุขภาพจิต กรมสุขภาพจิต"}</p>
      <p>1300 — {lang === "en" ? "MSDHS social assistance line, including children and young people" : "สายด่วนช่วยเหลือสังคม พม. รวมถึงเด็กและเยาวชน"}</p>
    </div>
    <p>{lang === "en" ? "Cookies: [TO CONFIRM] whether SafeSpace uses cookies or analytics beyond what is strictly necessary for authentication." : "การตั้งค่าหน้าเว็บปัจจุบันให้ Supabase Auth บันทึก session ใน browser localStorage และไม่ได้ตั้งค่า analytics โดยเจตนา SafeSpace ไม่ได้ตั้งใจสร้าง first-party cookies แต่ Google sign-in หรือโครงสร้าง hosting อาจใช้คุกกี้ที่ผู้ให้บริการควบคุม ควรตรวจสอบพฤติกรรมบนเว็บไซต์ที่เผยแพร่จริงก่อนถือเป็นคำยืนยันถาวร"}</p>
  </div>
);

export default function SafeSpacePolicyModal({ open, onAccept, onClose, persistAcknowledgement = false, requiresAcceptance = false }) {
  const { lang } = useTranslation();
  const [checks, setChecks] = useState({ age:false, policy:false, sensitive:false });
  const [fullOpen, setFullOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setChecks({ age:false, policy:false, sensitive:false });
      setFullOpen(false);
    }
  }, [open]);

  if (!open) return null;
  const ready = !requiresAcceptance || (checks.age && checks.policy && checks.sensitive);
  const full = lang === "en" ? SAFESPACE_POLICY_EN : SAFESPACE_POLICY_TH;

  const accept = () => {
    if (!ready) return;
    if (persistAcknowledgement) acknowledgeSafeSpacePolicy();
    onAccept?.();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-[24px]" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950 shadow-2xl flex flex-col">
        {!fullOpen ? (
          <>
            <div className="px-5 sm:px-7 py-5 border-b border-slate-800">
              <div className="text-[10px] uppercase tracking-[0.18em] text-sky-300 mb-1">SafeSpace</div>
              <h2 className="text-xl font-bold text-slate-100">{lang === "en" ? "Before you continue" : "ก่อนดำเนินการต่อ"}</h2>
            </div>
            <div className="overflow-y-auto px-5 sm:px-7 py-5 text-sm leading-7 text-slate-300">
              <PopupText lang={lang} />
              {requiresAcceptance && <>
                <label className="flex items-start gap-3 mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 cursor-pointer">
                  <input type="checkbox" checked={checks.age} onChange={e=>setChecks(v=>({...v,age:e.target.checked}))} className="mt-1 h-4 w-4 shrink-0 accent-sky-500" />
                  <span className="text-xs leading-5">{lang === "en" ? "I am at least 13 years old, or I have the required parent/guardian consent." : "ฉันมีอายุอย่างน้อย 13 ปี หรือได้รับความยินยอมจากผู้ปกครองตามที่กำหนด"}</span>
                </label>
                <label className="flex items-start gap-3 mt-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 cursor-pointer">
                  <input type="checkbox" checked={checks.policy} onChange={e=>setChecks(v=>({...v,policy:e.target.checked}))} className="mt-1 h-4 w-4 shrink-0 accent-sky-500" />
                  <span className="text-xs leading-5">{lang === "en" ? "I have read and agree to the SafeSpace Policy." : "ฉันได้อ่านและยอมรับ SafeSpace Policy"}</span>
                </label>
                <label className="flex items-start gap-3 mt-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 cursor-pointer">
                  <input type="checkbox" checked={checks.sensitive} onChange={e=>setChecks(v=>({...v,sensitive:e.target.checked}))} className="mt-1 h-4 w-4 shrink-0 accent-sky-500" />
                  <span className="text-xs leading-5 font-medium">{lang === "en" ? "I explicitly consent to SafeSpace processing my wellbeing/assessment data for the wellbeing features I choose to use." : "ฉันให้ความยินยอมโดยชัดแจ้งให้ SafeSpace ประมวลผลข้อมูลสุขภาวะ/แบบประเมินเพื่อให้บริการฟีเจอร์ด้านสุขภาวะที่ฉันเลือกใช้"}</span>
                </label>
              </>}
            </div>
            <div className="px-5 sm:px-7 py-4 border-t border-slate-800 bg-slate-950/95 space-y-3">
              <button type="button" onClick={()=>setFullOpen(true)} className="text-sm text-sky-300 hover:text-sky-200 underline underline-offset-4">{lang === "en" ? "Read the full SafeSpace Policy" : "อ่าน SafeSpace Policy ฉบับเต็ม"}</button>
              <div className="flex gap-2">
                {onClose && <button type="button" onClick={onClose} className="flex-1 px-5 py-3 rounded-2xl border border-slate-600 text-slate-200 text-sm font-semibold hover:bg-slate-900">{lang === "en" ? "Decline" : "ปฏิเสธ"}</button>}
                <button type="button" disabled={!ready} onClick={accept} className="flex-1 px-5 py-3 rounded-2xl bg-slate-100 text-slate-900 text-sm font-semibold hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">{requiresAcceptance ? (lang === "en" ? "Agree and Continue" : "ยอมรับและดำเนินการต่อ") : (lang === "en" ? "Close" : "ปิด")}</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="px-5 sm:px-7 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">{lang === "en" ? "SafeSpace Policy" : "นโยบาย SafeSpace"}</h2>
              <button type="button" onClick={()=>setFullOpen(false)} className="text-sm text-slate-300 px-3 py-2 rounded-xl border border-slate-700">{lang === "en" ? "Back" : "กลับ"}</button>
            </div>
            <div className="overflow-y-auto px-5 sm:px-7 py-5 space-y-5 text-sm leading-7 text-slate-300">
              {full.map(([heading, body]) => <section key={heading}><h3 className="font-semibold text-slate-100 mb-1">{heading}</h3><p>{body}</p></section>)}
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs text-slate-400">{lang === "en" ? `Version ${SAFESPACE_POLICY_VERSION} — ${SAFESPACE_POLICY_LAST_UPDATED_EN}` : `เวอร์ชัน ${SAFESPACE_POLICY_VERSION} — ${SAFESPACE_POLICY_LAST_UPDATED_TH}`}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
