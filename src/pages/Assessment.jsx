import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Check, Heart, LogIn, UserPlus, Sparkles, Shield, User as UserIcon, ShieldAlert, Home as HomeIcon, GraduationCap, Users as UsersIcon, Apple } from "lucide-react";
import { assessmentCategories } from "@/lib/assessmentQuestions";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
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

      const res = await base44.functions.invoke("analyzeAssessment", {
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

  // Intro step — ask age (and nationality if English) before questions
  if (step === "intro") {
    const canStart = ageInput && Number(ageInput) > 0 && (lang !== "en" || nationality);
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 w-full space-y-5"
        >
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-100">{t("assess.intro.title")}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{t("assess.intro.subtitle")}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">{t("assess.intro.ageLabel")}</label>
            <input
              type="number"
              min="1"
              max="120"
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              placeholder={t("assess.intro.agePlaceholder")}
              className="w-full text-sm text-slate-200 p-3 rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-slate-600 placeholder:text-slate-500"
            />
          </div>

          {lang === "en" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">{t("assess.intro.natTitle")}</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setNationality("thai")}
                  className={`w-full text-left text-sm px-4 py-3 rounded-xl border transition-all ${
                    nationality === "thai"
                      ? "border-rose-400/60 bg-rose-500/10 text-slate-100 font-medium"
                      : "border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  {t("assess.intro.natThai")}
                </button>
                <button
                  onClick={() => setNationality("foreigner")}
                  className={`w-full text-left text-sm px-4 py-3 rounded-xl border transition-all ${
                    nationality === "foreigner"
                      ? "border-rose-400/60 bg-rose-500/10 text-slate-100 font-medium"
                      : "border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  {t("assess.intro.natForeigner")}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl text-center border border-red-500/20">
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (!ageInput || Number(ageInput) <= 0) {
                setError(t("assess.intro.ageRequired"));
                return;
              }
              if (lang === "en" && !nationality) {
                setError(t("assess.intro.ageRequired"));
                return;
              }
              setError(null);
              setStep("chapter");
            }}
            disabled={!canStart}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 text-sm font-semibold py-3 rounded-2xl hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="w-4 h-4" />
            {t("assess.intro.start")}
          </motion.button>
        </motion.div>
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
