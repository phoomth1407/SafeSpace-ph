import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { containsProfanity, getProfanityError } from "../../shared/profanity.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.banned && (!user.banned_until || new Date(user.banned_until) > new Date())) {
      return Response.json({ error: 'banned' }, { status: 403 });
    }

    const body = await req.json();
    const { content, category, author_name, ai_enabled, language } = body;
    if (!content || typeof content !== 'string' || content.trim().length < 10) {
      return Response.json({ error: 'เนื้อหาต้องมีอย่างน้อย 10 ตัวอักษร' }, { status: 400 });
    }

    const lang = language === 'en' ? 'en' : 'th';

    // กรองคำหยาบก่อนประมวลผล
    if (containsProfanity(content)) {
      return Response.json({ error: getProfanityError(lang) }, { status: 400 });
    }

    const wantAi = ai_enabled !== false; // default true

    let aiResponse = '';
    let aiRiskFlag = 'safe';

    if (wantAi) {
      const prompt = `คุณคือผู้ให้คำปรึกษาด้านสุขภาพจิตสำหรับเด็กและเยาวชนไทย อ่านประสบการณ์ต่อไปนี้และตอบกลับด้วยความเห็นอกเห็นใจ ให้กำลังใจ และคำแนะนำที่เป็นประโยชน์ ภาษาเป็นมิตร เข้าใจง่าย ไม่ตัดสิน

ประสบการณ์ที่ผู้ใช้เล่า:
"${content}"

หมวดหมู่: ${category}

จงวิเคราะห์และตอบกลับเป็น JSON:
{
  "ai_response": "คำตอบกลับ 3-5 ประโยค ให้กำลังใจและคำแนะนำที่เป็นไปได้จริง",
  "ai_risk_flag": "safe | moderate | high",
  "content_safe": true/false (false ถ้าเนื้อหามีการส่งเสริมการทำร้ายตัวเอง ความรุนแรง หรือเนื้อหาไม่เหมาะสมอย่างรุนแรง)
}

หากตรวจพบความเสี่ยงสูง (เช่น พูดถึงการฆ่าตัวตาย การทำร้ายตัวเอง) ให้ตั้งค่า ai_risk_flag เป็น "high" และใน ai_response แนะนำให้ติดต่อสายด่วน 1327 หรือ 1667`;

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            ai_response: { type: "string" },
            ai_risk_flag: { type: "string", enum: ["safe", "moderate", "high"] },
            content_safe: { type: "boolean" }
          },
          required: ["ai_response", "ai_risk_flag", "content_safe"]
        }
      });

      if (result.content_safe === false) {
        return Response.json({ error: lang === 'en' ? 'This content is not appropriate and cannot be posted.' : 'เนื้อหาไม่เหมาะสม ไม่สามารถโพสต์ได้' }, { status: 400 });
      }

      aiResponse = result.ai_response || '';
      aiRiskFlag = result.ai_risk_flag || 'safe';
    }

    // Use user-scoped create so created_by_id is set to the user (enables delete-own-post)
    const saved = await base44.entities.CommunityPost.create({
      content: content.trim(),
      category: category || 'other',
      ai_response: aiResponse,
      ai_risk_flag: aiRiskFlag,
      ai_enabled: wantAi,
      author_name: (author_name && author_name.trim()) || 'anonymous',
      is_announcement: false
    });

    return Response.json({ ai_response: aiResponse, ai_risk_flag: aiRiskFlag, ai_enabled: wantAi, id: saved.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
