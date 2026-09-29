import React, { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, BookOpen, ExternalLink, Heart, Loader2, Phone } from "lucide-react";
import { appClient } from "@/api/appClient";
import ResourceCard from "@/components/ResourceCard";
import { useTranslation } from "@/lib/i18n";

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
    { title: "สุขภาพใจ.com", url: "https://www.thaimentalhealth.com", desc: "บทความและวิธีการดูแลใจ การจัดการอารมณ์ และการสร้างความเข้มแข็งทางใจ" },
    { title: "จิตวิทยาพลิกชีวิต", url: "https://www.facebook.com/psychologylife", desc: "เนื้อหาเกี่ยวกับจิตวิทยา การเข้าใจอารมณ์ และการดูแลตัวเองในชีวิตประจำวัน" },
    { title: "Ooca บำบัดใจ", url: "https://www.ooca.co", desc: "ข้อมูลเกี่ยวกับการดูแลสุขภาพจิตและบริการปรึกษาผู้เชี่ยวชาญออนไลน์" },
  ],
  en: [
    { title: "Department of Mental Health, Thailand", url: "https://www.dmh.go.th", desc: "Mental health information, self-care guidance, and support-service information from Thailand's Department of Mental Health" },
    { title: "HelpGuide — Mental Health", url: "https://www.helpguide.org/mental-health", desc: "Reading guides about self-care, managing emotions, coping skills, and wellbeing" },
    { title: "Mindful.org", url: "https://www.mindful.org", desc: "Reading and practical material about mindfulness and emotional wellbeing" },
    { title: "Psychology Today — Self-Help", url: "https://www.psychologytoday.com/us/basics/self-help", desc: "Articles about coping skills, emotional regulation, and self-help topics" },
    { title: "NAMI — Self-Care", url: "https://www.nami.org/About-Mental-Illness/Treatments/Self-Care", desc: "Practical reading about self-care and maintaining mental wellbeing" },
  ],
};

