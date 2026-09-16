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

export function computeAssessmentResult(answers = []) {
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
      if (/กลั่นแกล้ง|bully/.test(text)) matchedPatterns.add("bullying");
      if (/เรียน|school|study|exam/.test(text)) matchedPatterns.add("study");
      if (/ครอบครัว|family|บ้าน/.test(text)) matchedPatterns.add("family");
      if (/เพื่อน|friend|lonely|เหงา|โดดเดี่ยว/.test(text)) matchedPatterns.add("social");
      if (/นอน|sleep|กิน|อาหาร|appetite/.test(text)) matchedPatterns.add("health");
      if (/กังวล|เครียด|วิตก|worry|stress|anxious/.test(text)) matchedPatterns.add("stress");
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
      return category?.title?.th || id;
    });

  return {
    risk_level,
    risk_score: riskScore,
    depression_chance: localLikelihood(risk_level),
    ai_summary: generateSummary(risk_level, highCategories, hasSelfHarmRisk),
    recommendations: generateRecommendations(risk_level, highCategories, hasSelfHarmRisk, matchedPatterns),
    similar_case: generatePatternSummary(highCategories, matchedPatterns),
    analysis_source: "offline-model",
  };
}

function localLikelihood(level) {
  const messages = {
    low: "สัญญาณด้านอารมณ์และความเครียดโดยรวมอยู่ในระดับต่ำจากคำตอบที่ให้",
    moderate: "พบสัญญาณบางด้านที่ควรติดตามและดูแลเพิ่มเติมจากคำตอบที่ให้",
    high: "พบสัญญาณหลายด้านที่ควรได้รับความสนใจและการสนับสนุนเพิ่มเติม",
    severe: "พบสัญญาณที่ควรได้รับการช่วยเหลือโดยเร็ว โดยเฉพาะเมื่อมีคำตอบเกี่ยวกับความไม่ปลอดภัยหรือการทำร้ายตัวเอง",
  };
  return messages[level];
}

function generateSummary(level, high, selfRisk) {
  const base = {
    low: "จากคำตอบทั้งหมด ระบบคัดกรองแบบออฟไลน์ประเมินว่าสัญญาณด้านสุขภาพใจโดยรวมอยู่ในระดับต่ำ",
    moderate: "จากคำตอบทั้งหมด ระบบคัดกรองแบบออฟไลน์พบว่ามีบางด้านที่ควรให้ความสนใจและดูแลเพิ่มเติม",
    high: "จากคำตอบทั้งหมด ระบบคัดกรองแบบออฟไลน์พบสัญญาณหลายด้านที่อยู่ในระดับสูงและควรได้รับการสนับสนุนเพิ่มเติม",
    severe: "จากคำตอบทั้งหมด ระบบคัดกรองแบบออฟไลน์พบสัญญาณที่ควรได้รับความช่วยเหลือโดยเร็ว",
  }[level];

  const domain = high.length ? ` ด้านที่เด่นขึ้นมา ได้แก่ ${high.join(", ")}.` : "";
  const safety = selfRisk
    ? " เนื่องจากมีคำตอบที่เกี่ยวข้องกับการทำร้ายตัวเองหรือความไม่ปลอดภัย ควรบอกผู้ใหญ่หรือผู้เชี่ยวชาญที่ไว้ใจได้โดยเร็ว."
    : "";

  return `${base}.${domain}${safety} ผลนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์`;
}

function generatePatternSummary(high, patterns) {
  const parts = [];
  if (high.length) parts.push(`รูปแบบที่เด่นในคำตอบคือ ${high.join(", ")}`);
  if (patterns.has("stress")) parts.push("มีคำตอบที่สะท้อนความเครียดหรือความกังวล");
  if (patterns.has("social")) parts.push("มีสัญญาณเกี่ยวกับความโดดเดี่ยวหรือความสัมพันธ์");
  if (patterns.has("health")) parts.push("มีสัญญาณเกี่ยวกับการนอนหรือการกิน");
  return parts.length
    ? parts.join(" และ ") + ". นี่เป็นการอธิบายรูปแบบของคำตอบ ไม่ใช่การวินิจฉัยโรค"
    : null;
}

function generateRecommendations(level, high, selfRisk, patterns) {
  const result = [
    "พักให้เพียงพอและแบ่งเวลาจากสิ่งที่กดดันออกเป็นช่วงสั้น ๆ",
    "พูดคุยกับคนที่คุณไว้ใจ เช่น ผู้ปกครอง ครู เพื่อน หรือผู้ใหญ่ที่ปลอดภัย",
  ];

  if (patterns.has("study")) result.push("ถ้าการเรียนเป็นตัวกดดัน ลองคุยกับครูหรือผู้ปกครองเพื่อแบ่งภาระออกเป็นส่วนเล็ก ๆ");
  if (patterns.has("bullying")) result.push("หากมีการกลั่นแกล้ง ให้บอกผู้ใหญ่ที่ไว้ใจได้และเก็บหลักฐานเมื่อทำได้");
  if (patterns.has("social")) result.push("ลองอยู่ใกล้คนที่ทำให้รู้สึกปลอดภัยและไม่ต้องรับเรื่องทั้งหมดไว้คนเดียว");
  if (patterns.has("health")) result.push("ลองจัดเวลานอน อาหาร และการพักให้สม่ำเสมอมากขึ้น");
  if (patterns.has("stress")) result.push("ลองใช้การหายใจช้า ๆ หรือ grounding สั้น ๆ เมื่อความเครียดพุ่งขึ้น");

  if (level === "high" || level === "severe") {
    result.push("พิจารณาพูดคุยกับผู้เชี่ยวชาญด้านสุขภาพจิตเพื่อประเมินเพิ่มเติม");
  }
  if (selfRisk) {
    result.push("หากรู้สึกไม่ปลอดภัย ให้บอกผู้ใหญ่ที่ไว้ใจได้และขอความช่วยเหลือทันที");
  }

  return [...new Set(result)].slice(0, 5);
}
