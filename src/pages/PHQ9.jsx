import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Brain, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "@/lib/i18n";
import { PHQ9_OPTIONS, PHQ9_QUESTIONS, scorePhq9, getPhq9BandLabel } from "@/lib/phq9";

export default function PHQ9() {
  const navigate = useNavigate();
  const { lang } = useTranslation();
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const question = PHQ9_QUESTIONS[current];
  const selected = answers[question.id];
  const result = useMemo(() => scorePhq9(answers), [answers]);

  const select = (value) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    setError("");
  };

  const submit = async () => {
    const complete = PHQ9_QUESTIONS.every((q) => answers[q.id] !== undefined);
    if (!complete) {
      setError(lang === "en" ? "Please answer every question." : "กรุณาตอบให้ครบทุกข้อ");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("analyzePhq9", {
        answers: result.answers,
        score: result.score,
        band: result.band,
        language: lang,
      });
      const data = res?.data || {};
      navigate("/result", { state: { result: { ...data, phq9_score: result.score, phq9_band: result.band, screening_type: "phq9" }, isGuest: false } });
    } catch (err) {
      setError(err?.message || (lang === "en" ? "Analysis failed." : "วิเคราะห์ผลไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="w-4 h-4" />
        {lang === "en" ? "Back" : "ย้อนกลับ"}
      </button>

      <div className="bg-slate-900/60 rounded-3xl p-6 border border-slate-800">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">PHQ-9</h1>
            <p className="text-xs text-slate-400">
              {lang === "en" ? "9-item depression symptom screening" : "แบบคัดกรองอาการซึมเศร้า 9 ข้อ"}
            </p>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>{lang === "en" ? `Question ${current + 1} of 9` : `ข้อ ${current + 1} จาก 9`}</span>
            <span>{result.score}/27</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full transition-all" style={{ width: `${((current + 1) / 9) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="text-xs text-slate-500 mb-2">{lang === "en" ? "Over the last 2 weeks" : "ในช่วง 2 สัปดาห์ที่ผ่านมา"}</div>
            <h2 className="text-base font-semibold text-slate-100 leading-relaxed">{question[lang] || question.th}</h2>
          </div>

          <div className="grid gap-2">
            {PHQ9_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => select(option.value)}
                className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${selected === option.value ? "border-purple-300 bg-purple-400/10 text-slate-100" : "border-slate-800 text-slate-300 hover:border-slate-700"}`}
              >
                {option[lang] || option.th}
              </button>
            ))}
          </div>

          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>}

          <div className="flex items-center gap-3 pt-2">
            <button disabled={current === 0} onClick={() => setCurrent((v) => v - 1)} className="flex-1 py-3 rounded-2xl border border-slate-800 text-slate-300 disabled:opacity-30 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {lang === "en" ? "Previous" : "ก่อนหน้า"}
            </button>
            {current < 8 ? (
              <button disabled={selected === undefined} onClick={() => setCurrent((v) => v + 1)} className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-900 font-semibold disabled:opacity-30 flex items-center justify-center gap-2">
                {lang === "en" ? "Next" : "ถัดไป"}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button disabled={loading || selected === undefined} onClick={submit} className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-900 font-semibold disabled:opacity-30 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {loading ? (lang === "en" ? "Analyzing..." : "กำลังวิเคราะห์...") : (lang === "en" ? "See result" : "ดูผล")}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center leading-relaxed">
        {lang === "en" ? "PHQ-9 is a screening measure, not a diagnosis. A qualified professional should interpret results in context." : "PHQ-9 เป็นแบบคัดกรอง ไม่ใช่การวินิจฉัย และควรตีความร่วมกับบริบทโดยผู้เชี่ยวชาญ"}
      </p>
    </div>
  );
}
