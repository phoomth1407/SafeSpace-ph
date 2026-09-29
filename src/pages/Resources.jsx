import React, { useState, useEffect } from "react";
import { Loader2, Phone, AlertCircle, ExternalLink, BookOpen, Heart } from "lucide-react";
import { appClient } from "@/api/appClient";
import ResourceCard from "@/components/ResourceCard";
import BreathingExerciseModal from "@/components/BreathingExerciseModal";
import GroundingModal from "@/components/GroundingModal";
import { useTranslation } from "@/lib/i18n";
import SafeSpacePolicyModal from "@/components/SafeSpacePolicyModal";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";

const defaultHotlines = {
  th: [
    { id: "hotline-1323", phone: "1323", icon: "phone", name: "สายด่วนสุขภาพจิต 1323", description: "กรมสุขภาพจิต ให้คำปรึกษาปัญหาสุขภาพจิตและความเครียด ฟรีตลอด 24 ชั่วโมง", available_hours: "24 ชั่วโมง", category: "mental" },
    { id: "hotline-1667", phone: "1667", icon: "phone", name: "สายด่วนเด็กและเยาวชน 1667", description: "ให้คำปรึกษาปัญหาเด็กและเยาวชน การถูกกลั่นแกล้ง ความรุนแรงในครอบครัว และปัญหาจิตใจ", available_hours: "24 ชั่วโมง", category: "youth" },
    { id: "hotline-1300", phone: "1300", icon: "phone", name: "สายด่วนผู้สูงอายุ 1300", description: "ให้คำปรึกษาและช่วยเหลือผู้สูงอายุ ปัญหาสุขภาพกาย สุขภาพใจ และการถูกทอดทิ้ง", available_hours: "24 ชั่วโมง", category: "general" },
    { id: "hotline-1663", phone: "1663", icon: "phone", name: "สายด่วนเอดส์ 1663", description: "ให้คำปรึกษาเรื่องเอดส์ โรคติดต่อทางเพศสัมพันธ์ และการตรวจเลือด", available_hours: "จันทร์-ศุกร์ 8.00-20.00 น.", category: "general" },
    { id: "hotline-1506", phone: "1506", icon: "phone", name: "สายด่วนกองทุนประกันสังคม 1506", description: "ตอบคำถามเรื่องประกันสังคม สิทธิการรักษาพยาบาล และเงินชดเชย", available_hours: "จันทร์-ศุกร์ 8.30-16.30 น.", category: "general" },
  ],
  en: [
    { id: "hotline-1323", phone: "1323", icon: "phone", name: "Mental Health Hotline 1323", description: "Thailand Department of Mental Health support for mental health concerns and stress, free 24/7", available_hours: "24 hours", category: "mental" },
    { id: "hotline-1667", phone: "1667", icon: "phone", name: "Child & Youth Hotline 1667", description: "Support for children and young people facing bullying, family violence, and emotional concerns", available_hours: "24 hours", category: "youth" },
    { id: "hotline-1300", phone: "1300", icon: "phone", name: "Elderly Support Hotline 1300", description: "Support for older adults with physical health, mental health, and neglect concerns", available_hours: "24 hours", category: "general" },
    { id: "hotline-1663", phone: "1663", icon: "phone", name: "HIV / Sexual Health Hotline 1663", description: "Information and counseling about HIV, sexually transmitted infections, and testing", available_hours: "Mon-Fri 8:00-20:00", category: "general" },
    { id: "hotline-1506", phone: "1506", icon: "phone", name: "Social Security Hotline 1506", description: "Questions about social security, healthcare rights, and compensation", available_hours: "Mon-Fri 8:30-16:30", category: "general" },
  ],
};

