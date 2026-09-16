// Offline classical screening model.
// Uses deterministic weighted features + safety rules. No API, model download, or quota.
// This is a screening aid, not a medical diagnosis.

import { assessmentCategories } from "./assessmentQuestions";

const CATEGORY_WEIGHTS = {
  individual: 1.15,
  bullying: 1.05,
  family: 1.0,
  study: 0.9,
  social: 1.0,
  health: 0.9,
  lifeskills: 1.2,
};

const normalize = (value) => String(value || "").toLowerCase();

const questionWeight = (question) => {
  const text = normalize(question);
  if (/ทำร้ายตัวเอง|ฆ่าตัวตาย|self[- ]?harm|suicide/.test(text)) return 3.0;
  if (/เศร้า|หมดหวัง|ไม่มีคุณค่า|worthless|guilty|sad|hopeless/.test(text)) return 1.6;
  if (/นอน|sleep|insomnia|กินอาหาร|appetite|eat/.test(text)) return 1.25;
  if (/โดดเดี่ยว|เหงา|lonely|isolated/.test(text)) return 1.2;
  return 1.0;
};

const answerSeverity = (question, answer, options) => {
  const index = options.indexOf(answer);
  if (index < 0) return { score: 0, selfRisk: false };
  const maxIndex = Math.max(1, options.length - 1);
  const normalized = index / maxIndex;
  const selfRisk =
    /ทำร้ายตัวเอง|ฆ่าตัวตาย|self[- ]?harm|suicide/.test(normalize(question)) &&
    index >= 2;
  return { score: normalized, selfRisk };
};

export function computeAssessmentResult(answers = [], language = "th") {
  const isEnglish = language === "en";
  let weightedSum = 0;
  let totalWeight = 0;
  let hasSelfHarmRisk = false;
  const categoryScores = {};
  const matchedPatterns = new Set();

  for (const category of assessmentCategories) {
    const qs = category.questions.th || category.questions.en || [];
    let categoryWeighted = 0;
    let categoryWeightTotal = 0;

    qs.forEach((q, index) => {
      const enQ = category.questions.en?.[index];
      const found = answers.find(
        (item) => item?.question === q.q || item?.question === enQ?.q
      );
      if (!found) return;

      const sourceQuestion = found.question === enQ?.q ? enQ : q;
      const options = sourceQuestion?.options || q.options || [];
      const { score, selfRisk } = answerSeverity(sourceQuestion?.q, found.answer, options);
      const weight = (CATEGORY_WEIGHTS[category.id] || 1) * questionWeight(sourceQuestion?.q);

      weightedSum += score * weight;
      totalWeight += weight;
      categoryWeighted += score * weight;
      categoryWeightTotal += weight;

      if (selfRisk) hasSelfHarmRisk = true;

      const text = normalize(`${sourceQuestion?.q} ${found.answer}`);
      if (score > 0 && /กลั่นแกล้ง|bully/.test(text)) matchedPatterns.add("bullying");
      if (score > 0 && /เรียน|school|study|exam/.test(text)) matchedPatterns.add("study");
      if (score > 0 && /ครอบครัว|family|บ้าน/.test(text)) matchedPatterns.add("family");
      if (score > 0 && /เพื่อน|friend|lonely|เหงา|โดดเดี่ยว/.test(text)) matchedPatterns.add("social");
      if (score > 0 && /นอน|sleep|กิน|อาหาร|appetite/.test(text)) matchedPatterns.add("health");
      if (score > 0 && /กังวล|เครียด|วิตก|worry|stress|anxious/.test(text)) matchedPatterns.add("stress");
    });

    if (categoryWeightTotal > 0) {
      categoryScores[category.id] = categoryWeighted / categoryWeightTotal;
    }
  }

  let riskScore = totalWeight
    ? Math.round((weightedSum / totalWeight) * 100)
    : 0;

  // Safety override: a high-severity self-harm answer is never averaged away.
  if (hasSelfHarmRisk) riskScore = Math.max(riskScore, 76);

  const risk_level =
    riskScore >= 76
      ? "severe"
      : riskScore >= 51
        ? "high"
        : riskScore >= 26
          ? "moderate"
          : "low";

  const highCategories = Object.entries(categoryScores)
    .filter(([, value]) => value >= 0.6)
    .map(([id]) => {
      const category = assessmentCategories.find((item) => item.id === id);
      return category?.title?.[isEnglish ? "en" : "th"] || category?.title?.th || id;
    });

  return {
    risk_level,
    risk_score: riskScore,
    depression_chance: localLikelihood(risk_level, isEnglish),
    ai_summary: generateSummary(risk_level, highCategories, hasSelfHarmRisk, isEnglish),
    recommendations: generateRecommendations(risk_level, highCategories, hasSelfHarmRisk, matchedPatterns, isEnglish),
    similar_case: generatePatternSummary(highCategories, matchedPatterns, isEnglish),
    analysis_source: "offline-model",
  };
}

