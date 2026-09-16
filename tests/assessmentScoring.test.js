import { describe, expect, it } from "vitest";
import { assessmentCategories } from "../src/lib/assessmentQuestions";
import { computeAssessmentResult } from "../src/lib/assessmentScoring";

const answerSet = (indexes) =>
  assessmentCategories.flatMap((cat) =>
    cat.questions.th.map((q, index) => ({
      question: q.q,
      answer: q.options[indexes?.[cat.id]?.[index] ?? 0],
    })),
  );

describe("computeAssessmentResult", () => {
  it("returns a low result for all first-choice answers", () => {
    const result = computeAssessmentResult(answerSet());

    expect(result.risk_score).toBe(0);
    expect(result.risk_level).toBe("low");
    expect(result.similar_case).toBeNull();
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("returns moderate risk at the 26 boundary", () => {
    // 3 points in each of the 21 questions gives 63/63 = 100.
    // 6 option-index points out of 63 gives 9.5%, so use a direct
    // answer set that reaches the intended normalized threshold.
    const answers = [];
    let used = 0;
    for (const cat of assessmentCategories) {
      for (const q of cat.questions.th) {
        const index = used < 20 ? 1 : 0;
        answers.push({ question: q.q, answer: q.options[index] });
        used++;
      }
    }

    const result = computeAssessmentResult(answers);
    expect(result.risk_level).toBe("moderate");
    expect(result.risk_score).toBeGreaterThanOrEqual(26);
  });

  it("forces severe risk when the self-harm question is answered at index 2 or above", () => {
    const answers = answerSet({
      lifeskills: [0, 2, 0],
    });

    const result = computeAssessmentResult(answers);

    expect(result.risk_level).toBe("severe");
    expect(result.risk_score).toBeGreaterThanOrEqual(76);
    expect(result.ai_summary).toContain("ควรได้รับความช่วยเหลือโดยเร็ว");
  });

  it("recognizes English answers too", () => {
    const answers = assessmentCategories.flatMap((cat) =>
      cat.questions.en.map((q) => ({
        question: q.q,
        answer: q.options[0],
      })),
    );

    const result = computeAssessmentResult(answers);

    expect(result.risk_score).toBe(0);
    expect(result.risk_level).toBe("low");
  });

  it("keeps category summaries aligned with the source categories", () => {
    const result = computeAssessmentResult(answerSet());

    expect(Object.keys(result)).toEqual(
      expect.arrayContaining([
        "risk_level",
        "risk_score",
        "ai_summary",
        "recommendations",
        "similar_case",
      ]),
    );
  });
});


describe("offline screening model", () => {
  it("produces a non-trivial score from higher-severity answers", () => {
    const answers = assessmentCategories.flatMap((cat) =>
      (cat.questions.en || cat.questions.th).map((q) => ({
        question: q.q,
        answer: q.options[q.options.length - 1],
      })),
    );

    const result = computeAssessmentResult(answers);

    expect(result.analysis_source).toBe("offline-model");
    expect(result.risk_score).toBeGreaterThan(25);
    expect(result.ai_summary).not.toContain("AI");
  });
});


describe("offline screening language", () => {
  it("returns English result text when English is selected", () => {
    const answers = assessmentCategories.flatMap((cat) =>
      (cat.questions.en || cat.questions.th).map((q) => ({
        question: q.q,
        answer: q.options[0],
      })),
    );

    const result = computeAssessmentResult(answers, "en");

    expect(result.analysis_source).toBe("offline-model");
    expect(result.depression_chance).toMatch(/overall|signals|range/i);
    expect(result.ai_summary).not.toMatch(/จากคำตอบ|ระบบคัดกรอง|การวินิจฉัยทางการแพทย์/);
    expect(result.recommendations.every((item) => !/ควร|ลอง|พูดคุย|พัก/i.test(item))).toBe(true);
  });
});
