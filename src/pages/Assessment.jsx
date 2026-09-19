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
  const [policyOpen, setPolicyOpen] = useState(true);
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
    const policyTitle = lang === "en" ? "SafeSpace Assessment Policy" : "นโยบายการประเมินของ SafeSpace";
    const policySections = lang === "en"
      ? [
          ["1. What SafeSpace Assessment is", "SafeSpace Assessment is a wellbeing screening and reflection tool. It asks questions about areas of your life and wellbeing and uses your answers to produce an assessment result. It is designed to help you reflect and identify areas that may deserve attention. It is not a medical examination, psychological diagnosis, treatment, therapy, emergency service, or replacement for a qualified healthcare professional."],
          ["2. What happens from start to finish", "Before the questions begin, you will read this policy and choose whether to continue. After accepting it, you will see a Before you begin screen where you enter your age and nationality. You can then start the assessment, answer the questions, review the result, and leave the assessment. Participation is voluntary."],
          ["3. What questions may ask about", "Questions can cover feelings, stress, school or home experiences, relationships, social experiences, daily difficulties, and other wellbeing-related topics. The exact questions can change as the assessment is improved. You should answer honestly if you are comfortable doing so, but you should never provide information that is not necessary for the question."],
          ["4. What information we collect", "The assessment may process the answers you submit, your age, your selected nationality, your language preference, and the assessment result generated from those answers. If you are signed in, information needed to associate the result with your account may also be processed. The assessment does not require your real name, home address, precise location, password, or government identification number."],
          ["5. Why we ask for age and nationality", "Age gives the assessment context because wellbeing experiences can differ between age groups. Nationality can provide additional context for interpreting the assessment. These details are collected for the assessment experience and are not intended to judge your identity, worth, or character. Only provide the information requested by the form."],
          ["6. What you should not put into answers", "Do not enter passwords, payment information, exact home addresses, government identification numbers, private account credentials, or another person's private information. If you describe an experience, you can usually do so without including names, contact details, or other information that directly identifies someone."],
          ["7. How your answers are used", "Your answers are used to generate your assessment result and related explanations or supportive suggestions. They may also be used to operate the assessment, maintain authenticated assessment history, troubleshoot reliability, and protect the service against abuse. SafeSpace does not use the assessment result as a statement of your personal value or identity."],
          ["8. AI processing", "Parts of the assessment may be analyzed by AI services to generate the result and explanations. The current assessment system can use OpenAI and Gemini as configured AI providers, with local fallback logic when remote AI is unavailable. Information sent for AI processing should be limited to what is needed for the assessment. AI can produce incorrect, incomplete, or misleading output, so an AI result must not be treated as a professional diagnosis or as absolute truth."],
          ["9. Who may process the information", "SafeSpace relies on technical services to operate features such as authentication, database storage, server functions, and AI analysis. The current project uses Supabase for core backend services, Google when Google sign-in is used, and AI providers when AI analysis is enabled. These providers have their own systems, terms, and privacy practices. SafeSpace does not claim that third-party processing is risk-free."],
          ["10. Signed-in assessment results", "If you are signed in, an assessment result may be stored with your SafeSpace account so that account-related features such as assessment history can work. Private assessment information is not intended to become a public post simply because you use SafeSpace. Account access controls are used to restrict access to private records."],
          ["11. Guest assessment results", "If you use the assessment as a guest, the result is intended to remain in the current browser/session experience instead of being saved to a SafeSpace account. Guest mode should not be interpreted as a guarantee of complete anonymity: browser storage, device settings, network conditions, logs, or other technical systems can behave differently."],
          ["12. Assessment and Community are different", "Your private assessment is separate from Community posts and comments. Information you deliberately publish in Community may be visible to other users and may be moderated. Accepting this assessment policy does not make anything you voluntarily publish in Community private. Never publish passwords, private contact information, unnecessary health details, or another person's personal information."],
          ["13. Security protections", "SafeSpace uses technical controls intended to reduce unauthorized access and misuse, including authentication, database access controls, Row Level Security, server-side validation, request-size checks, rate limiting, and protected server functions. These controls reduce risk but cannot make an internet service perfectly secure. Use a strong unique password and avoid using the assessment on a device where another person can access your account."],
          ["14. Children and teenagers", "SafeSpace may be accessed by teenagers and other younger users. The assessment is designed to explain its data use clearly and to avoid requesting unnecessary identifying information. If you are unsure about what information to provide, or if a question makes you uncomfortable, consider speaking with a parent, guardian, teacher, counselor, or another trusted adult before continuing. Do not rely on SafeSpace alone when professional or urgent support is needed."],
          ["15. Is the result a diagnosis?", "No. SafeSpace Assessment does not diagnose depression, anxiety, or another medical or psychological condition. It provides an AI-assisted interpretation of the answers submitted to the assessment. A qualified professional is needed for professional evaluation, diagnosis, or treatment."],
          ["16. What if the result is wrong?", "AI-generated results can be inaccurate or incomplete. Your own experience is important, and you should not force yourself to accept a result that does not seem accurate. If a result concerns you, confuses you, or suggests that you may need additional support, consider discussing it with a trusted adult or an appropriate qualified professional."],
          ["17. Retention and deletion", "Authenticated assessment records may remain associated with your account until they are deleted through available account functionality or an authorized administrative process. Guest results are not intentionally stored as account records. Because SafeSpace is currently a school project, its retention and deletion features may be more limited than those of a commercial clinical platform. SafeSpace does not promise instant removal from every technical system unless the application actually provides that capability."],
          ["18. Your choices and voluntary participation", "You can choose not to take the assessment. You can leave before submitting your answers. You should only continue if you understand the policy and are comfortable with the information being processed as described here. Closing this policy without accepting it means you do not continue to the assessment."],
          ["19. Emergencies and urgent situations", "SafeSpace is not an emergency service and cannot continuously monitor or protect you. If you or another person is in immediate danger or you need urgent help, do not wait for an assessment result. Contact an appropriate local emergency service, a trusted adult, or an appropriate professional support service. In Thailand, the Department of Mental Health hotline is 1323."],
          ["20. Policy changes", "SafeSpace may change its questions, AI systems, security controls, storage behavior, or third-party services as the project develops. This policy may therefore be updated. Important changes to how assessment information is handled should be reflected in the published policy, and users may be asked to review the policy again before a future assessment."],
          ["21. What accepting this policy means", "By selecting Agree & Accept after reaching the end of this policy, you confirm that you have had an opportunity to read and understand how the assessment works, what information it uses, how AI may be involved, how signed-in and guest results differ, and what the important limitations are. You voluntarily agree to continue with the assessment under these conditions."]
        ]
      : [
          ["1. แบบประเมิน SafeSpace คืออะไร", "SafeSpace Assessment เป็นเครื่องมือคัดกรองและทบทวนสุขภาวะทางใจ โดยถามคำถามเกี่ยวกับชีวิตและความเป็นอยู่ของคุณ แล้วใช้คำตอบเพื่อสร้างผลการประเมิน จุดประสงค์คือช่วยให้คุณทบทวนตัวเองและเห็นประเด็นที่อาจควรใส่ใจ แบบประเมินนี้ไม่ใช่การตรวจทางการแพทย์ การวินิจฉัย การรักษา การบำบัด บริการฉุกเฉิน หรือสิ่งทดแทนผู้เชี่ยวชาญด้านสุขภาพ"],
          ["2. ตั้งแต่เริ่มจนจบเกิดอะไรขึ้น", "ก่อนเริ่มคำถาม คุณจะได้อ่านนโยบายนี้และเลือกว่าจะดำเนินการต่อหรือไม่ หลังจากยอมรับแล้ว คุณจะเห็นหน้า ก่อนเริ่ม ซึ่งให้กรอกอายุและสัญชาติ จากนั้นจึงเริ่มแบบประเมิน ตอบคำถาม ดูผลลัพธ์ และออกจากแบบประเมินได้ การเข้าร่วมเป็นไปโดยสมัครใจ"],
          ["3. คำถามเกี่ยวกับอะไรได้บ้าง", "คำถามอาจเกี่ยวกับความรู้สึก ความเครียด ประสบการณ์ที่โรงเรียนหรือที่บ้าน ความสัมพันธ์ ประสบการณ์ทางสังคม ปัญหาในชีวิตประจำวัน และประเด็นด้านสุขภาวะอื่น ๆ คำถามอาจเปลี่ยนแปลงได้เมื่อมีการพัฒนาระบบ ควรตอบตามจริงเมื่อคุณสบายใจ แต่ไม่ควรให้ข้อมูลที่ไม่จำเป็นต่อคำถาม"],
          ["4. เราเก็บข้อมูลอะไร", "แบบประเมินอาจประมวลผลคำตอบ อายุ สัญชาติที่เลือก ภาษา และผลการประเมินที่สร้างจากคำตอบ หากคุณเข้าสู่ระบบ อาจมีข้อมูลที่จำเป็นสำหรับเชื่อมผลลัพธ์กับบัญชีของคุณด้วย แบบประเมินไม่จำเป็นต้องใช้ชื่อจริง ที่อยู่บ้าน พิกัดตำแหน่งที่ละเอียด รหัสผ่าน หรือเลขบัตรประชาชน"],
          ["5. ทำไมต้องถามอายุและสัญชาติ", "อายุช่วยให้แบบประเมินมีบริบท เพราะประสบการณ์ด้านสุขภาวะอาจแตกต่างกันตามช่วงวัย ส่วนสัญชาติอาจช่วยให้มีบริบทเพิ่มเติมในการตีความแบบประเมิน ข้อมูลเหล่านี้ไม่ได้มีจุดประสงค์เพื่อตัดสินตัวตน คุณค่า หรือบุคลิกของคุณ ให้กรอกเฉพาะข้อมูลที่แบบฟอร์มร้องขอ"],
          ["6. ไม่ควรใส่อะไรในคำตอบ", "ห้ามใส่รหัสผ่าน ข้อมูลการชำระเงิน ที่อยู่บ้านแบบละเอียด เลขบัตรประชาชน ข้อมูลเข้าสู่ระบบส่วนตัว หรือข้อมูลส่วนตัวของผู้อื่น หากต้องการเล่าประสบการณ์ โดยทั่วไปสามารถเล่าโดยไม่ใส่ชื่อ เบอร์ติดต่อ หรือข้อมูลที่ระบุตัวบุคคลโดยตรง"],
          ["7. เราใช้คำตอบอย่างไร", "คำตอบถูกใช้เพื่อสร้างผลการประเมิน คำอธิบาย และคำแนะนำที่เกี่ยวข้อง และอาจใช้เพื่อให้แบบประเมินทำงาน ดูประวัติสำหรับผู้ที่เข้าสู่ระบบ แก้ไขปัญหาความเสถียร และป้องกันการใช้งานที่ไม่เหมาะสม ผลการประเมินไม่ได้ใช้เป็นคำตัดสินคุณค่าหรือตัวตนของคุณ"],
          ["8. การประมวลผลด้วย AI", "บางส่วนของแบบประเมินอาจถูกวิเคราะห์ด้วย AI เพื่อสร้างผลลัพธ์และคำอธิบาย ระบบปัจจุบันสามารถใช้ OpenAI และ Gemini เป็นผู้ให้บริการ AI ตามการตั้งค่าของระบบ และมีการประมวลผลสำรองภายในเมื่อบริการ AI ภายนอกใช้งานไม่ได้ ข้อมูลที่ส่งให้ AI ควรจำกัดเฉพาะสิ่งที่จำเป็นต่อแบบประเมิน AI อาจสร้างผลลัพธ์ที่ผิด ไม่ครบ หรือทำให้เข้าใจผิดได้ ดังนั้นผลลัพธ์จาก AI ไม่ควรถูกมองว่าเป็นการวินิจฉัยหรือความจริงที่แน่นอน"],
          ["9. ใครอาจประมวลผลข้อมูล", "SafeSpace ต้องพึ่งพาบริการทางเทคนิคสำหรับการเข้าสู่ระบบ ฐานข้อมูล ฟังก์ชันเซิร์ฟเวอร์ และการวิเคราะห์ด้วย AI โครงการปัจจุบันใช้ Supabase สำหรับระบบหลังบ้าน ใช้ Google เมื่อเลือกเข้าสู่ระบบด้วย Google และใช้ผู้ให้บริการ AI เมื่อเปิดการวิเคราะห์ด้วย AI ผู้ให้บริการเหล่านี้มีระบบ ข้อกำหนด และแนวทางความเป็นส่วนตัวของตนเอง SafeSpace ไม่ได้อ้างว่าการประมวลผลโดยบุคคลที่สามไม่มีความเสี่ยง"],
          ["10. ผลลัพธ์ของผู้ที่เข้าสู่ระบบ", "หากคุณเข้าสู่ระบบ ผลการประเมินอาจถูกเก็บไว้กับบัญชี SafeSpace เพื่อให้ฟังก์ชัน เช่น ประวัติการประเมิน ทำงานได้ ข้อมูลแบบประเมินส่วนตัวไม่ได้มีวัตถุประสงค์ให้กลายเป็นโพสต์สาธารณะเพียงเพราะคุณใช้ SafeSpace ระบบมีการควบคุมสิทธิ์เพื่อจำกัดการเข้าถึงข้อมูลส่วนตัว"],
          ["11. ผลลัพธ์ของผู้เยี่ยมชม", "หากใช้แบบประเมินในโหมดผู้เยี่ยมชม ผลลัพธ์มีวัตถุประสงค์ให้อยู่ในประสบการณ์ของเบราว์เซอร์หรือเซสชันปัจจุบัน และไม่บันทึกเข้าบัญชี SafeSpace อย่างไรก็ตาม โหมดผู้เยี่ยมชมไม่ควรถูกเข้าใจว่าเป็นการรับประกันว่าไม่สามารถระบุตัวตนได้อย่างสมบูรณ์ เพราะพื้นที่จัดเก็บของเบราว์เซอร์ การตั้งค่าอุปกรณ์ เครือข่าย หรือระบบทางเทคนิคอื่นอาจมีพฤติกรรมแตกต่างกัน"],
          ["12. แบบประเมินกับ Community แตกต่างกัน", "แบบประเมินส่วนตัวแยกจากโพสต์และความคิดเห็นใน Community ข้อมูลที่คุณตั้งใจเผยแพร่ใน Community อาจมองเห็นได้โดยผู้ใช้อื่นและอาจถูกดูแลโดยระบบหรือผู้ดูแล การยอมรับนโยบายแบบประเมินนี้ไม่ได้ทำให้ข้อมูลที่คุณโพสต์ใน Community กลายเป็นข้อมูลส่วนตัว ห้ามเผยแพร่รหัสผ่าน ข้อมูลติดต่อ ข้อมูลสุขภาพที่ไม่จำเป็น หรือข้อมูลส่วนตัวของผู้อื่น"],
          ["13. การป้องกันด้านความปลอดภัย", "SafeSpace ใช้มาตรการทางเทคนิคเพื่อลดความเสี่ยงจากการเข้าถึงโดยไม่ได้รับอนุญาตและการใช้งานที่ไม่เหมาะสม เช่น การยืนยันตัวตน การควบคุมสิทธิ์ฐานข้อมูล Row Level Security การตรวจสอบข้อมูลฝั่งเซิร์ฟเวอร์ การจำกัดขนาดคำขอ การจำกัดอัตราการใช้งาน และฟังก์ชันเซิร์ฟเวอร์ที่มีการป้องกัน มาตรการเหล่านี้ช่วยลดความเสี่ยง แต่ไม่มีบริการอินเทอร์เน็ตใดปลอดภัยได้อย่างสมบูรณ์ ควรใช้รหัสผ่านที่รัดกุมและไม่ซ้ำกับบริการอื่น"],
          ["14. เด็กและวัยรุ่น", "SafeSpace อาจถูกใช้งานโดยวัยรุ่นและผู้ใช้อายุน้อย ระบบออกแบบให้พยายามอธิบายการใช้ข้อมูลอย่างชัดเจนและหลีกเลี่ยงการขอข้อมูลที่ระบุตัวตนโดยไม่จำเป็น หากไม่แน่ใจว่าควรให้ข้อมูลอะไร หรือคำถามทำให้รู้สึกไม่สบายใจ ควรพิจารณาปรึกษาผู้ปกครอง ครู ที่ปรึกษา หรือผู้ใหญ่ที่ไว้ใจได้ก่อนดำเนินการต่อ และไม่ควรพึ่งพา SafeSpace เพียงอย่างเดียวเมื่อจำเป็นต้องได้รับความช่วยเหลือจากผู้เชี่ยวชาญหรือความช่วยเหลือเร่งด่วน"],
          ["15. ผลลัพธ์เป็นการวินิจฉัยหรือไม่", "ไม่ใช่ SafeSpace Assessment ไม่ได้วินิจฉัยภาวะซึมเศร้า ความวิตกกังวล หรือภาวะทางการแพทย์หรือจิตวิทยาอื่น ๆ ผลลัพธ์เป็นการตีความคำตอบด้วยความช่วยเหลือจาก AI ผู้เชี่ยวชาญที่มีคุณสมบัติเหมาะสมเท่านั้นจึงสามารถประเมิน วินิจฉัย หรือรักษาในเชิงวิชาชีพได้"],
          ["16. ถ้าผลลัพธ์ไม่ตรงกับฉัน", "ผลลัพธ์จาก AI อาจผิดหรือไม่ครบถ้วน ประสบการณ์จริงของคุณสำคัญ และไม่ควรบังคับตัวเองให้เชื่อผลลัพธ์ที่ไม่ตรงกับความรู้สึกหรือสถานการณ์ หากผลลัพธ์ทำให้กังวล สับสน หรือชี้ว่าคุณอาจต้องการความช่วยเหลือเพิ่มเติม ควรพิจารณาพูดคุยกับผู้ใหญ่ที่ไว้ใจได้หรือผู้เชี่ยวชาญที่เหมาะสม"],
          ["17. การเก็บรักษาและการลบข้อมูล", "ข้อมูลแบบประเมินของผู้ที่เข้าสู่ระบบอาจคงอยู่กับบัญชีจนกว่าจะถูกลบผ่านฟังก์ชันที่มีหรือกระบวนการของผู้ดูแลที่ได้รับอนุญาต ผลลัพธ์ของผู้เยี่ยมชมไม่ได้มีวัตถุประสงค์ให้เก็บเป็นระเบียนในบัญชี เนื่องจาก SafeSpace ปัจจุบันเป็นโครงการเพื่อการศึกษา ความสามารถในการเก็บรักษาและลบข้อมูลอาจจำกัดกว่าระบบคลินิกเชิงพาณิชย์ และ SafeSpace จะไม่รับประกันว่าข้อมูลจะถูกลบออกจากทุกระบบทางเทคนิคทันทีหากระบบไม่ได้รองรับสิ่งนั้นจริง"],
          ["18. สิทธิในการเลือกและการเข้าร่วม", "คุณเลือกที่จะไม่ทำแบบประเมินได้ สามารถออกก่อนส่งคำตอบได้ และควรดำเนินการต่อเมื่อเข้าใจนโยบายและสบายใจกับการประมวลผลข้อมูลตามที่อธิบายไว้ หากปิดนโยบายโดยไม่ยอมรับ คุณจะไม่เข้าสู่แบบประเมิน"],
          ["19. เหตุฉุกเฉินและสถานการณ์เร่งด่วน", "SafeSpace ไม่ใช่บริการฉุกเฉินและไม่สามารถติดตามหรือปกป้องคุณได้ตลอดเวลา หากคุณหรือผู้อื่นอยู่ในอันตรายทันทีหรือต้องการความช่วยเหลือเร่งด่วน อย่ารอผลการประเมิน ให้ติดต่อหน่วยบริการฉุกเฉินที่เหมาะสม ผู้ใหญ่ที่ไว้ใจได้ หรือบริการช่วยเหลือจากผู้เชี่ยวชาญ ในประเทศไทยสามารถติดต่อสายด่วนสุขภาพจิต กรมสุขภาพจิต 1323"],
          ["20. การเปลี่ยนแปลงนโยบาย", "SafeSpace อาจเปลี่ยนคำถาม ระบบ AI มาตรการความปลอดภัย วิธีจัดเก็บข้อมูล หรือบริการภายนอกเมื่อโครงการพัฒนา นโยบายนี้จึงอาจมีการปรับปรุง หากมีการเปลี่ยนแปลงสำคัญเกี่ยวกับการจัดการข้อมูลแบบประเมิน ควรอัปเดตนโยบายที่เผยแพร่ และอาจขอให้ผู้ใช้ทบทวนนโยบายอีกครั้งก่อนทำแบบประเมินในอนาคต"],
          ["21. การยอมรับนโยบายนี้หมายความว่าอย่างไร", "เมื่อเลือก ยอมรับและดำเนินการต่อ หลังจากเลื่อนอ่านถึงท้ายเอกสาร คุณยืนยันว่าได้มีโอกาสอ่านและเข้าใจว่าแบบประเมินทำงานอย่างไร ใช้ข้อมูลอะไร AI อาจเข้ามาเกี่ยวข้องอย่างไร ผลลัพธ์ของสมาชิกและผู้เยี่ยมชมแตกต่างกันอย่างไร และข้อจำกัดสำคัญคืออะไร จากนั้นคุณจึงเลือกโดยสมัครใจว่าจะดำเนินการต่อภายใต้เงื่อนไขที่อธิบายไว้"]
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
                  <span className="shrink-0 text-xs text-sky-300 rounded-full border border-sky-500/20 bg-sky-500/5 px-3 py-1.5">{lang === "en" ? "Required before assessment" : "ต้องอ่านและยอมรับก่อนทำแบบประเมิน"}</span>
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
