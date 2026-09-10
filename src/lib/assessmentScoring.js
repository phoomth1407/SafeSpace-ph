// Rule-based screening score used by the offline/GitHub Pages build.
// This is a screening aid, not a medical diagnosis.
import { assessmentCategories } from "./assessmentQuestions";

export function computeAssessmentResult(answers, language = "th") {
  const lang = language === "en" ? "en" : "th";
  let totalScore = 0;
  let maxScore = 0;
  const categoryScores = {};

  assessmentCategories.forEach((cat) => {
    let catScore = 0;
    const qs = cat.questions[lang] || cat.questions.th || cat.questions.en || [];
    const catMax = qs.length * 3;

    qs.forEach((q, idx) => {
      const thQ = cat.questions.th?.[idx];
      const enQ = cat.questions.en?.[idx];
      const answer = answers.find(
        (a) => a.question === q.q || a.question === thQ?.q || a.question === enQ?.q
      );
      if (!answer) return;

      const questionDef = answer.question === enQ?.q ? enQ : answer.question === thQ?.q ? thQ : q;
      const optionIndex = questionDef.options.indexOf(answer.answer);
      if (optionIndex >= 0) catScore += optionIndex;
    });

    const categoryName = cat.title?.[lang] || cat.title?.th || cat.id;
    categoryScores[cat.id] = {
      id: cat.id,
      name: categoryName,
      score: catScore,
      max: catMax,
      pct: catMax ? catScore / catMax : 0,
    };

    totalScore += catScore;
    maxScore += catMax;
  });

  const normalizedScore = maxScore
    ? Math.round((totalScore / maxScore) * 100)
    : 0;

  const risk_level =
    normalizedScore >= 76
      ? "severe"
      : normalizedScore >= 51
        ? "high"
        : normalizedScore >= 26
          ? "moderate"
          : "low";

  const notableCategories = Object.values(categoryScores)
    .filter((v) => v.pct >= 0.5)
    .sort((a, b) => b.pct - a.pct);

  const summary = generateSummary(risk_level, notableCategories, lang);
  const analysis = generateAnalysis(risk_level, notableCategories, lang);
  const recommendations = generateRecommendations(notableCategories, lang);

  return {
    risk_level,
    risk_score: normalizedScore,
    screening_type: "wellbeing",
    depression_chance: analysis,
    ai_summary: summary,
    recommendations,
    similar_case: generateFactors(notableCategories, lang),
    category_scores: categoryScores,
  };
}

function levelLabel(level, lang) {
  const labels = lang === "en"
    ? { low: "lower concern", moderate: "moderate concern", high: "higher concern", severe: "substantial concern" }
    : { low: "ข้อกังวลค่อนข้างต่ำ", moderate: "ข้อกังวลระดับปานกลาง", high: "ข้อกังวลค่อนข้างสูง", severe: "ข้อกังวลค่อนข้างมาก" };
  return labels[level] || labels.moderate;
}

function generateSummary(level, notable, lang) {
  const domainText = notable.slice(0, 3).map((v) => v.name).join(lang === "en" ? ", " : " และ ");
  if (lang === "en") {
    const base = `Your answers suggest ${levelLabel(level, lang)} in this screening.`;
    if (!domainText) return `${base} Most areas in your responses appear relatively manageable right now.`;
    return `${base} The areas standing out most in your responses are ${domainText}, so these are the areas most worth paying attention to right now.`;
  }
  const base = `จากคำตอบทั้งหมด ผลคัดกรองสะท้อน${levelLabel(level, lang)}`;
  if (!domainText) return `${base} และภาพรวมหลายด้านยังอยู่ในระดับที่จัดการได้`;
  return `${base} โดยด้านที่เด่นจากคำตอบของคุณคือ ${domainText} จึงเป็นด้านที่ควรใส่ใจเป็นพิเศษในช่วงนี้`;
}

function generateAnalysis(level, notable, lang) {
  const top = notable.slice(0, 3);
  if (!top.length) {
    return lang === "en"
      ? `${levelLabel(level, lang)} overall. Your responses do not show one clearly dominant area, so keeping your current routines and checking in with yourself over time may be useful.`
      : `ภาพรวมอยู่ใน${levelLabel(level, lang)} โดยยังไม่มีด้านใดเด่นชัดเป็นพิเศษจากคำตอบ จึงควรรักษากิจวัตรที่ช่วยให้คุณรับมือได้ดีและติดตามความรู้สึกของตัวเองต่อไป`;
  }

  if (lang === "en") {
    const parts = top.map((v) => `${v.name} (${Math.round(v.pct * 100)}% of the available concern range)`);
    return `${levelLabel(level, lang)} overall. Your answers show the strongest concern signals in ${parts.join(", ")}. This means the answers in these areas contributed most to the screening score; the result describes patterns in your responses, not a diagnosis.`;
  }
  const parts = top.map((v) => `${v.name} (${Math.round(v.pct * 100)}% ของช่วงคะแนนที่ประเมินได้)`);
  return `ภาพรวมอยู่ใน${levelLabel(level, lang)} โดยคำตอบที่ส่งผลต่อคะแนนมากที่สุดอยู่ที่ ${parts.join(", ")} ซึ่งหมายถึงด้านเหล่านี้มีคำตอบที่ควรให้ความสนใจมากกว่าด้านอื่น ผลนี้อธิบายรูปแบบจากคำตอบของคุณ ไม่ใช่การวินิจฉัย`;
}

