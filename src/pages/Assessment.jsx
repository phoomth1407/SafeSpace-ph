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
const policySections = [["1. What happens when you take the assessment?","The assessment asks you a series of questions about areas that may affect your wellbeing. Depending on the assessment, questions may relate to your feelings and emotions, experiences at school or home, relationships with other people, stress and everyday difficulties, your general wellbeing, and other relevant experiences. You choose the answers yourself. You should not provide unnecessary information such as your password, home address, phone number, school address, or other information that could directly identify you. You may stop using the assessment if you no longer want to continue."],["2. Why do we ask for your age?","Your age is requested because wellbeing experiences can differ between age groups. Age may provide context for your assessment, help interpret your answers appropriately, help the system understand which age group the assessment relates to, and support safer and more appropriate presentation of information. Your age is not intended to be used to judge you as a person."],["3. Why do we ask for nationality?","Nationality may provide additional context when interpreting an assessment and may help SafeSpace understand the background in which the assessment is being completed. You should provide only the information requested by the assessment. SafeSpace does not need your exact home location for this assessment."],["4. How are my answers processed?","After you submit the assessment, your answers may be processed by the SafeSpace application and its AI analysis system. The system can use your answers to generate an overall assessment result, explanations of patterns in your answers, areas that may deserve attention, and general suggestions that may be useful. AI systems can make mistakes. An AI-generated result should never be treated as a diagnosis or as absolute truth about you. If the result seems incorrect, confusing, or does not match how you actually feel, you should not assume that the system is necessarily correct."],["5. Does SafeSpace make decisions about me?","The assessment is intended to provide information to you. It should not be treated as a system that determines your value, character, future, or medical condition. An assessment result does not define who you are. Where AI is used, its output is generated from the information provided to the system and may contain errors or limitations. AI-related processing should be explained clearly, particularly for younger users."],["6. What information does SafeSpace receive?","Depending on how you use the application, information may include information you enter (age, nationality, assessment answers, and information you voluntarily provide in relevant features), account information associated with an account you create, and technical information necessary for the website or application to function, such as authentication/session information and requests sent to the service. SafeSpace does not need unnecessary identifying information inside assessment answers."],["7. What should I NOT put in my answers?","Please avoid entering information that is not necessary for the assessment. Do not intentionally include passwords, bank or payment information, exact home addresses, personal identification numbers, private account credentials, or someone else's private information. If a question asks about an experience, you can describe the experience without including identifying information about yourself or another person."],["8. What happens if I am signed in?","When you are signed in, assessment information may be associated with your account so the application can provide account-related features such as accessing relevant assessment information. Your assessment should be treated as private account information, not as a public post. Other users should not automatically be able to view your private assessment answers simply because they use SafeSpace."],["9. What happens if I use SafeSpace as a guest?","Guest assessment results are handled differently from signed-in account data. The application can provide a result without requiring an account. Guest results are intended to remain within the guest/session experience rather than becoming a permanent account record. However, browser storage and technical systems can behave differently depending on the device, browser, network, and application configuration. Do not treat guest mode as a guarantee of complete anonymity."],["10. Is my assessment public?","No. Your assessment information is separate from SafeSpace's community features. An assessment answer should not automatically become a community post, comment, or public profile. Community content is a separate feature with its own rules and processing. If you voluntarily post something publicly, that information should be treated differently from your private assessment."],["11. What about the SafeSpace community?","The community area allows users to interact with other users. This is different from the private assessment. Do not post private assessment information publicly unless you genuinely understand that other people may be able to see it. Do not publish your home address, passwords, private contact information, another person's private information, or information that could put you or another person at risk. SafeSpace may use AI-assisted processing for certain community features, but community processing and assessment processing are separate parts of the application."],["12. Who can see my information?","SafeSpace is designed so that private assessment information is not intentionally made public to other users. Some information must be processed by technical services that allow the application to operate, such as authentication services, database/storage services, AI processing services, and hosting or infrastructure services. These services exist to provide specific technical functions. SafeSpace should not represent third-party processing as completely risk-free. Third-party services can have their own infrastructure, security practices, and terms. Where third parties process personal information, users should be informed about that processing rather than being left to guess what happens to their data."],["13. How does SafeSpace protect information?","SafeSpace uses technical protections intended to reduce unauthorized access and misuse. Depending on the feature, these can include authentication, database access controls, row-level security, restricted access to private data, server-side validation, request/rate limiting, input validation, protection against oversized or malformed requests, and security controls around AI processing. These measures reduce risk, but no website or online service can honestly promise that security risk is zero. You should therefore avoid submitting information that does not need to be submitted."],["14. Does SafeSpace sell my assessment information?","Assessment information should not be treated as advertising material or as something that should simply be sold to other users. The assessment exists to provide the SafeSpace service. SafeSpace should only use information for purposes that are explained to users and supported by the project's actual implementation."],["15. Is my information used to advertise to me?","The assessment is not designed around using your private wellbeing answers to target advertising. If the service introduces a new type of data use in the future, the relevant privacy information should be updated before users are expected to rely on the new behavior."],["16. Can SafeSpace identify me from my answers?","You should assume that information you provide can potentially become associated with your account when you are signed in. Do not assume that writing something inside an assessment makes it anonymous. Even when an application does not directly ask for your name, combinations of information can sometimes make a person identifiable. This is why SafeSpace asks users not to include unnecessary identifying information."],["17. What happens to my information after the assessment?","The exact handling depends on how you use SafeSpace. For signed-in users, assessment records may remain associated with the account until they are deleted through available account functionality or an applicable administrative process. For guest users, results are intended to be handled within the guest/session experience rather than being stored as an account record. SafeSpace should not claim that information is immediately and permanently erased from every technical system unless the application actually guarantees that."],["18. Can I stop or leave the assessment?","Yes. Participation is voluntary. You can leave the assessment before submitting it. You do not have to answer a question simply because it appears on the screen. If a question makes you uncomfortable, you should consider whether continuing is appropriate for you."],["19. What if I am under 18?","SafeSpace may be used by teenagers and other younger users. Because younger users can require stronger privacy protections, SafeSpace aims to use high-privacy defaults and clear explanations rather than encouraging users to disclose unnecessary personal information. If you are unsure about what information you should provide, consider talking with a parent, guardian, teacher, counselor, or another trusted adult before continuing."],["20. Is this a diagnosis?","No. A SafeSpace result does not diagnose depression, anxiety, or another medical or psychological condition. It is an AI-assisted interpretation of the answers you provided. Only an appropriately qualified professional can provide a professional assessment or diagnosis."],["21. What if my result is wrong?","AI-generated results can be incomplete or incorrect. Your own experience matters. If your result does not seem to describe you accurately, do not force yourself to accept it simply because the system produced it. You can discuss your concerns with someone you trust or with an appropriate qualified professional."],["22. What if I need urgent help?","SafeSpace is not an emergency service. If you believe you or another person is in immediate danger, do not wait for an AI assessment result or rely on SafeSpace to handle the situation. Contact a trusted adult or an appropriate local emergency or professional support service. In Thailand, the Department of Mental Health hotline is 1323."],["23. Changes to SafeSpace","SafeSpace is an evolving project. The application, assessment questions, AI systems, security measures, and other features may change over time. If a change materially affects how personal information is handled, the relevant policy information should be updated accordingly. The policy should always show its current version and update date so users can understand which version they are accepting."],["24. Your acceptance","Before beginning the assessment, you are given an opportunity to read this policy. By selecting “Agree & Accept”, you confirm that you have read the policy, understand what the assessment does, understand that AI may process your answers, understand that the assessment is not a medical diagnosis, understand how your answers may be handled, understand that participation is voluntary, understand that you should not submit unnecessary sensitive information, and want to continue to the assessment. If you do not agree, you can leave the assessment without continuing."]];
    const policySectionsTh = [["1. เกิดอะไรขึ้นเมื่อคุณทำแบบประเมิน","แบบประเมินจะถามคำถามเกี่ยวกับสิ่งที่อาจส่งผลต่อสุขภาวะของคุณ เช่น ความรู้สึกและอารมณ์ ประสบการณ์ที่โรงเรียนหรือที่บ้าน ความสัมพันธ์ ความเครียดและปัญหาในชีวิตประจำวัน สุขภาวะโดยรวม และประสบการณ์อื่นที่เกี่ยวข้อง คุณเป็นผู้เลือกคำตอบเอง ไม่ควรให้ข้อมูลที่ไม่จำเป็น เช่น รหัสผ่าน ที่อยู่บ้าน เบอร์โทรศัพท์ ที่อยู่โรงเรียน หรือข้อมูลอื่นที่ระบุตัวคุณโดยตรง และคุณสามารถหยุดใช้แบบประเมินได้หากไม่ต้องการทำต่อ"],["2. ทำไมเราจึงถามอายุ","เราขออายุเพราะประสบการณ์ด้านสุขภาวะอาจแตกต่างกันตามช่วงวัย อายุอาจใช้เพื่อให้บริบทของแบบประเมิน ช่วยตีความคำตอบอย่างเหมาะสม ช่วยให้ระบบเข้าใจช่วงอายุที่เกี่ยวข้อง และช่วยให้แสดงข้อมูลได้ปลอดภัยและเหมาะสมยิ่งขึ้น อายุไม่ได้มีจุดประสงค์เพื่อตัดสินคุณ"],["3. ทำไมเราจึงถามสัญชาติ","สัญชาติอาจช่วยเพิ่มบริบทในการตีความแบบประเมินและช่วยให้ SafeSpace เข้าใจบริบทที่ทำแบบประเมิน คุณควรให้เฉพาะข้อมูลที่แบบประเมินร้องขอ และ SafeSpace ไม่จำเป็นต้องทราบตำแหน่งบ้านแบบละเอียดของคุณ"],["4. คำตอบของฉันถูกประมวลผลอย่างไร","หลังส่งแบบประเมิน คำตอบอาจถูกประมวลผลโดยแอป SafeSpace และระบบวิเคราะห์ AI เพื่อสร้างผลการประเมิน คำอธิบายรูปแบบในคำตอบ ประเด็นที่อาจควรใส่ใจ และคำแนะนำทั่วไป AI อาจผิดพลาดได้ ดังนั้นผลลัพธ์จาก AI ไม่ควรถูกมองว่าเป็นการวินิจฉัยหรือความจริงที่แน่นอน หากผลไม่ตรงกับคุณ อย่าคิดว่าระบบถูกต้องเสมอ"],["5. SafeSpace ตัดสินใจแทนฉันหรือไม่","แบบประเมินมีจุดประสงค์เพื่อให้ข้อมูลแก่คุณ ไม่ควรถูกมองว่าเป็นระบบที่กำหนดคุณค่า บุคลิก อนาคต หรือภาวะทางการแพทย์ของคุณ ผลการประเมินไม่ได้กำหนดว่าคุณเป็นใคร และผลจาก AI อาจมีข้อผิดพลาดหรือข้อจำกัด โดยเฉพาะเมื่อใช้งานกับผู้ใช้ที่อายุน้อยควรมีคำอธิบายที่ชัดเจน"],["6. SafeSpace ได้รับข้อมูลอะไรบ้าง","ข้อมูลอาจรวมถึงข้อมูลที่คุณกรอก เช่น อายุ สัญชาติ คำตอบ และข้อมูลที่คุณเลือกให้ในฟีเจอร์ที่เกี่ยวข้อง ข้อมูลบัญชีหากคุณสร้างบัญชี และข้อมูลทางเทคนิคที่จำเป็นต่อการทำงาน เช่น ข้อมูลการเข้าสู่ระบบ/เซสชันและคำขอที่ส่งมายังบริการ SafeSpace ไม่จำเป็นต้องให้ข้อมูลที่ระบุตัวตนโดยไม่จำเป็นในคำตอบ"],["7. ฉันไม่ควรใส่อะไรในคำตอบ","โปรดหลีกเลี่ยงข้อมูลที่ไม่จำเป็น เช่น รหัสผ่าน ข้อมูลธนาคารหรือการชำระเงิน ที่อยู่บ้านแบบละเอียด เลขประจำตัวประชาชน ข้อมูลเข้าสู่ระบบส่วนตัว หรือข้อมูลส่วนตัวของผู้อื่น หากเล่าประสบการณ์ สามารถเล่าโดยไม่ใส่ข้อมูลที่ระบุตัวคุณหรือผู้อื่นโดยตรง"],["8. ถ้าฉันเข้าสู่ระบบจะเกิดอะไรขึ้น","ข้อมูลแบบประเมินอาจเชื่อมโยงกับบัญชีเพื่อให้ฟีเจอร์ต่าง ๆ เช่น ประวัติการประเมินทำงานได้ ข้อมูลแบบประเมินควรถูกถือเป็นข้อมูลส่วนตัวของบัญชี ไม่ใช่โพสต์สาธารณะ และผู้ใช้อื่นไม่ควรเข้าถึงคำตอบส่วนตัวของคุณโดยอัตโนมัติเพียงเพราะใช้ SafeSpace"],["9. ถ้าใช้ SafeSpace แบบผู้เยี่ยมชมจะเกิดอะไรขึ้น","ผลแบบประเมินของผู้เยี่ยมชมถูกจัดการต่างจากข้อมูลบัญชี ระบบสามารถให้ผลโดยไม่ต้องสร้างบัญชี และผลมีจุดประสงค์ให้อยู่ในประสบการณ์ของผู้เยี่ยมชม/เซสชันแทนการเป็นระเบียนถาวรของบัญชี อย่างไรก็ตามพฤติกรรมของเบราว์เซอร์ อุปกรณ์ เครือข่าย และระบบทางเทคนิคอาจแตกต่างกัน จึงไม่ควรมองโหมดผู้เยี่ยมชมว่าเป็นการรับประกันความไม่ระบุตัวตนโดยสมบูรณ์"],["10. แบบประเมินของฉันเป็นสาธารณะหรือไม่","ไม่ ข้อมูลแบบประเมินแยกจากฟีเจอร์ชุมชน คำตอบไม่ควรกลายเป็นโพสต์ ความคิดเห็น หรือโปรไฟล์สาธารณะโดยอัตโนมัติ เนื้อหาชุมชนเป็นฟีเจอร์แยกที่มีกฎและการประมวลผลของตัวเอง หากคุณเลือกโพสต์ข้อมูลสู่สาธารณะโดยสมัครใจ ข้อมูลนั้นควรถูกถือว่าแตกต่างจากแบบประเมินส่วนตัว"],["11. แล้วชุมชน SafeSpace ล่ะ","พื้นที่ชุมชนเปิดให้ผู้ใช้โต้ตอบกัน ซึ่งแตกต่างจากแบบประเมินส่วนตัว อย่าโพสต์ข้อมูลจากแบบประเมินส่วนตัวต่อสาธารณะโดยไม่เข้าใจว่าคนอื่นอาจเห็นได้ และอย่าเผยแพร่ที่อยู่บ้าน รหัสผ่าน ข้อมูลติดต่อส่วนตัว ข้อมูลส่วนตัวของผู้อื่น หรือข้อมูลที่อาจทำให้คุณหรือผู้อื่นตกอยู่ในความเสี่ยง SafeSpace อาจใช้ AI กับฟีเจอร์ชุมชนบางส่วน แต่การประมวลผลชุมชนและแบบประเมินเป็นคนละส่วน"],["12. ใครสามารถเห็นข้อมูลของฉัน","SafeSpace ออกแบบให้ข้อมูลแบบประเมินส่วนตัวไม่ถูกเผยแพร่ให้ผู้ใช้อื่นโดยตั้งใจ แต่บริการทางเทคนิคบางอย่างอาจต้องประมวลผลข้อมูลเพื่อให้ระบบทำงาน เช่น ระบบยืนยันตัวตน ฐานข้อมูล/พื้นที่จัดเก็บ บริการ AI และโฮสติ้งหรือโครงสร้างพื้นฐาน บริการเหล่านี้มีระบบ ข้อกำหนด และแนวทางความปลอดภัยของตนเอง SafeSpace ไม่ควรอ้างว่าการประมวลผลโดยบุคคลที่สามไม่มีความเสี่ยง"],["13. SafeSpace ปกป้องข้อมูลอย่างไร","SafeSpace ใช้มาตรการทางเทคนิคเพื่อลดการเข้าถึงโดยไม่ได้รับอนุญาตและการใช้งานที่ไม่เหมาะสม เช่น การยืนยันตัวตน การควบคุมการเข้าถึงฐานข้อมูล Row-level security การจำกัดข้อมูลส่วนตัว การตรวจสอบฝั่งเซิร์ฟเวอร์ การจำกัดคำขอ การตรวจสอบข้อมูล การป้องกันคำขอขนาดใหญ่หรือผิดรูปแบบ และมาตรการด้านความปลอดภัยของ AI มาตรการเหล่านี้ลดความเสี่ยง แต่ไม่มีเว็บไซต์ใดรับประกันความเสี่ยงเป็นศูนย์ได้"],["14. SafeSpace ขายข้อมูลแบบประเมินหรือไม่","ข้อมูลแบบประเมินไม่ควรถูกถือเป็นสื่อโฆษณาหรือสิ่งที่นำไปขายให้ผู้ใช้อื่นโดยง่าย แบบประเมินมีไว้เพื่อให้บริการ SafeSpace และควรใช้ข้อมูลตามวัตถุประสงค์ที่อธิบายแก่ผู้ใช้และสอดคล้องกับการทำงานจริงของโครงการ"],["15. ข้อมูลของฉันถูกใช้เพื่อโฆษณาหรือไม่","แบบประเมินไม่ได้ออกแบบมาเพื่อใช้คำตอบด้านสุขภาวะส่วนตัวของคุณเพื่อกำหนดโฆษณา หากอนาคตมีการใช้ข้อมูลรูปแบบใหม่ ควรอัปเดตข้อมูลความเป็นส่วนตัวที่เกี่ยวข้องก่อนให้ผู้ใช้พึ่งพาพฤติกรรมใหม่นั้น"],["16. SafeSpace ระบุตัวฉันจากคำตอบได้หรือไม่","หากเข้าสู่ระบบ ควรถือว่าข้อมูลที่ให้สามารถเชื่อมโยงกับบัญชีได้ จึงไม่ควรคิดว่าการเขียนบางอย่างในแบบประเมินทำให้เป็นนิรนาม แม้ระบบไม่ถามชื่อโดยตรง การรวมข้อมูลหลายอย่างอาจทำให้ระบุตัวบุคคลได้ จึงควรหลีกเลี่ยงข้อมูลที่ระบุตัวตนโดยไม่จำเป็น"],["17. หลังทำแบบประเมินแล้วข้อมูลจะเกิดอะไรขึ้น","การจัดการข้อมูลขึ้นอยู่กับวิธีที่คุณใช้ SafeSpace สำหรับผู้ที่เข้าสู่ระบบ ระเบียนแบบประเมินอาจยังเชื่อมกับบัญชีจนกว่าจะถูกลบผ่านฟังก์ชันที่มีหรือกระบวนการของผู้ดูแลที่เกี่ยวข้อง สำหรับผู้เยี่ยมชม ผลมีจุดประสงค์ให้อยู่ในประสบการณ์ของผู้เยี่ยมชม/เซสชันแทนการเก็บเป็นระเบียนบัญชี และ SafeSpace ไม่ควรรับประกันว่าข้อมูลจะถูกลบจากทุกระบบทางเทคนิคทันทีหากระบบไม่ได้รับประกันจริง"],["18. ฉันหยุดหรือออกจากแบบประเมินได้ไหม","ได้ การเข้าร่วมเป็นไปโดยสมัครใจ คุณสามารถออกก่อนส่งคำตอบ และไม่จำเป็นต้องตอบคำถามเพียงเพราะคำถามปรากฏบนหน้าจอ หากคำถามทำให้ไม่สบายใจ ควรพิจารณาว่าการทำต่อเหมาะสมกับคุณหรือไม่"],["19. ถ้าฉันอายุต่ำกว่า 18 ปีล่ะ","SafeSpace อาจถูกใช้โดยวัยรุ่นและผู้ใช้อายุน้อย เนื่องจากผู้ใช้อายุน้อยอาจต้องการการคุ้มครองความเป็นส่วนตัวมากขึ้น SafeSpace จึงมุ่งใช้ค่าเริ่มต้นที่เน้นความเป็นส่วนตัวและคำอธิบายที่ชัดเจน หากไม่แน่ใจว่าควรให้ข้อมูลอะไร ควรพิจารณาพูดคุยกับพ่อแม่ ผู้ปกครอง ครู ที่ปรึกษา หรือผู้ใหญ่ที่ไว้ใจก่อนดำเนินการ"],["20. นี่เป็นการวินิจฉัยหรือไม่","ไม่ ผลลัพธ์ SafeSpace ไม่ได้วินิจฉัยภาวะซึมเศร้า ความวิตกกังวล หรือภาวะทางการแพทย์หรือจิตวิทยาอื่น ๆ แต่เป็นการตีความคำตอบด้วยความช่วยเหลือจาก AI การประเมิน วินิจฉัย หรือรักษาอย่างมืออาชีพต้องทำโดยผู้เชี่ยวชาญที่มีคุณสมบัติเหมาะสม"],["21. ถ้าผลลัพธ์ผิดล่ะ","ผลจาก AI อาจไม่ครบหรือผิดพลาด ประสบการณ์จริงของคุณสำคัญ หากผลไม่ตรงกับคุณ อย่าบังคับตัวเองให้เชื่อเพียงเพราะระบบสร้างผลนั้นขึ้นมา คุณสามารถพูดคุยกับคนที่ไว้ใจหรือผู้เชี่ยวชาญที่เหมาะสมได้"],["22. ถ้าฉันต้องการความช่วยเหลือเร่งด่วนล่ะ","SafeSpace ไม่ใช่บริการฉุกเฉิน หากคุณหรือผู้อื่นอยู่ในอันตรายทันที อย่ารอผลจาก AI และอย่าพึ่ง SafeSpace ให้จัดการสถานการณ์ ให้ติดต่อผู้ใหญ่ที่ไว้ใจ หน่วยบริการฉุกเฉินที่เหมาะสม หรือบริการช่วยเหลือจากผู้เชี่ยวชาญ ในประเทศไทยสามารถติดต่อสายด่วนสุขภาพจิต กรมสุขภาพจิต 1323"],["23. การเปลี่ยนแปลงของ SafeSpace","SafeSpace เป็นโครงการที่พัฒนาอย่างต่อเนื่อง แอป คำถาม ระบบ AI มาตรการความปลอดภัย และฟีเจอร์อื่นอาจเปลี่ยนแปลง หากการเปลี่ยนแปลงมีผลอย่างมีนัยสำคัญต่อการจัดการข้อมูลส่วนบุคคล ควรอัปเดตข้อมูลนโยบายที่เผยแพร่ และนโยบายควรแสดงเวอร์ชันและวันที่ปรับปรุงล่าสุดเสมอ"],["24. การยอมรับนโยบาย","ก่อนเริ่มแบบประเมิน คุณจะมีโอกาสอ่านนโยบายนี้ เมื่อเลือก “ยอมรับและดำเนินการต่อ” คุณยืนยันว่าได้อ่านนโยบาย เข้าใจว่าแบบประเมินทำอะไร เข้าใจว่า AI อาจประมวลผลคำตอบ เข้าใจว่าแบบประเมินไม่ใช่การวินิจฉัย เข้าใจการจัดการคำตอบ เข้าใจว่าการเข้าร่วมเป็นไปโดยสมัครใจ เข้าใจว่าไม่ควรส่งข้อมูลส่วนตัวที่ไม่จำเป็น และต้องการดำเนินการต่อ หากไม่ยอมรับ คุณสามารถออกจากแบบประเมินได้"]];
    const activePolicySections = lang === "en" ? policySections : policySectionsTh;
    const policyTitle = lang === "en" ? "SafeSpace Assessment Policy" : "นโยบายการประเมินของ SafeSpace";

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
                  {activePolicySections.map(([heading, body]) => (
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