function localLikelihood(level, isEnglish) {
  const th = {
    low: "สัญญาณด้านอารมณ์และความเครียดโดยรวมอยู่ในระดับต่ำจากคำตอบที่ให้",
    moderate: "พบสัญญาณบางด้านที่ควรติดตามและดูแลเพิ่มเติมจากคำตอบที่ให้",
    high: "พบสัญญาณหลายด้านที่ควรได้รับความสนใจและการสนับสนุนเพิ่มเติม",
    severe: "พบสัญญาณที่ควรได้รับการช่วยเหลือโดยเร็ว โดยเฉพาะเมื่อมีคำตอบเกี่ยวกับความไม่ปลอดภัยหรือการทำร้ายตัวเอง",
  };
  const en = {
    low: "Overall emotional and stress-related signals are in a lower range based on the answers.",
    moderate: "Some areas may need more attention and support based on the answers.",
    high: "Several areas show higher levels of concern and may benefit from additional support.",
    severe: "Some signals should receive support promptly, especially when answers indicate possible safety concerns.",
  };
  return (isEnglish ? en : th)[level];
}

function generateSummary(level, high, selfRisk, isEnglish) {
  const base = isEnglish
    ? {
        low: "Based on the answers, the offline screening model found overall signals in a lower range.",
        moderate: "Based on the answers, the offline screening model found some areas that may need more attention and support.",
        high: "Based on the answers, the offline screening model found several areas with higher levels of concern and a need for additional support.",
        severe: "Based on the answers, the offline screening model found signs that should receive support promptly.",
      }[level]
    : {
        low: "จากคำตอบทั้งหมด ระบบคัดกรองแบบออฟไลน์ประเมินว่าสัญญาณด้านสุขภาพใจโดยรวมอยู่ในระดับต่ำ",
        moderate: "จากคำตอบทั้งหมด ระบบคัดกรองแบบออฟไลน์พบว่ามีบางด้านที่ควรให้ความสนใจและดูแลเพิ่มเติม",
        high: "จากคำตอบทั้งหมด ระบบคัดกรองแบบออฟไลน์พบสัญญาณหลายด้านที่อยู่ในระดับสูงและควรได้รับการสนับสนุนเพิ่มเติม",
        severe: "จากคำตอบทั้งหมด ระบบคัดกรองแบบออฟไลน์พบสัญญาณที่ควรได้รับความช่วยเหลือโดยเร็ว",
      }[level];

  const domain = high.length
    ? (isEnglish ? ` Main areas reflected in the answers include ${high.join(", ")}.` : ` ด้านที่เด่นขึ้นมา ได้แก่ ${high.join(", ")}.`)
    : "";
  const safety = selfRisk
    ? (isEnglish
        ? " Because an answer may indicate self-harm or safety concerns, tell a trusted adult or professional promptly."
        : " เนื่องจากมีคำตอบที่เกี่ยวข้องกับการทำร้ายตัวเองหรือความไม่ปลอดภัย ควรบอกผู้ใหญ่หรือผู้เชี่ยวชาญที่ไว้ใจได้โดยเร็ว.")
    : "";
  return `${base}.${domain}${safety} ${isEnglish ? "This is a preliminary screening result, not a medical diagnosis." : "ผลนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์"}`;
}