const selfCareLinks = {
  th: [
    { title: "กรมสุขภาพจิต กระทรวงสาธารณสุข", url: "https://www.dmh.go.th", desc: "ข้อมูลและความรู้ด้านสุขภาพจิต วิธีดูแลตนเอง และแหล่งบริการให้คำปรึกษา" },
    { title: "กรมสุขภาพจิต (สายด่วน 1323)", url: "https://dmh.go.th", desc: "แหล่งข้อมูลและคลังความรู้เรื่องสุขภาพจิต การดูแลตนเอง และการปรึกษาปัญหา" },
    { title: "สุขภาพใจ.com", url: "https://www.thaimentalhealth.com", desc: "บทความและวิธีการบำบัดตนเอง การจัดการอารมณ์ และการสร้างความเข้มแข็งในใจ" },
    { title: "จิตวิทยาพลิกชีวิต", url: "https://www.facebook.com/psychologylife", desc: "เพจแชร์ความรู้จิตวิทยาเพื่อการดูแลตนเอง เข้าใจอารมณ์ และพัฒนาตนเอง" },
    { title: "Ooca บำบัดใจ", url: "https://www.ooca.co", desc: "แพลตฟอร์มปรึกษานักจิตวิทยาออนไลน์ พร้อมบทความดูแลสุขภาพจิต" },
  ],
  en: [
    { title: "HelpGuide — Mental Health", url: "https://www.helpguide.org/mental-health", desc: "Evidence-based guides on self-care, managing emotions, and building resilience" },
    { title: "Mindful.org", url: "https://www.mindful.org", desc: "Mindfulness and meditation practices for self-therapy and emotional well-being" },
    { title: "Headspace", url: "https://www.headspace.com", desc: "Guided meditations and self-care techniques for stress, anxiety, and sleep" },
    { title: "Psychology Today — Self-Help", url: "https://www.psychologytoday.com/us/basics/self-help", desc: "Articles on self-therapy, coping skills, and emotional regulation" },
    { title: "NAMI — Self-Care", url: "https://www.nami.org/About-Mental-Illness/Treatments/Self-Care", desc: "Practical self-care strategies for mental health recovery and maintenance" },
  ],
};

