import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Check, Heart, LogIn, UserPlus, Sparkles, Shield, User as UserIcon, ShieldAlert, Home as HomeIcon, GraduationCap, Users as UsersIcon, Apple } from "lucide-react";
import { assessmentCategories } from "@/lib/assessmentQuestions";
import { useAuth } from "@/lib/AuthContext";
import { appClient } from "@/api/appClient";
import { useTranslation } from "@/lib/i18n";
import Mascot from "@/components/Mascot";

const MASCOT_TH = [
  "ขอบคุณที่ตอบนะ อย่ายอมแพ้ละ ❤️",
  "ทำได้ดีมาก! อีกนิดเดียวเอง",
  "เก่งมากที่กล้าเผชิญหน้ากับมัน ต่อไปนะ 💪",
  "เราเชื่อในตัวคุณนะ สู้ต่อ!",
  "ทุกคำตอบของคุณมีค่า ขอบคุณที่แบ่งปัน 🌟",
  "เกือบถึงไปแล้ว อย่าทิ้งกลางทางนะ",
  "คุณไม่ได้อยู่คนเดียวนะ มีคนห่วงคุณอยู่ 🤗",
  "ตอบไปเยอะแล้ว เก่งมาก! อีกนิดเดียว",
];

const MASCOT_EN = [
  "Thanks for answering, don't give up ❤️",
  "You're doing great! Just a bit more",
  "Brave of you to face this, keep going 💪",
  "We believe in you, keep going!",
  "Every answer matters, thanks for sharing 🌟",
  "Almost there, don't stop now",
  "You're not alone, someone cares 🤗",
  "So many answers, great job! Just a bit more",
];

const iconMap = { User: UserIcon, ShieldAlert, Home: HomeIcon, GraduationCap, Users: UsersIcon, Apple, Sparkles };

