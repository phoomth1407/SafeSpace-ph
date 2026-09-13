import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const isAuthed = await base44.auth.isAuthenticated();

    const body = await req.json();
    const { answers, language, age, nationality } = body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return Response.json({ error: 'ต้องส่งคำตอบแบบประเมินมาด้วย' }, { status: 400 });
    }

    const lang = language === 'en' ? 'en' : 'th';
    const nat = nationality === 'foreigner' ? 'foreigner' : 'thai';
    const ageNum = typeof age === 'number' && !isNaN(age) ? age : null;
    const ageGroup = ageNum === null ? null : (ageNum < 20 ? 'under20' : 'over20');

    const answersText = answers.map((a, i) =>
      `${i + 1}. [${a.category}] ${a.question}\n   ตอบ: ${a.answer}`
    ).join('\n\n');

    const ageContext = ageNum !== null
      ? (lang === 'en' ? `\nRespondent age: ${ageNum} years old (group: ${ageGroup === 'under20' ? 'under 20' : '20 and above'}).` : `\nอายุผู้ทำแบบประเมิน: ${ageNum} ปี (กลุ่ม: ${ageGroup === 'under20' ? 'ต่ำกว่า 20 ปี' : '20 ปีขึ้นไป'}).`)
      : '';

    const prompt = lang === 'en'
      ? `You are an expert clinical psychologist specializing in adolescent and youth mental health. Analyze the following assessment answers.

Reference validated instruments and research when scoring:
- PHQ-9 (Patient Health Questionnaire-9) criteria for depression severity
- Common depression/anxiety screening thresholds used in adolescent mental health research
- Risk indicators: hopelessness, social withdrawal, sleep/appetite disturbance, self-worth issues, self-harm ideation

Respondent context:${ageContext}

Assessment answers:
${answersText}

You must determine the risk_score (0-100) YOURSELF based on the answers — there are NO per-question scores. Judge severity by how closely the answers match clinically depressed/at-risk profiles from research.

Respond as JSON:
{
  "risk_level": "low | moderate | high | severe",
  "risk_score": 0-100,
  "depression_chance": "estimate the likelihood of depression as a short phrase (e.g. 'Low likelihood', 'Moderate likelihood', 'High likelihood') with one sentence of reasoning referencing PHQ-9-like criteria",
  "ai_summary": "summarize the mental health status in 2-3 sentences, easy to understand, no technical terms",
  "similar_case": "a similar case or common pattern explaining what this situation resembles (e.g. depression, anxiety, bullying) with reasoning",
  "recommendations": ["3-5 realistic, friendly, easy-to-understand recommendations"]
}

Scoring guidance (reference research):
- low: 0-25, minimal symptoms, functioning well
- moderate: 26-50, several symptoms present, some impairment
- high: 51-75, significant symptoms, clear distress
- severe: 76-100, severe symptoms, self-harm risk or inability to function

If high or severe risk is detected, always recommend contacting mental health hotline 1327 or 1667.`
      : `คุณคือนักจิตวิทยาคลินิกผู้เชี่ยวชาญด้านสุขภาพจิตเด็กและเยาวชน วิเคราะห์คำตอบแบบประเมินต่อไปนี้

อ้างอิงเครื่องมือและงานวิจัยที่ผ่านการตรวจสอบเมื่อให้คะแนน:
- เกณฑ์ PHQ-9 (Patient Health Questionnaire-9) สำหรับระดับความรุนแรงของโรคซึมเศร้า
- ค่าคะแนนตัดสินใจการคัดกรองโรคซึมเศร้า/วิตกกังวลในเยาวชนจากงานวิจัย
- ตัวชี้วัดความเสี่ยง: ความสิ้นหวัง การถอนตัวจากสังคม ปัญหาการนอน/การกิน ความรู้สึกไร้คุณค่า ความคิดทำร้ายตัวเอง

บริบทผู้ทำแบบประเมิน:${ageContext}

คำตอบแบบประเมิน:
${answersText}

คุณต้องกำหนด risk_score (0-100) ด้วยตัวเองจากคำตอบ — ไม่มีคะแนนรายข้อ ให้พิจารณาความรุนแรงจากความใกล้เคียงของคำตอบกับโปรไฟล์ผู้ป่วยซึมเศร้า/กลุ่มเสี่ยงจากงานวิจัย

จงวิเคราะห์และสรุปเป็น JSON ตามรูปแบบนี้:
{
  "risk_level": "low | moderate | high | severe",
  "risk_score": 0-100,
  "depression_chance": "ประเมินโอกาสที่จะเป็นโรคซึมเศร้า เป็นวลีสั้นๆ (เช่น 'โอกาสต่ำ', 'โอกาสปานกลาง', 'โอกาสสูง') พร้อมเหตุผลสั้นๆ อ้างอิงเกณฑ์แบบ PHQ-9",
  "ai_summary": "สรุปสถานะสุขภาพจิตของผู้ทำแบบประเมิน 2-3 ประโยค ภาษาเข้าใจง่าย ไม่ใช้ศัพท์เทคนิค",
  "similar_case": "เคสที่คล้ายกันหรือรูปแบบที่พบบ่อย ที่อธิบายว่าสถานการณ์นี้คล้ายกับภาวะอะไร (เช่น ซึมเศร้า วิตกกังวล ถูกกลั่นแกล้ง) พร้อมเหตุผล",
  "recommendations": ["คำแนะนำที่เป็นไปได้จริง 3-5 ข้อ ภาษาเป็นมิตร เข้าใจง่าย"]
}

เกณฑ์ให้คะแนน (อ้างอิงงานวิจัย):
- low: 0-25 อาการน้อย ทำหน้าที่ได้ปกติ
- moderate: 26-50 มีอาการหลายข้อ มีผลกระทบบางส่วน
- high: 51-75 อาการรุนแรง มีความทุกข์ชัดเจน
- severe: 76-100 อาการรุนแรงมาก มีความเสี่ยงทำร้ายตัวเองหรือทำหน้าที่ไม่ได้

หากตรวจพบความเสี่ยงสูงหรือรุนแรง ให้แนะนำให้ติดต่อสายด่วนสุขภาพจิต 1327 หรือ 1667 เสมอ`;

    let result;
    try {
      result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            risk_level: { type: "string", enum: ["low", "moderate", "high", "severe"] },
            risk_score: { type: "number" },
            depression_chance: { type: "string" },
            ai_summary: { type: "string" },
            similar_case: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } }
          },
          required: ["risk_level", "risk_score", "ai_summary"]
        }
      });
    } catch (llmErr) {
      return Response.json({ error: `AI วิเคราะห์ไม่สำเร็จ: ${llmErr.message}` }, { status: 502 });
    }

    const validLevels = ["low", "moderate", "high", "severe"];
    const riskLevel = validLevels.includes(result.risk_level) ? result.risk_level : "moderate";
    const riskScore = typeof result.risk_score === "number" ? result.risk_score : 50;
    const aiSummary = result.ai_summary || "ไม่สามารถสรุปผลได้ในขณะนี้";
    const depressionChance = result.depression_chance || "";
    const similarCase = result.similar_case || "";
    const recommendations = Array.isArray(result.recommendations) ? result.recommendations : [];

    const payload = {
      risk_level: riskLevel,
      risk_score: riskScore,
      depression_chance: depressionChance,
      answers,
      ai_summary: aiSummary,
      similar_case: similarCase,
      recommendations,
      ...(ageNum !== null ? { age: ageNum, age_group: ageGroup } : {}),
      nationality: nat
    };

    let saved;
    try {
      if (isAuthed) {
        saved = await base44.entities.Assessment.create(payload);
      } else {
        saved = await base44.asServiceRole.entities.GuestAssessment.create({
          ...payload,
          language: lang
        });
      }
    } catch (dbErr) {
      return Response.json({ error: `บันทึกผลไม่สำเร็จ: ${dbErr.message}` }, { status: 500 });
    }

    return Response.json({
      risk_level: riskLevel,
      risk_score: riskScore,
      depression_chance: depressionChance,
      ai_summary: aiSummary,
      similar_case: similarCase,
      recommendations,
      id: saved.id,
      is_guest: !isAuthed
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
