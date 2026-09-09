// Rule-based screening score used by the offline/GitHub Pages build.
// This is a screening aid, not a medical diagnosis.
import { assessmentCategories } from "./assessmentQuestions";

export function computeAssessmentResult(answers) {
  let totalScore = 0;
  let maxScore = 0;
  let hasSelfHarmRisk = false;
  const categoryScores = {};

  assessmentCategories.forEach((cat) => {
    let catScore = 0;
    const qs = cat.questions.th || cat.questions.en || [];
    const catMax = qs.length * 3;

    qs.forEach((q, idx) => {
      const enQ = cat.questions.en?.[idx];
      const answer = answers.find(
        (a) => a.question === q.q || a.question === enQ?.q
      );
      if (!answer) return;

      const questionDef = answer.question === enQ?.q ? enQ : q;
      const optionIndex = questionDef.options.indexOf(answer.answer);
      if (optionIndex >= 0) catScore += optionIndex;

      if (
        (/ทำร้ายตัวเอง|ฆ่าตัวตาย/i.test(q.q) ||
          /self[- ]?harm|suicide/i.test(enQ?.q || "")) &&
        optionIndex >= 2
      ) {
        hasSelfHarmRisk = true;
      }
    });

    const categoryName = cat.title?.th || cat.id;
    categoryScores[categoryName] = {
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
    hasSelfHarmRisk || normalizedScore >= 76
      ? "severe"
      : normalizedScore >= 51
        ? "high"
        : normalizedScore >= 26
          ? "moderate"
          : "low";

  const highCategories = Object.values(categoryScores)
    .filter((v) => v.pct >= 0.6)
    .map((v) => v.name);

  return {
    risk_level,
    risk_score: normalizedScore,
    screening_type: "wellbeing",
    ai_summary: generateSummary(risk_level, highCategories, hasSelfHarmRisk),
    recommendations: generateRecommendations(
      risk_level,
      highCategories,
      hasSelfHarmRisk
    ),
    similar_case: null,
    category_scores: categoryScores,
  };
}

function generateSummary(level, high, selfRisk) {
  const s = {
    low: "จากการประเมิน คุณมีความเครียดในระดับค่อนข้างต่ำ ขอให้ดูแลสุขภาพกายและใจต่อไป",
    moderate:
      "จากการประเมิน คุณมีความเครียดหรือปัจจัยที่ควรให้ความสนใจในบางด้าน ลองพูดคุยกับคนที่ไว้ใจได้",
    high: "จากการประเมิน คุณมีความเครียดในระดับสูง ควรพูดคุยกับผู้ใหญ่หรือผู้เชี่ยวชาญที่ไว้ใจได้",
    severe:
      "จากการประเมินพบสัญญาณของความเครียดในระดับสูงมาก ควรขอความช่วยเหลือจากผู้ใหญ่หรือผู้เชี่ยวชาญโดยเร็ว ผลนี้ไม่ใช่การวินิจฉัย",
  };
  return (
    s[level] +
    (high.length ? ` ด้านที่ควรให้ความสนใจ: ${high.join(", ")}` : "") +
    (selfRisk
      ? " หากคำตอบบางข้อทำให้คุณรู้สึกไม่ปลอดภัย โปรดบอกผู้ใหญ่หรือผู้เชี่ยวชาญที่ไว้ใจได้ทันที"
      : "")
  );
}

function generateRecommendations(level, high, selfRisk) {
  const r = {
    low: [
      "พักผ่อนให้เพียงพอ",
      "ทำกิจกรรมที่ช่วยให้ผ่อนคลาย",
      "พูดคุยกับคนที่ไว้ใจได้",
    ],
    moderate: [
      "หาเวลาพักและทำกิจกรรมที่ช่วยลดความเครียด",
      "พูดคุยกับคนที่ไว้ใจได้",
      "หากความรู้สึกไม่ดีต่อเนื่อง ควรปรึกษาผู้เชี่ยวชาญ",
    ],
    high: [
      "พูดคุยกับผู้ปกครอง ครู หรือผู้เชี่ยวชาญที่ไว้ใจได้",
      "อยู่ใกล้คนที่ทำให้รู้สึกปลอดภัย",
      "พิจารณารับคำปรึกษาจากผู้เชี่ยวชาญ",
    ],
    severe: [
      "บอกผู้ใหญ่หรือผู้เชี่ยวชาญที่ไว้ใจได้โดยเร็ว",
      "อยู่กับคนที่ปลอดภัยและให้การสนับสนุน",
      "หากไม่ปลอดภัยหรือเป็นเหตุฉุกเฉิน ให้ติดต่อบริการฉุกเฉินในพื้นที่",
    ],
  };

  const out = [...(r[level] || r.moderate)];
  if (high.includes("การถูกกลั่นแกล้ง")) {
    out.push("หากถูกกลั่นแกล้ง ควรแจ้งครูหรือผู้ปกครองที่ไว้ใจได้");
  }
  if (selfRisk) {
    out.push("หากรู้สึกไม่ปลอดภัย โปรดขอความช่วยเหลือจากผู้ใหญ่ที่ไว้ใจได้ทันที");
  }
  return out;
}
