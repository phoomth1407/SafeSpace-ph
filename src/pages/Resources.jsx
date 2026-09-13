import React, { useState, useEffect } from "react";
import { Loader2, Phone, AlertCircle, ExternalLink, BookOpen, Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ResourceCard from "@/components/ResourceCard";
import BreathingExerciseModal from "@/components/BreathingExerciseModal";
import GroundingModal from "@/components/GroundingModal";
import { useTranslation } from "@/lib/i18n";

const defaultHotlines = {
  th: [
    { id: "hotline-1327", phone: "1327", icon: "phone", name: "สายด่วนสุขภาพจิต 1327", description: "กรมสุขภาพจิต ให้คำปรึกษาปัญหาสุขภาพจิต ความเครียด ซึมเศร้า และการฆ่าตัวตาย โดยไม่คิดค่าใช้จ่าย", available_hours: "24 ชั่วโมง", category: "mental" },
    { id: "hotline-1667", phone: "1667", icon: "phone", name: "สายด่วนเด็กและเยาวชน 1667", description: "ให้คำปรึกษาปัญหาเด็กและเยาวชน การถูกกลั่นแกล้ง ความรุนแรงในครอบครัว และปัญหาจิตใจ", available_hours: "24 ชั่วโมง", category: "youth" },
    { id: "hotline-1323", phone: "1323", icon: "phone", name: "สถานบำบัดสุขภาพจิตเด็กและวัยรุ่น 1323", description: "ให้คำปรึกษาออนไลน์สำหรับเด็กและวัยรุ่น ปัญหาการเรียน ครอบครัว และจิตใจ", available_hours: "24 ชั่วโมง", category: "youth" },
    { id: "hotline-1300", phone: "1300", icon: "phone", name: "สายด่วนผู้สูงอายุ 1300", description: "ให้คำปรึกษาและช่วยเหลือผู้สูงอายุ ปัญหาสุขภาพกาย สุขภาพใจ และการถูกทอดทิ้ง", available_hours: "24 ชั่วโมง", category: "general" },
    { id: "hotline-1663", phone: "1663", icon: "phone", name: "สายด่วนเอดส์ 1663", description: "ให้คำปรึกษาเรื่องเอดส์ โรคติดต่อทางเพศสัมพันธ์ และการตรวจเลือด", available_hours: "จันทร์-ศุกร์ 8.00-20.00 น.", category: "general" },
    { id: "hotline-1506", phone: "1506", icon: "phone", name: "สายด่วนกองทุนประกันสังคม 1506", description: "ตอบคำถามเรื่องประกันสังคม สิทธิการรักษาพยาบาล และเงินชดเชย", available_hours: "จันทร์-ศุกร์ 8.30-16.30 น.", category: "general" },
  ],
  en: [
    { id: "hotline-1327", phone: "1327", icon: "phone", name: "Mental Health Hotline 1327", description: "Thailand Department of Mental Health support for mental health concerns, stress, depression, and crisis support", available_hours: "24 hours", category: "mental" },
    { id: "hotline-1667", phone: "1667", icon: "phone", name: "Child & Youth Hotline 1667", description: "Support for children and young people facing bullying, family violence, and emotional concerns", available_hours: "24 hours", category: "youth" },
    { id: "hotline-1323", phone: "1323", icon: "phone", name: "Child & Adolescent Mental Health 1323", description: "Online support for children and teenagers about school, family, and emotional concerns", available_hours: "24 hours", category: "youth" },
    { id: "hotline-1300", phone: "1300", icon: "phone", name: "Elderly Support Hotline 1300", description: "Support for older adults with physical health, mental health, and neglect concerns", available_hours: "24 hours", category: "general" },
    { id: "hotline-1663", phone: "1663", icon: "phone", name: "HIV / Sexual Health Hotline 1663", description: "Information and counseling about HIV, sexually transmitted infections, and testing", available_hours: "Mon-Fri 8:00-20:00", category: "general" },
    { id: "hotline-1506", phone: "1506", icon: "phone", name: "Social Security Hotline 1506", description: "Questions about social security, healthcare rights, and compensation", available_hours: "Mon-Fri 8:30-16:30", category: "general" },
  ],
};

const selfCareLinks = {
  th: [
    { title: "กรมสุขภาพจิต กระทรวงสาธารณสุข", url: "https://www.dmh.go.th", desc: "ข้อมูลและความรู้ด้านสุขภาพจิต วิธีดูแลตนเอง และแหล่งบริการให้คำปรึกษา" },
    { title: "กรมสุขภาพจิต (สายด่วน 1327)", url: "https://dmh.go.th", desc: "แหล่งข้อมูลและคลังความรู้เรื่องสุขภาพจิต การดูแลตนเอง และการปรึกษาปัญหา" },
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
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [groundingOpen, setGroundingOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.EmergencyResource.list();
        setResources(data.length ? data : (defaultHotlines[lang] || defaultHotlines.th));
      } catch (err) {
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const links = selfCareLinks[lang] || selfCareLinks.th;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-slate-100">{t("resources.title")}</h1>
        <p className="text-sm !text-black mt-1.5 leading-relaxed">
          {t("resources.subtitle")}
        </p>
      </div>

      {/* Emergency banner */}
      <div className="bg-gradient-to-br from-red-500/20 to-rose-600/20 rounded-2xl p-5 border border-red-500/30 text-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{t("resources.emergency.title")}</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {t("resources.emergency.desc")}
            </p>
            <div className="flex gap-2 mt-3">
              <a href="tel:191" className="bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> 191
              </a>
              <a href="tel:1669" className="bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> 1669
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive self-care tools */}
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{t("resources.toolsTitle")}</h2>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button onClick={() => setBreathingOpen(true)} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 text-xs !text-black dark:!text-black hover:border-sky-300 dark:hover:border-sky-500/30">
            🫧 {t("resources.toolsBreath")}
          </button>
          <button onClick={() => setGroundingOpen(true)} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 text-xs !text-black dark:!text-black hover:border-emerald-300 dark:hover:border-emerald-500/30">
            🌿 {t("resources.toolsGround")}
          </button>
          <button onClick={() => window.dispatchEvent(new Event("safespace:open-sounds"))} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3 text-xs !text-black dark:!text-black hover:border-violet-300 dark:hover:border-violet-500/30">
            🎧 {t("resources.toolsSound")}
          </button>
        </div>
      </div>

      {/* Self-care links */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">{t("resources.selfcare.title")}</h2>
            <p className="text-xs !text-black">{t("resources.selfcare.subtitle")}</p>
          </div>
        </div>
        <div className="space-y-3 mt-3">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-slate-900/60 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-rose-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-slate-100">{link.title}</h3>
                    <ExternalLink className="w-3 h-3 !text-black group-hover:!text-black transition-colors" />
                  </div>
                  <p className="text-xs !text-black mt-1 leading-relaxed">{link.desc}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Hotlines list */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Phone className="w-4 h-4 !text-black" />
          <h2 className="text-sm font-semibold text-slate-100">{t("resources.hotlines.title")}</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 !text-black animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="text-center py-4">
        <p className="text-xs !text-black leading-relaxed">
          {t("resources.footer1")}<br />
          {t("resources.footer2")}
        </p>
      </div>
      <BreathingExerciseModal open={breathingOpen} onClose={() => setBreathingOpen(false)} />
      <GroundingModal open={groundingOpen} onClose={() => setGroundingOpen(false)} />
    </div>
  );
}