export default function Resources() {
  const { t, lang } = useTranslation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [groundingOpen, setGroundingOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [policyOpen, setPolicyOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadError(false);
      setLoading(true);
      try {
        const data = await appClient.entities.EmergencyResource.list();
        setResources(data.length ? data : (defaultHotlines[lang] || defaultHotlines.th));
      } catch (err) {
        setResources([]);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
    const retry = () => load();
    window.addEventListener("safespace:resources-retry", retry);
    return (
    <div className="resources-page space-y-6 max-w-5xl mx-auto">
      {loadError && !loading && (
        <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 flex items-center justify-between gap-3" role="alert">
          <p className="text-sm text-red-900 dark:text-red-200">{t("resources.loadError")}</p>
          <button type="button" onClick={() => window.dispatchEvent(new Event("safespace:resources-retry"))} className="shrink-0 rounded-full bg-red-900 text-white dark:bg-red-100 dark:text-red-950 px-3 py-1.5 text-xs font-semibold">
            {t("resources.retry")}
          </button>
        </div>
      )}

      <div className="resources-hero text-center pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {step === 1
            ? (lang === "en" ? "Quick access & support" : "เข้าถึงความช่วยเหลือได้อย่างรวดเร็ว")
            : (lang === "en" ? "Self-care & trusted resources" : "การดูแลตัวเองและแหล่งข้อมูล")}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-3">{t("resources.title")}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-2xl mx-auto">
          {step === 1
            ? (lang === "en"
              ? "If you need someone to talk to, start here. This page brings emergency contacts and support hotlines together so you can reach the right service quickly."
              : "หากคุณต้องการใครสักคนเพื่อพูดคุย ให้เริ่มจากหน้านี้ เรารวบรวมเบอร์ฉุกเฉินและสายด่วนสำคัญไว้ด้วยกัน เพื่อให้คุณเข้าถึงความช่วยเหลือได้รวดเร็ว")
            : (lang === "en"
              ? "When you are not in immediate danger, these self-care tools and external resources can help you explore practical ways to support your wellbeing."
              : "หากคุณไม่ได้อยู่ในสถานการณ์ฉุกเฉิน เครื่องมือดูแลตัวเองและแหล่งข้อมูลภายนอกเหล่านี้อาจช่วยให้คุณเรียนรู้วิธีดูแลสุขภาวะของตัวเองได้")}
        </p>
      </div>

      {step === 1 ? (
        <>
          <div className="resources-emergency bg-red-50 dark:bg-gradient-to-br dark:from-red-500/20 dark:to-rose-600/20 rounded-2xl p-5 border border-red-200 dark:border-red-500/30 text-red-950 dark:text-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-300" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">{t("resources.emergency.title")}</h2>
                <p className="text-xs text-red-900 dark:text-slate-300 mt-1 leading-relaxed">{t("resources.emergency.desc")}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <a href="tel:191" className="bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> 191</a>
                  <a href="tel:1669" className="bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> 1669</a>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("resources.hotlines.title")}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {lang === "en" ? "Tap a number to call when available." : "แตะหมายเลขเพื่อโทรออกได้ทันทีเมื่ออุปกรณ์รองรับ"}
                </p>
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
            ) : (
              <div className="space-y-3">
                {resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-sky-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900/50 p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-sky-600 dark:text-sky-300" />
            </div>
            <p className="text-xs leading-6 text-slate-600 dark:text-slate-400">
              {lang === "en"
                ? "SafeSpace is not an emergency service. If there is immediate danger, contact emergency services directly rather than waiting for this website."
                : "SafeSpace ไม่ใช่หน่วยงานฉุกเฉิน หากมีอันตรายเร่งด่วน โปรดติดต่อหน่วยงานฉุกเฉินโดยตรง ไม่ควรรอการตอบกลับจากเว็บไซต์นี้"}
            </p>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors">
              {lang === "en" ? "Next: Self-care & Resources" : "ถัดไป: การดูแลตัวเองและแหล่งข้อมูล"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="resources-tools bg-white/85 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{t("resources.toolsTitle")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <button onClick={() => setBreathingOpen(true)} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 text-xs text-slate-700 dark:text-slate-200 hover:border-sky-300 dark:hover:border-sky-500/30">🫧 {t("resources.toolsBreath")}</button>
              <button onClick={() => setGroundingOpen(true)} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 text-xs text-slate-700 dark:text-slate-200 hover:border-emerald-300 dark:hover:border-emerald-500/30">🌿 {t("resources.toolsGround")}</button>
              <button onClick={() => window.dispatchEvent(new Event("safespace:open-sounds"))} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 text-xs text-slate-700 dark:text-slate-200 hover:border-violet-300 dark:hover:border-violet-500/30">🎧 {t("resources.toolsSound")}</button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-300" /></div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("resources.selfcare.title")}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("resources.selfcare.subtitle")}</p>
              </div>
            </div>
            <div className="space-y-3 mt-3">
              {links.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="group block bg-white/85 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0"><Heart className="w-5 h-5 text-rose-500 dark:text-rose-300" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5"><h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{link.title}</h3><ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" /></div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{link.desc}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900/50 p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{lang === "en" ? "A calmer next step" : "ก้าวต่อไปอย่างค่อยเป็นค่อยไป"}</h2>
            <p className="text-xs leading-6 text-slate-600 dark:text-slate-400 mt-1">
              {lang === "en" ? "These resources are for information and self-care. They do not replace professional assessment or treatment." : "แหล่งข้อมูลเหล่านี้มีไว้เพื่อความรู้และการดูแลตัวเอง ไม่สามารถทดแทนการประเมินหรือการรักษาจากผู้เชี่ยวชาญได้"}
            </p>
          </div>

          <div className="flex justify-between gap-3">
            <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-4 h-4" /> {lang === "en" ? "Back" : "ย้อนกลับ"}
            </button>
          </div>
        </>
      )}

      <div className="border-t border-white/70 dark:border-slate-700/70 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-6 max-w-xl">
            {t("resources.footer1")}<br />{t("resources.footer2")}
          </p>
          <button type="button" onClick={() => setPolicyOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white/75 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900 transition-colors">
            <ShieldCheck className="w-4 h-4" />
            {lang === "en" ? "SafeSpace Policy" : "นโยบาย SafeSpace"}
          </button>
        </div>
      </div>

      <BreathingExerciseModal open={breathingOpen} onClose={() => setBreathingOpen(false)} />
      <GroundingModal open={groundingOpen} onClose={() => setGroundingOpen(false)} />
      <SafeSpacePolicyModal
        open={policyOpen}
        persistAcknowledgement
        onAccept={() => setPolicyOpen(false)}
        onClose={() => setPolicyOpen(false)}
      />
    </div>
  );