function generateFactors(notable, lang) {
  if (!notable.length) return lang === "en" ? "No single survey area stood out strongly." : "ยังไม่มีด้านใดจากแบบสอบถามที่เด่นชัดเป็นพิเศษ";
  const top = notable.slice(0, 4);
  if (lang === "en") return `Key areas reflected in your answers: ${top.map((v) => `${v.name} (${Math.round(v.pct * 100)}%)`).join(", ")}.`;
  return `ด้านที่สะท้อนจากคำตอบมากที่สุด: ${top.map((v) => `${v.name} (${Math.round(v.pct * 100)}%)`).join(", ")}`;
}

function generateRecommendations(notable, lang) {
  const ids = new Set(notable.map((v) => v.id));
  const r = [];

  const add = (th, en) => r.push(lang === "en" ? en : th);
  if (ids.has("individual")) add("ลองจัดเวลาให้ตัวเองได้พักและใช้วิธีระบายความเครียดที่เหมาะกับคุณ เช่น เขียนความรู้สึกหรือทำกิจกรรมที่ช่วยให้ใจสงบ", "Give yourself regular time to rest and use a healthy way to release stress, such as writing down your feelings or doing a calming activity.");
  if (ids.has("bullying")) add("หากมีการกลั่นแกล้งหรือการปฏิบัติที่ทำให้คุณรู้สึกไม่ปลอดภัย ควรบอกผู้ปกครอง ครู หรือผู้ใหญ่ที่ไว้ใจได้ เพื่อช่วยจัดการสถานการณ์", "If bullying or treatment from others is affecting you, tell a parent, teacher, or trusted adult so you do not have to handle the situation alone.");
  if (ids.has("family")) add("ลองหาเวลาพูดคุยกับคนในครอบครัวที่คุณไว้ใจเกี่ยวกับเรื่องที่กำลังกดดัน และบอกให้ชัดว่าคุณต้องการการช่วยเหลือแบบไหน", "Try talking with a family member you trust about what is putting pressure on you and explain what kind of support would help.");
  if (ids.has("study")) add("แบ่งงานเรียนเป็นส่วนเล็ก ๆ ตั้งเป้าหมายระยะสั้น และลดการเปรียบเทียบตัวเองกับเพื่อน", "Break schoolwork into smaller steps, set short-term goals, and reduce comparisons between yourself and other students.");
  if (ids.has("social")) add("พยายามรักษาการติดต่อกับเพื่อนหรือคนที่ทำให้คุณรู้สึกได้รับการเข้าใจ และอย่าเก็บทุกอย่างไว้คนเดียว", "Stay connected with people who make you feel understood and supported, rather than carrying everything by yourself.");
  if (ids.has("health")) add("ให้ความสำคัญกับการนอน อาหาร และการพักผ่อน เพราะสิ่งเหล่านี้มีผลต่อการรับมือกับความเครียดในแต่ละวัน", "Pay attention to sleep, regular meals, and rest because these can affect how you handle everyday stress.");
  if (ids.has("lifeskills")) add("ลองฝึกวิธีรับมือเมื่อเจอปัญหา เช่น แบ่งปัญหาเป็นขั้นตอน ขอความช่วยเหลือ และใช้กิจกรรมที่ช่วยให้กลับมาสงบ", "Practice a simple coping plan for difficult moments: break the problem into steps, ask for help, and use activities that help you settle down.");

  if (r.length < 3) add("พูดคุยกับคนที่คุณไว้ใจเกี่ยวกับสิ่งที่กำลังกังวล", "Talk with someone you trust about what has been worrying you.");
  if (r.length < 3) add("ติดตามความรู้สึกของตัวเองต่อไป และสังเกตว่ามีด้านไหนเริ่มรบกวนชีวิตประจำวันมากขึ้นหรือไม่", "Keep checking in with yourself and notice whether any area starts to interfere more with your daily life.");
  return r.slice(0, 5);
}