export default function Assessment() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, lang } = useTranslation();
  const [guestMode, setGuestMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("intro");
  const [ageInput, setAgeInput] = useState("");
  const [nationality, setNationality] = useState(lang === "en" ? "" : "thai");
  const [mascotMessage, setMascotMessage] = useState(null);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyScrolledToEnd, setPolicyScrolledToEnd] = useState(false);

  const showGate = !isAuthenticated && !guestMode;

  const category = assessmentCategories[currentCategory];
  const question = category.questions[lang] || category.questions.th;
  const totalQuestions = assessmentCategories.reduce(
    (sum, c) => sum + (c.questions[lang] || c.questions.th).length,
    0
  );
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  useEffect(() => {
    if (answeredCount > 0 && answeredCount % 5 === 0) {
      const msgs = lang === "en" ? MASCOT_EN : MASCOT_TH;
      setMascotMessage(msgs[Math.floor(Math.random() * msgs.length)]);
      const timer = setTimeout(() => setMascotMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [answeredCount]);

  useEffect(() => {
    if (!policyOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [policyOpen]);

  const answerKey = `${currentCategory}-${currentQuestion}`;

  const handleSelect = (option) => {
    setAnswers({
      ...answers,
      [answerKey]: {
        category: category.title[lang] || category.title.th,
        question: question[currentQuestion].q,
        answer: option,
      },
    });
  };

  const handleNext = () => {
    if (currentQuestion < question.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentCategory < assessmentCategories.length - 1) {
      setCurrentCategory(currentCategory + 1);
      setCurrentQuestion(0);
      setStep("chapter");
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
      setCurrentQuestion(
        (assessmentCategories[currentCategory - 1].questions[lang] || assessmentCategories[currentCategory - 1].questions.th).length - 1
      );
    }
  };

  const isLast =
    currentCategory === assessmentCategories.length - 1 &&
    currentQuestion === question.length - 1;

  const handleSubmit = async () => {
    // Check all questions answered; jump to first unanswered if not
    if (answeredCount < totalQuestions) {
      for (let i = 0; i < assessmentCategories.length; i++) {
        const qs = assessmentCategories[i].questions[lang] || assessmentCategories[i].questions.th;
        for (let q = 0; q < qs.length; q++) {
          if (!answers[`${i}-${q}`]) {
            setCurrentCategory(i);
            setCurrentQuestion(q);
            setError(t("assess.incompleteMsg"));
            return;
          }
        }
      }
    }
    setLoading(true);
    setError(null);
    try {
      const answersArray = Object.values(answers);

      const res = await appClient.functions.invoke("analyzeAssessment", {
        answers: answersArray,
        language: lang,
        age: Number(ageInput),
        nationality: nationality,
      });
      const result = res.data;
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.is_guest) {
        navigate("/result", { state: { result, isGuest: true } });
      } else {
        navigate(`/result/${result.id}`);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        t("assess.error");
      setError(msg);
      setLoading(false);
    }
  };

  const selected = answers[answerKey]?.answer;
  const options = question[currentQuestion].options;

  // Login gate for unauthenticated users
  if (showGate) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 text-center space-y-6 w-full"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/80 to-sky-500/80 flex items-center justify-center mx-auto"
          >
            <Heart className="w-8 h-8 text-white" fill="white" />
          </motion.div>

          <div>
            <h2 className="text-xl font-bold text-slate-100">{t("assess.gate.title")}</h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {t("assess.gate.subtitle")}
            </p>
          </div>

          <div className="space-y-2.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login?returnTo=/assessment")}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 text-sm font-semibold py-3 rounded-2xl hover:bg-white transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {t("assess.gate.login")}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/register?returnTo=/assessment")}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-slate-200 text-sm font-semibold py-3 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              {t("assess.gate.register")}
            </motion.button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-600">{t("assess.gate.or")}</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGuestMode(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 py-2.5 rounded-2xl hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t("assess.gate.guest")}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }


  // Intro step — collect minimal details, then require policy acceptance before the assessment begins
  if (step === "intro") {
    const canOpenPolicy = ageInput && Number(ageInput) >= 1 && Number(ageInput) <= 120 && (lang !== "en" || nationality);
    const policyTitle = lang === "en" ? "SafeSpace Assessment Participation & Privacy Policy" : "นโยบายการเข้าร่วมแบบประเมินและความเป็นส่วนตัวของ SafeSpace";
    const policySections = lang === "en"
      ? [
          ["1. About this assessment", "SafeSpace provides a wellbeing screening and reflection experience. It is designed to help you understand patterns in your answers and discover supportive next steps. It is not a medical examination, diagnosis, treatment, or substitute for a qualified healthcare professional."],
          ["2. Voluntary participation", "Taking the assessment is optional. You may stop before submitting your answers or leave the assessment at any time. You should only share information you are comfortable providing. Choosing not to participate does not prevent you from using other parts of SafeSpace."],
          ["3. Information we collect", "The assessment may collect your answers, age, nationality selection, language preference, and the assessment result generated from those answers. If you are signed in, the result may be associated with your SafeSpace account. Authentication providers may also provide the account information required to operate your sign-in. We do not ask the assessment for your real name, home address, or precise location."],
          ["4. How we use assessment information", "Assessment information is used to calculate or generate your result, provide supportive explanations and recommendations, maintain your assessment history when you are signed in, improve the reliability of the application, and protect the service against abuse. We do not present the result as a clinical diagnosis."],
          ["5. AI processing", "Some assessment answers may be processed by third-party AI services used by SafeSpace to generate supportive analysis. The current system can use OpenAI and, for the main assessment flow, Gemini as a fallback, with local fallback logic when remote AI is unavailable. AI systems can make mistakes. Do not include names, addresses, passwords, or other unnecessary identifying information in free-text answers."],
          ["6. Signed-in and guest results", "When you are signed in, assessment results may be stored in your SafeSpace account and can appear in your assessment history. Guest results are intended to remain in the current browser session and are not saved to your SafeSpace account. Browser/session data can still be affected by your device, browser settings, private browsing, or clearing browser data."],
          ["7. Community content is different", "The Community area is separate from private assessment history. Information you deliberately publish in Community may be visible to other users and may be moderated. Never post passwords, contact details, private medical information, or another person's personal information. This assessment consent does not make Community posts private."],
          ["8. Security", "SafeSpace uses authentication, database access controls, row-level security, request validation, rate limits, and other technical safeguards. No website or internet transmission can be guaranteed completely secure. You should use a strong unique password and sign out on shared devices."],
          ["9. Children and teenagers", "SafeSpace may be used by teenagers. The assessment is designed as a general wellbeing screening experience, not as professional care for a child or teenager. If you are under the age required by applicable law or by a service provider, involve a parent, guardian, teacher, counselor, or other trusted adult where appropriate. Do not rely on SafeSpace alone when professional or immediate help is needed."],
          ["10. Retention, deletion, and account choices", "Signed-in assessment records may remain in your account until they are deleted through available account features or an authorized administrative process. Guest results are not intentionally stored as account records. Because this is a school-project service, retention and deletion capabilities may be more limited than those of a commercial clinical platform. Contact SafeSpace support if you need help understanding or requesting deletion of information."],
          ["11. Third-party services", "SafeSpace depends on services such as Supabase for authentication, database and server functions, GitHub Pages for the website, Google when Google sign-in is used, and AI providers when AI analysis is enabled. Those providers operate under their own terms and privacy practices."],
          ["12. Changes to this policy", "We may update this policy when the assessment, data handling, security controls, or third-party services change. Material changes should be reflected in the published policy and may require you to review the policy again before a future assessment."],
          ["13. Support and emergencies", "SafeSpace is not an emergency service and cannot monitor you continuously. If you are in immediate danger or need urgent help, contact an appropriate local emergency service or a trusted adult. In Thailand, the Department of Mental Health hotline is 1323."],
          ["14. Your acceptance", "By selecting Agree & Accept after reviewing this policy, you confirm that you have read and understood the information above and voluntarily agree to the assessment's collection, use, storage, and AI processing described here. You may decline by closing this window and leave the assessment without submitting answers."]
        ]
      : [
          ["1. เกี่ยวกับแบบประเมินนี้", "SafeSpace ให้บริการแบบประเมินและทบทวนสุขภาวะทางใจ เพื่อช่วยให้คุณเห็นรูปแบบจากคำตอบและค้นหาแนวทางดูแลตัวเองที่เหมาะสม แบบประเมินนี้ไม่ใช่การตรวจวินิจฉัย การรักษา หรือสิ่งทดแทนผู้เชี่ยวชาญด้านสุขภาพ"],
          ["2. การเข้าร่วมโดยสมัครใจ", "การทำแบบประเมินเป็นทางเลือก คุณสามารถหยุดหรือออกจากแบบประเมินก่อนส่งคำตอบได้ตลอดเวลา ควรให้เฉพาะข้อมูลที่คุณสบายใจที่จะให้ การไม่เข้าร่วมจะไม่ทำให้คุณถูกตัดสิทธิ์จากการใช้งานส่วนอื่นของ SafeSpace"],
          ["3. ข้อมูลที่เราเก็บ", "แบบประเมินอาจเก็บคำตอบ อายุ ตัวเลือกสัญชาติ ภาษา และผลการประเมินที่สร้างจากคำตอบ หากคุณเข้าสู่ระบบ ผลลัพธ์อาจเชื่อมโยงกับบัญชี SafeSpace ระบบการเข้าสู่ระบบอาจได้รับข้อมูลบัญชีที่จำเป็นจากผู้ให้บริการยืนยันตัวตน เราไม่ได้ขอชื่อจริง ที่อยู่บ้าน หรือพิกัดตำแหน่งที่ละเอียดผ่านแบบประเมิน"],
          ["4. การใช้ข้อมูลแบบประเมิน", "ข้อมูลถูกใช้เพื่อคำนวณหรือสร้างผลลัพธ์ ให้คำอธิบายและคำแนะนำที่เหมาะสม เก็บประวัติแบบประเมินสำหรับผู้ที่เข้าสู่ระบบ ปรับปรุงความเสถียรของบริการ และป้องกันการใช้งานที่ไม่เหมาะสม ผลลัพธ์ไม่ควรถูกตีความว่าเป็นการวินิจฉัยทางการแพทย์"],
          ["5. การประมวลผลด้วย AI", "คำตอบบางส่วนอาจถูกประมวลผลโดยบริการ AI ภายนอกเพื่อสร้างคำอธิบายและคำแนะนำ ปัจจุบันระบบหลักสามารถใช้ OpenAI และ Gemini เป็นระบบสำรอง โดยมีการประมวลผลภายในเครื่องเป็นทางเลือกเมื่อ AI ภายนอกใช้งานไม่ได้ ระบบ AI อาจสร้างผลลัพธ์ผิดพลาดได้ กรุณาอย่าใส่ชื่อ ที่อยู่ รหัสผ่าน หรือข้อมูลระบุตัวตนที่ไม่จำเป็นในข้อความ"],
          ["6. ผลลัพธ์สำหรับสมาชิกและผู้เยี่ยมชม", "เมื่อเข้าสู่ระบบ ผลการประเมินอาจถูกบันทึกในบัญชี SafeSpace และแสดงในประวัติแบบประเมิน โหมดผู้เยี่ยมชมมีวัตถุประสงค์ให้ผลลัพธ์อยู่ในเซสชันของเบราว์เซอร์ปัจจุบันและไม่บันทึกเข้าบัญชี ทั้งนี้ข้อมูลในเบราว์เซอร์อาจได้รับผลกระทบจากการตั้งค่า การใช้โหมดส่วนตัว หรือการล้างข้อมูลเบราว์เซอร์"],
          ["7. ข้อมูลใน Community แตกต่างจากแบบประเมินส่วนตัว", "พื้นที่ Community เป็นพื้นที่แยกจากประวัติแบบประเมิน ข้อมูลที่คุณตั้งใจเผยแพร่ใน Community อาจมองเห็นได้โดยผู้ใช้อื่นและอาจถูกตรวจสอบหรือดูแลโดยผู้ดูแลระบบ ห้ามโพสต์รหัสผ่าน ข้อมูลติดต่อ ข้อมูลสุขภาพส่วนตัว หรือข้อมูลส่วนบุคคลของผู้อื่น"],
          ["8. ความปลอดภัย", "SafeSpace ใช้การยืนยันตัวตน การควบคุมสิทธิ์ฐานข้อมูล Row Level Security การตรวจสอบคำขอ การจำกัดอัตราการใช้งาน และมาตรการทางเทคนิคอื่น ๆ อย่างไรก็ตาม ไม่มีเว็บไซต์หรือการส่งข้อมูลผ่านอินเทอร์เน็ตใดที่รับประกันความปลอดภัยได้อย่างสมบูรณ์ ควรใช้รหัสผ่านที่รัดกุมและไม่ซ้ำกับบริการอื่น"],
          ["9. เด็กและวัยรุ่น", "SafeSpace อาจมีผู้ใช้ที่เป็นวัยรุ่น แบบประเมินนี้เป็นเครื่องมือคัดกรองสุขภาวะทั่วไป ไม่ใช่บริการดูแลโดยผู้เชี่ยวชาญสำหรับเด็กหรือวัยรุ่น หากคุณยังไม่ถึงอายุที่กฎหมายหรือผู้ให้บริการกำหนด ควรพิจารณาปรึกษาผู้ปกครอง ครู ที่ปรึกษา หรือผู้ใหญ่ที่ไว้ใจได้เมื่อเหมาะสม และไม่ควรพึ่งพา SafeSpace เพียงอย่างเดียวเมื่อจำเป็นต้องได้รับความช่วยเหลือจากผู้เชี่ยวชาญ"],
          ["10. การเก็บรักษา การลบ และบัญชี", "ประวัติแบบประเมินของผู้ที่เข้าสู่ระบบอาจคงอยู่ในบัญชีจนกว่าจะถูกลบผ่านฟังก์ชันที่มีหรือผ่านกระบวนการของผู้ดูแล ผลลัพธ์แบบผู้เยี่ยมชมไม่ได้มีวัตถุประสงค์ให้ถูกเก็บเป็นระเบียนในบัญชี เนื่องจาก SafeSpace เป็นโครงการเพื่อการศึกษา ความสามารถด้านการเก็บรักษาและการลบอาจจำกัดกว่าระบบเชิงพาณิชย์หรือระบบคลินิก หากต้องการสอบถามเกี่ยวกับข้อมูลหรือการลบข้อมูล สามารถติดต่อ SafeSpace ได้"],
          ["11. บริการของบุคคลที่สาม", "SafeSpace พึ่งพาบริการ เช่น Supabase สำหรับการเข้าสู่ระบบ ฐานข้อมูล และ Edge Functions, GitHub Pages สำหรับเว็บไซต์, Google เมื่อใช้การเข้าสู่ระบบด้วย Google และผู้ให้บริการ AI เมื่อเปิดใช้การวิเคราะห์ด้วย AI ผู้ให้บริการเหล่านี้มีข้อกำหนดและแนวปฏิบัติด้านความเป็นส่วนตัวของตนเอง"],
          ["12. การเปลี่ยนแปลงนโยบาย", "เราอาจปรับปรุงนโยบายเมื่อแบบประเมิน วิธีจัดการข้อมูล มาตรการความปลอดภัย หรือบริการภายนอกมีการเปลี่ยนแปลง หากมีการเปลี่ยนแปลงสำคัญ ควรมีการอัปเดตนโยบายที่เผยแพร่และอาจขอให้คุณทบทวนใหม่ก่อนทำแบบประเมินครั้งต่อไป"],
          ["13. การติดต่อและเหตุฉุกเฉิน", "SafeSpace ไม่ใช่บริการฉุกเฉินและไม่สามารถติดตามคุณได้ตลอดเวลา หากอยู่ในภาวะฉุกเฉินหรือต้องการความช่วยเหลือเร่งด่วน ให้ติดต่อหน่วยบริการฉุกเฉินในพื้นที่หรือผู้ใหญ่ที่ไว้ใจได้ ในประเทศไทยสามารถติดต่อสายด่วนสุขภาพจิต กรมสุขภาพจิต 1323"],
          ["14. การยอมรับ", "เมื่อเลือก ยอมรับและดำเนินการต่อ หลังจากอ่านนโยบายนี้แล้ว คุณยืนยันว่าได้อ่านและเข้าใจข้อมูลข้างต้น และยินยอมโดยสมัครใจต่อการเก็บ ใช้ จัดเก็บ และประมวลผลด้วย AI ตามที่อธิบายไว้ คุณสามารถปฏิเสธได้โดยปิดหน้าต่างนี้และออกจากแบบประเมินโดยไม่ส่งคำตอบ"]
        ];

    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 w-full space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-100">{t("assess.intro.title")}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{t("assess.intro.subtitle")}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">{t("assess.intro.ageLabel")}</label>
            <input type="number" min="1" max="120" value={ageInput} onChange={(e) => setAgeInput(e.target.value)} placeholder={t("assess.intro.agePlaceholder")} className="w-full text-sm text-slate-200 p-3 rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-slate-600 placeholder:text-slate-500" />
          </div>

          {lang === "en" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">{t("assess.intro.natTitle")}</label>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => setNationality("thai")} className={"w-full text-left text-sm px-4 py-3 rounded-xl border transition-all " + (nationality === "thai" ? "border-rose-400/60 bg-rose-500/10 text-slate-100 font-medium" : "border-slate-800 text-slate-300 hover:border-slate-700")}>{t("assess.intro.natThai")}</button>
                <button onClick={() => setNationality("foreigner")} className={"w-full text-left text-sm px-4 py-3 rounded-xl border transition-all " + (nationality === "foreigner" ? "border-rose-400/60 bg-rose-500/10 text-slate-100 font-medium" : "border-slate-800 text-slate-300 hover:border-slate-700")}>{t("assess.intro.natForeigner")}</button>
              </div>
            </div>
          )}

          {error && <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl text-center border border-red-500/20">{error}</div>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!ageInput || Number(ageInput) < 1 || Number(ageInput) > 120) { setError(t("assess.intro.ageRequired")); return; }
              if (lang === "en" && !nationality) { setError(t("assess.intro.ageRequired")); return; }
              setError(null);
              if (!privacyAcknowledged) { setPolicyScrolledToEnd(false); setPolicyOpen(true); return; }
              setStep("chapter");
            }}
            disabled={!canOpenPolicy}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 text-sm font-semibold py-3 rounded-2xl hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="w-4 h-4" />
            {privacyAcknowledged ? t("assess.intro.start") : (lang === "en" ? "Review policy & continue" : "อ่านนโยบายและดำเนินการต่อ")}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {policyOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-[24px]" role="dialog" aria-modal="true" aria-labelledby="assessment-policy-title">
              <motion.div initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 8 }} transition={{ duration: 0.2 }} className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950 shadow-2xl shadow-black/50 flex flex-col">
                <div className="px-6 py-5 border-b border-slate-800 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-sky-300 mb-1">SafeSpace</div>
                    <h2 id="assessment-policy-title" className="text-lg sm:text-xl font-bold text-slate-100">{policyTitle}</h2>
                    <p className="text-xs text-slate-500 mt-1">{lang === "en" ? "Please review the full policy before continuing." : "กรุณาอ่านนโยบายทั้งหมดก่อนดำเนินการต่อ"}</p>
                  </div>
                  <button type="button" onClick={() => setPolicyOpen(false)} className="shrink-0 text-slate-500 hover:text-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-800 transition-colors" aria-label={lang === "en" ? "Close policy" : "ปิดนโยบาย"}>✕</button>
                </div>

                <div onScroll={(e) => { const el = e.currentTarget; setPolicyScrolledToEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 16); }} className="overflow-y-auto px-6 py-5 space-y-5 text-sm leading-7 text-slate-300 overscroll-contain">
                  {policySections.map(([heading, body]) => (
                    <section key={heading}>
                      <h3 className="font-semibold text-slate-100 mb-1">{heading}</h3>
                      <p>{body}</p>
                    </section>
                  ))}
                  <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs text-slate-400 leading-6">
                    {lang === "en" ? "Policy version: 1.0 • Last updated: 19 September 2026" : "เวอร์ชันนโยบาย: 1.0 • ปรับปรุงล่าสุด: 19 กันยายน 2569"}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/95">
                  <div className="flex items-center justify-between gap-4 mb-3 text-xs">
                    <span className={policyScrolledToEnd ? "text-emerald-300" : "text-slate-500"}>{policyScrolledToEnd ? (lang === "en" ? "✓ You reached the end of the policy" : "✓ คุณอ่านถึงท้ายเอกสารแล้ว") : (lang === "en" ? "Scroll to the bottom to continue" : "เลื่อนอ่านให้ถึงด้านล่างเพื่อดำเนินการต่อ")}</span>
                    <span className="text-slate-600">{lang === "en" ? "Required before assessment" : "ต้องยอมรับก่อนทำแบบประเมิน"}</span>
                  </div>
                  <motion.button disabled={!policyScrolledToEnd} onClick={() => { setPrivacyAcknowledged(true); setPolicyOpen(false); setPolicyScrolledToEnd(false); setError(null); }} className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 text-sm font-semibold py-3 rounded-2xl hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <Check className="w-4 h-4" />
                    {lang === "en" ? "Agree & Accept" : "ยอมรับและดำเนินการต่อ"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Chapter intro step — shown between categories
  if (step === "chapter") {
    const cat = assessmentCategories[currentCategory];
    const Icon = iconMap[cat.icon] || Sparkles;
    const chapterNum = currentCategory + 1;
    const totalChapters = assessmentCategories.length;
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 w-full text-center space-y-5"
        >
          <div className="text-xs text-slate-500">
            {lang === "en" ? `Chapter ${chapterNum} of ${totalChapters}` : `บทที่ ${chapterNum} จาก ${totalChapters}`}
          </div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/80 to-sky-500/80 flex items-center justify-center mx-auto"
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{cat.title[lang] || cat.title.th}</h2>
            <p className="text-sm text-slate-400 mt-1">{cat.subtitle[lang] || cat.subtitle.th}</p>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">{t("assess.chapter.intro")}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep("questions")}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 text-sm font-semibold py-3 rounded-2xl hover:bg-white transition-colors"
          >
            <Check className="w-4 h-4" />
            {t("assess.chapter.start")}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Guest notice */}
      {guestMode && !isAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center flex items-center justify-center gap-2"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <p className="text-xs text-amber-300">
            {t("assess.guest.notice")}
            <button
              onClick={() => navigate("/login?returnTo=/assessment")}
              className="underline font-medium ml-1"
            >
              {t("assess.guest.notice.login")}
            </button>
          </p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {answeredCount} / {totalQuestions} {t("assess.progress.of")}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-400 to-sky-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Category indicator (non-clickable, shows progress only) */}
      <div className="flex items-center gap-2 flex-wrap">
        {assessmentCategories.map((cat, i) => {
          const catQs = cat.questions[lang] || cat.questions.th;
          const catAnswered = catQs.reduce((acc, _q, qi) => acc + (answers[`${i}-${qi}`] ? 1 : 0), 0);
          const catDone = catAnswered === catQs.length;
          return (
            <span
              key={cat.id}
              className={`text-[10px] px-2 py-1 rounded-full transition-colors flex items-center gap-1 ${
                i === currentCategory
                  ? "bg-slate-100 text-slate-900"
                  : catDone
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-slate-900 text-slate-500"
              }`}
            >
              {cat.title[lang] || cat.title.th}
              {catDone && i !== currentCategory && <Check className="w-2.5 h-2.5" />}
            </span>
          );
        })}
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={answerKey}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800"
        >
          <div className="text-xs text-slate-500 mb-1">
            {category.title[lang] || category.title.th} · {category.subtitle[lang] || category.subtitle.th}
          </div>
          <h2 className="text-lg font-semibold text-slate-100 leading-snug mb-5">
            {question[currentQuestion].q}
          </h2>
          <div className="space-y-2">
            {options.map((option, idx) => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(option)}
                className={`w-full text-left text-sm px-4 py-3 rounded-xl border transition-all ${
                  selected === option
                    ? "border-rose-400/60 bg-rose-500/10 text-slate-100 font-medium"
                    : "border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {selected === option && (
                    <Check className="w-4 h-4 text-rose-300" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl text-center border border-red-500/20">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentCategory === 0 && currentQuestion === 0}
          className="flex items-center gap-1 text-sm text-slate-400 px-4 py-2 rounded-full hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("assess.prev")}
        </button>

        {isLast ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!selected || loading}
            className="flex items-center gap-1.5 bg-slate-100 text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("assess.submitting")}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {t("assess.submit")}
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={!selected}
            className="flex items-center gap-1.5 bg-slate-100 text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t("assess.next")}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      <Mascot show={!!mascotMessage} message={mascotMessage} />
    </div>
  );
}