function generatePatternSummary(high, patterns, isEnglish) {
  const th = [];
  const en = [];
  if (patterns.has("stress")) { th.push("มีคำตอบที่สะท้อนความเครียดหรือความกังวล"); en.push("answers reflect stress or worry"); }
  if (patterns.has("social")) { th.push("มีสัญญาณเกี่ยวกับความโดดเดี่ยวหรือความสัมพันธ์"); en.push("there are signals around loneliness or relationships"); }
  if (patterns.has("health")) { th.push("มีสัญญาณเกี่ยวกับการนอนหรือการกิน"); en.push("there are signals around sleep or eating"); }

  if (!high.length && !th.length) return null;
  if (isEnglish) {
    const domain = high.length ? `The main patterns reflected in the answers include ${high.join(", ")}.` : "";
    const signals = en.length ? ` ${en.join(" and ")}.` : "";
    return `${domain}${signals} This describes patterns in the answers and is not a diagnosis.`;
  }
  const domain = high.length ? `รูปแบบที่เด่นในคำตอบคือ ${high.join(", ")}` : "";
  const signals = th.length ? ` ${th.join(" และ ")}.` : "";
  return `${domain}${signals} นี่เป็นการอธิบายรูปแบบของคำตอบ ไม่ใช่การวินิจฉัยโรค`;
}

function generateRecommendations(level, high, selfRisk, patterns, isEnglish) {
  const result = isEnglish
    ? [
        "Take regular breaks and make time for sleep, meals, and recovery.",
        "Talk with someone you trust, such as a parent, teacher, friend, or safe adult.",
      ]
    : [
        "พักให้เพียงพอและแบ่งเวลาจากสิ่งที่กดดันออกเป็นช่วงสั้น ๆ",
        "พูดคุยกับคนที่คุณไว้ใจ เช่น ผู้ปกครอง ครู เพื่อน หรือผู้ใหญ่ที่ปลอดภัย",
      ];

  if (patterns.has("study")) result.push(isEnglish
    ? "If school pressure is a major stressor, break tasks into smaller steps and ask a teacher or parent for support."
    : "ถ้าการเรียนเป็นตัวกดดัน ลองคุยกับครูหรือผู้ปกครองเพื่อแบ่งภาระออกเป็นส่วนเล็ก ๆ");
  if (patterns.has("bullying")) result.push(isEnglish
    ? "If bullying is happening, tell a trusted adult and keep relevant evidence when possible."
    : "หากมีการกลั่นแกล้ง ให้บอกผู้ใหญ่ที่ไว้ใจได้และเก็บหลักฐานเมื่อทำได้");
  if (patterns.has("social")) result.push(isEnglish
    ? "Stay close to people who make you feel safe rather than carrying everything alone."
    : "ลองอยู่ใกล้คนที่ทำให้รู้สึกปลอดภัยและไม่ต้องรับเรื่องทั้งหมดไว้คนเดียว");
  if (patterns.has("health")) result.push(isEnglish
    ? "Try to keep sleep, meals, and rest more regular."
    : "ลองจัดเวลานอน อาหาร และการพักให้สม่ำเสมอมากขึ้น");
  if (patterns.has("stress")) result.push(isEnglish
    ? "Try a short breathing or grounding exercise when stress rises."
    : "ลองใช้การหายใจช้า ๆ หรือ grounding สั้น ๆ เมื่อความเครียดพุ่งขึ้น");
  if (level === "high" || level === "severe") result.push(isEnglish
    ? "Consider talking with a mental-health professional for further support."
    : "พิจารณาพูดคุยกับผู้เชี่ยวชาญด้านสุขภาพจิตเพื่อประเมินเพิ่มเติม");
  if (selfRisk) result.push(isEnglish
    ? "If you feel unsafe, seek immediate help from a trusted adult or local emergency service."
    : "หากรู้สึกไม่ปลอดภัย ให้บอกผู้ใหญ่ที่ไว้ใจได้และขอความช่วยเหลือทันที");
  return [...new Set(result)].slice(0, 5);
}