export default function Resources() {
  const { t, lang } = useTranslation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoadError(false);
      setLoading(true);
      try {
        const data = await appClient.entities.EmergencyResource.list();
        setResources(data.length ? data : (defaultHotlines[lang] || defaultHotlines.th));
      } catch {
        setResources(defaultHotlines[lang] || defaultHotlines.th);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
    const retry = () => load();
    window.addEventListener("safespace:resources-retry", retry);
    return () => window.removeEventListener("safespace:resources-retry", retry);
  }, [lang]);

  const links = selfCareLinks[lang] || selfCareLinks.th;

  return (
    <div className="community-page resources-page space-y-6 max-w-5xl mx-auto">
      {step === 1 ? (
        <>
          <section className="community-hero-card">
            <div className="community-hero-glow community-hero-glow-a" />
            <div className="community-hero-glow community-hero-glow-b" />
            <div className="community-hero-copy">
              <div className="community-eyebrow">
                <span className="community-live-dot" />
                {lang === "en" ? "Hotlines & Resources" : "สายด่วนและแหล่งข้อมูล"}
              </div>
              <h1>{lang === "en" ? "Start with the support you need" : "เริ่มจากความช่วยเหลือที่คุณต้องการ"}</h1>
              <p>
                {lang === "en"
                  ? "This first page is for quick access. Emergency contacts and support hotlines are placed here so you can find a number quickly. Reading-based self-care and self-therapy resources are on the next page."
                  : "หน้านี้ออกแบบสำหรับเข้าถึงความช่วยเหลือได้อย่างรวดเร็ว เรารวมเบอร์ฉุกเฉินและสายด่วนไว้ก่อน ส่วนเนื้อหาอ่านเกี่ยวกับการดูแลตัวเองและการดูแลใจอยู่ในหน้าถัดไป"}
              </p>
              <div className="community-hero-actions">
                <button type="button" onClick={() => setStep(2)} className="community-primary-button">
                  {lang === "en" ? "Next: Self-care & self-therapy" : "ถัดไป: การดูแลตัวเองและการดูแลใจ"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="community-hero-art" aria-hidden="true">
              <div className="community-art-orbit orbit-one" />
              <div className="community-art-orbit orbit-two" />
              <div className="community-art-core">
                <span className="community-art-heart"><Phone className="h-5 w-5" /></span>
              </div>
            </div>
          </section>

          <section className="resources-emergency bg-red-50 dark:bg-gradient-to-br dark:from-red-500/20 dark:to-rose-600/20 rounded-2xl p-5 border border-red-200 dark:border-red-500/30 text-red-950 dark:text-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-300" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">{lang === "en" ? "Emergency" : "เหตุฉุกเฉิน"}</h2>
                <p className="text-xs text-red-900 dark:text-slate-300 mt-1 leading-relaxed">
                  {lang === "en"
                    ? "If there is immediate danger or an urgent medical emergency, contact the appropriate emergency service directly."
                    : "หากมีอันตรายเร่งด่วนหรือเหตุฉุกเฉินทางการแพทย์ โปรดติดต่อหน่วยงานฉุกเฉินโดยตรง"}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <a href="tel:191" className="bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> 191
                  </a>
                  <a href="tel:1669" className="bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> 1669
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-sky-600 dark:text-sky-300" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("resources.hotlines.title")}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {lang === "en" ? "Quick access to support hotlines." : "เข้าถึงสายด่วนเพื่อขอความช่วยเหลือได้อย่างรวดเร็ว"}
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
            {loadError && !loading && (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                {t("resources.loadError")}{" "}
                <button type="button" onClick={() => window.dispatchEvent(new Event("safespace:resources-retry"))} className="font-semibold underline underline-offset-2">
                  {t("resources.retry")}
                </button>
              </div>
            )}
          </section>

          <div className="rounded-2xl border border-sky-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900/50 p-4 flex items-start gap-3">
            <Heart className="w-4 h-4 text-sky-600 dark:text-sky-300 mt-1 shrink-0" />
            <p className="text-xs leading-6 text-slate-600 dark:text-slate-400">
              {lang === "en"
                ? "SafeSpace is not an emergency service. If immediate help is needed, contact the relevant emergency or professional service directly."
                : "SafeSpace ไม่ใช่หน่วยงานฉุกเฉิน หากต้องการความช่วยเหลือเร่งด่วน โปรดติดต่อหน่วยงานฉุกเฉินหรือบริการจากผู้เชี่ยวชาญโดยตรง"}
            </p>
          </div>
        </>
      ) : (
        <>
          <section className="community-hero-card">
            <div className="community-hero-glow community-hero-glow-a" />
            <div className="community-hero-glow community-hero-glow-b" />
            <div className="community-hero-copy">
              <div className="community-eyebrow">
                <span className="community-live-dot" />
                {lang === "en" ? "Reading & reflection" : "อ่านและทำความเข้าใจตัวเอง"}
              </div>
              <h1>{lang === "en" ? "Self-care & self-therapy reading" : "การดูแลตัวเองและการดูแลใจ"}</h1>
              <p>
                {lang === "en"
                  ? "This page is intentionally reading-focused. Explore trusted information, coping ideas, and self-care material at your own pace."
                  : "หน้านี้เน้นการอ่านโดยเฉพาะ คุณสามารถค่อย ๆ อ่านข้อมูล แนวทางรับมือ และเนื้อหาเกี่ยวกับการดูแลตัวเองได้ตามจังหวะของคุณ"}
              </p>
            </div>
            <div className="resources-hero-image-wrap">
              <img
                src="/SafeSpace-ph/assets/resources-reading-hero.webp"
                alt={lang === "en" ? "Calm illustration of a person reading a book" : "ภาพประกอบบรรยากาศสงบของการอ่านหนังสือ"}
                className="resources-hero-image"
              />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {lang === "en" ? "Self-care & self-therapy" : "การดูแลตัวเองและการดูแลใจ"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {lang === "en" ? "Reading resources you can explore in your own time." : "แหล่งข้อมูลสำหรับอ่านและทำความเข้าใจเพิ่มเติมตามเวลาที่สะดวก"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {links.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="group block bg-white/85 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{link.title}</h3>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{link.desc}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <div className="rounded-2xl border border-sky-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900/50 p-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {lang === "en" ? "A note before you read" : "หมายเหตุก่อนอ่าน"}
            </h2>
            <p className="text-xs leading-6 text-slate-600 dark:text-slate-400 mt-1">
              {lang === "en"
                ? "These materials are for information and self-care. They do not replace professional assessment or treatment."
                : "เนื้อหาเหล่านี้มีไว้เพื่อความรู้และการดูแลตัวเอง ไม่สามารถทดแทนการประเมินหรือการรักษาจากผู้เชี่ยวชาญได้"}
            </p>
          </div>

          <div className="flex justify-start">
            <button type="button" onClick={() => setStep(1)} className="community-secondary-button">
              <ArrowLeft className="w-4 h-4" />
              {lang === "en" ? "Back to emergency & hotlines" : "กลับไปหน้าเหตุฉุกเฉินและสายด่วน"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
