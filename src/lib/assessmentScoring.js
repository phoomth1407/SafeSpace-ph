// ระบบให้คะแนนแบบประเมินตามกฎ (ไม่ใช้ AI)
// อ้างอิงเกณฑ์: คำตอบตัวเลือกแรก = ดีที่สุด (0 คะแนน) → ตัวเลือกสุดท้าย = แย่ที่สุด (3 คะแนน)
import { assessmentCategories } from "./assessmentQuestions";

export function computeAssessmentResult(answers) {
  let totalScore = 0;
  let maxScore = 0;
  let hasSelfHarmRisk = false;
  const categoryScores = {};

  assessmentCategories.forEach((cat) => {
    let catScore = 0;
    let catMax = 0;
    cat.questions.forEach((q) => {
      catMax += 3;
      const answer = answers.find((a) => a.question === q.q);
      if (answer) {
        const optionIndex = q.options.indexOf(answer.answer);
        if (optionIndex >= 0) {
          catScore += optionIndex;
          if (q.q.includes("ทำร้ายตัวเอง") && optionIndex >= 2) {
            hasSelfHarmRisk = true;
          }
        }
      }
    });
    categoryScores[cat.title] = {
      score: catScore,
      max: catMax,
      pct: catMax > 0 ? catScore / catMax : 0,
    };
    totalScore += catScore;
    maxScore += catMax;
  });

  const normalizedScore = Math.round((totalScore / maxScore) * 100);

  let riskLevel;
  if (hasSelfHarmRisk || normalizedScore >= 76) {
    riskLevel = "severe";
  } else if (normalizedScore >= 51) {
    riskLevel = "high";
  } else if (normalizedScore >= 26) {
    riskLevel = "moderate";
  } else {
    riskLevel = "low";
  }

  const highCategories = Object.entries(categoryScores)
    .filter(([, v]) => v.pct >= 0.6)
    .map(([k]) => k);

  return {
    risk_level: riskLevel,
    risk_score: normalizedScore,
    ai_summary: generateSummary(riskLevel, highCategories, hasSelfHarmRisk),
    recommendations: generateRecommendations(riskLevel, highCategories, hasSelfHarmRisk),
    similar_case: null,
  };
}

function generateSummary(riskLevel, highCategories, hasSelfHarmRisk) {
  const baseSummaries = {
    low: "จากการประเมิน คุณมีสุขภาพจิตในภาวะปกติ สามารถจัดการกับความเครียดและปัญหาในชีวิตได้ดี ขอให้ดูแลและรักษาสภาพจิตใจที่ดีนี้ต่อไป",
    moderate:
      "จากการประเมิน คุณมีความเครียดและความเสี่ยงด้านสุขภาพจิตในระดับปานกลาง มีบางด้านในชีวิตที่ส่งผลต่อจิตใจของคุณ ควรให้ความสนใจและหาวิธีจัดการกับปัญหาเหล่านั้น",
    high: "จากการประเมิน คุณมีความเสี่ยงด้านสุขภาพจิตในระดับสูง มีหลายด้านในชีวิตที่ส่งผลกระทบต่อจิตใจอย่างมาก ควรได้รับการช่วยเหลือและการดูแลเพิ่มเติม",
    severe:
      "จากการประเมิน คุณมีความเสี่ยงรุนแรงด้านสุขภาพจิต ควรขอความช่วยเหลือจากผู้เชี่ยวชาญโดยด่วน คุณไม่ได้อยู่คนเดียว มีคนพร้อมช่วยเหลือคุณเสมอ",
  };

  let summary = baseSummaries[riskLevel];

  if (highCategories.length > 0 && riskLevel !== "low") {
    summary += ` ด้านที่ควรให้ความสนใจ ได้แก่ ${highCategories.join(" ")}`;
  }

  if (hasSelfHarmRisk) {
    summary +=
      " จากคำตอบ คุณมีความคิดเกี่ยวกับการทำร้ายตัวเอง ขอให้ติดต่อสายด่วนทันทีเพื่อรับความช่วยเหลือ";
  }

  return summary;
}

function generateRecommendations(riskLevel, highCategories, hasSelfHarmRisk) {
  const recs = [];

  const generalRecs = {
    low: [
      "ดูแลสุขภาพกายและใจต่อไป นอนหลับพักผ่อนให้เพียงพอ",
      "ทำกิจกรรมที่ทำให้มีความสุขและผ่อนคลายเป็นประจำ",
      "รักษาความสัมพันธ์กับคนรอบข้างและเครือข่ายสนับสนุน",
    ],
    moderate: [
      "หาเวลาพักผ่อนและทำกิจกรรมที่ชอบเพื่อลดความเครียด",
      "พูดคุยกับคนที่ไว้ใจได้เกี่ยวกับสิ่งที่รู้สึก",
      "ออกกำลังกายเป็นประจำ ช่วยลดความเครียดได้",
      "หากความรู้สึกไม่ดีต่อเนื่อง ควรปรึกษาผู้เชี่ยวชาญ",
    ],
    high: [
      "ควรปรึกษาผู้เชี่ยวชาญด้านสุขภาพจิตเพื่อรับการประเมินและการรักษาที่เหมาะสม",
      "พูดคุยกับผู้ปกครอง ครู หรือคนที่ไว้ใจได้เกี่ยวกับสิ่งที่คุณกำลังเผชิญ",
      "หลีกเลี่ยงการอยู่คนเดียว พยายามอยู่ใกล้คนที่ปลอดภัย",
      "ติดต่อสายด่วนสุขภาพจิต 1327 เพื่อรับคำปรึกษา",
    ],
    severe: [
      "ติดต่อสายด่วนสุขภาพจิต 1327 หรือ 1667 (สายด่วนเด็กและเยาวชน) ทันที",
      "อย่าอยู่คนเดียว ขอความช่วยเหลือจากคนรอบข้างที่ไว้ใจได้",
      "ควรพบแพทย์หรือนักจิตวิทยาเพื่อรับการรักษาโดยด่วน",
      "หากมีความคิดทำร้ายตัวเอง โทร 1669 หรือไปโรงพยาบาลใกล้บ้านทันที",
    ],
  };

  recs.push(...generalRecs[riskLevel]);

  if (highCategories.includes("การถูกกลั่นแกล้ง")) {
    recs.push("หากถูกกลั่นแกล้ง แจ้งครูหรือผู้ปกครองทันที หรือโทรสายด่วน 1300");
  }
  if (highCategories.includes("ครอบครัว")) {
    recs.push(
      "หากปัญหาครอบครัวส่งผลกระทบ ลองคุยกับผู้ใหญ่ในบ้านหรือปรึกษาครูที่ไว้ใจได้"
    );
  }
  if (highCategories.includes("การเรียนและการศึกษา")) {
    recs.push(
      "วางแผนการเรียนที่เหมาะสม แบ่งเวลาพักผ่อน และขอความช่วยเหลือจากครูเมื่อต้องการ"
    );
  }
  if (highCategories.includes("สุขภาพและโภชนาการ")) {
    recs.push(
      "ดูแลสุขภาพกาย นอนหลับให้เพียงพอ กินอาหารครบ 3 มื้อ และออกกำลังกายสม่ำเสมอ"
    );
  }
  if (hasSelfHarmRisk) {
    recs.push("หากคิดทำร้ายตัวเอง โทร 1669 ทันที หรือไปยังโรงพยาบาลใกล้บ้าน");
  }

  return recs;
}
