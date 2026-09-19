import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const validLevels = ["low", "moderate", "high", "severe"];

function normalizeLanguage(value: unknown): "th" | "en" {
  return value === "en" ? "en" : "th";
}

function toText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) {
    return value.map((v) => toText(v)).filter(Boolean).join(" ");
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of ["text", "content", "message", "summary", "description", "value"]) {
      if (key in obj) {
        const text = toText(obj[key]);
        if (text) return text;
      }
    }
    try { return JSON.stringify(value); } catch { return fallback; }
  }
  return String(value);
}


function localFallback(answers: any[], language: "th" | "en") {
  const score = Math.round(
    Math.min(100, Math.max(0, (answers.filter(Boolean).length / Math.max(1, answers.length)) * 25))
  );
  const risk_level = score <= 25 ? "low" : "moderate";
  if (language === "en") {
    return {
      risk_level,
      risk_score: score,
      depression_chance: "Unable to complete AI analysis right now.",
      ai_summary: "The screening could not be fully analyzed by the AI service right now.",
      similar_case: "",
      recommendations: ["Please try the assessment again later.", "Talk with someone you trust if you are worried about how you feel."],
    };
  }
  return {
    risk_level,
    risk_score: score,
    depression_chance: "ไม่สามารถวิเคราะห์โดย AI ได้ในขณะนี้",
    ai_summary: "ขณะนี้ระบบ AI ไม่สามารถวิเคราะห์แบบประเมินได้ครบถ้วน",
    similar_case: "",
    recommendations: ["ลองทำแบบประเมินอีกครั้งในภายหลัง", "พูดคุยกับคนที่คุณไว้ใจหากคุณกำลังกังวลเกี่ยวกับความรู้สึกของตัวเอง"],
  };
}

function localToolRecommendations(answers: any[], language: "th" | "en") {
  const text = answers.map((a: any) => `${a?.category || ""} ${a?.question || ""} ${a?.answer || ""}`).join(" ").toLowerCase();
  const picks: any[] = [];
  const add = (id: string, th: string, en: string) => picks.push({ id, reason: language === "en" ? en : th });

  if (/เรียน|การศึกษา|study|school|exam|เรียน/.test(text)) {
    add("ground", "เหมาะเมื่อเรื่องการเรียนทำให้ความคิดแน่นหรือรู้สึกกดดัน", "Useful when study or school stress is making your thoughts feel crowded or pressured.");
  }
  if (/นอน|นอนไม่|sleep|insomnia|อาหาร|กิน|appetite|สุขภาพ|health/.test(text)) {
    add("breath", "ลองใช้การหายใจเป็นช่วงสั้น ๆ เพื่อพักจากความตึงเครียดและกลับมาอยู่กับปัจจุบัน", "A short breathing exercise can give you a pause from tension and help you refocus.");
  }
  if (/เพื่อน|ความสัมพันธ์|ครอบครัว|friend|relationship|family|bully|กลั่นแกล้ง/.test(text)) {
    add("community", "การพูดคุยกับคนอื่นอาจช่วยให้คุณไม่ต้องรับเรื่องนี้ไว้คนเดียว", "Talking with others can help you avoid carrying this situation alone.");
  }
  if (/กังวล|คิดวน|เครียด|วิตก|worry|anxious|stress|overthink/.test(text)) {
    add("worry", "เหมาะเมื่อมีความคิดวนหรือเรื่องที่ยังวางไม่ลงและอยากพักจากมันชั่วคราว", "Useful when worries keep looping and you need a short break from them.");
  }

  const unique = picks.filter((x, i) => picks.findIndex((y) => y.id === x.id) === i);
  if (unique.length < 2) {
    add("breath", "ใช้เป็นช่วงพักสั้น ๆ เพื่อชะลอความตึงเครียดและกลับมาโฟกัส", "Use it as a short pause to reduce tension and refocus.");
  }
  if (unique.length < 3) {
    add("resources", "ดูข้อมูลและแหล่งช่วยเหลือเพิ่มเติมได้เมื่อคุณต้องการคำแนะนำหรือการสนับสนุน", "Explore trusted information and support when you need more guidance.");
  }
  return picks.filter((x, i, arr) => arr.findIndex((y) => y.id === x.id) === i).slice(0, 4);
}

async function main(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > 64_000) {
    return new Response(JSON.stringify({ error: "request too large" }), { status: 413, headers: corsHeaders });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return new Response(JSON.stringify({ error: "invalid request body" }), { status: 400, headers: corsHeaders });
  }

  const answers = Array.isArray((body as any).answers) ? (body as any).answers : [];
  if (!answers.length || answers.length > 100) {
    return new Response(JSON.stringify({ error: "invalid answers" }), { status: 400, headers: corsHeaders });
  }

  for (const answer of answers) {
    if (!answer || typeof answer !== "object" || Array.isArray(answer)) {
      return new Response(JSON.stringify({ error: "invalid answer item" }), { status: 400, headers: corsHeaders });
    }
    for (const key of ["category", "question", "answer"]) {
      if (answer[key] !== undefined && typeof answer[key] !== "string") {
        return new Response(JSON.stringify({ error: "invalid answer field" }), { status: 400, headers: corsHeaders });
      }
      if (typeof answer[key] === "string" && answer[key].length > 2_000) {
        return new Response(JSON.stringify({ error: "answer field too long" }), { status: 400, headers: corsHeaders });
      }
    }
  }

  const language = normalizeLanguage((body as any).language);
  const ageNum = typeof (body as any).age === "number" && Number.isFinite((body as any).age) ? (body as any).age : null;
  if (ageNum !== null && (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120)) {
    return new Response(JSON.stringify({ error: "invalid age" }), { status: 400, headers: corsHeaders });
  }
  const ageGroup = ageNum === null ? null : (ageNum < 20 ? "under20" : "over20");
  const nat = body.nationality === "foreigner" ? "foreigner" : "thai";

  const authHeader = req.headers.get("Authorization") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
  const userClient = createClient(supabaseUrl, publishableKey, { global: { headers: { Authorization: authHeader } } });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: "authentication required" }), { status: 401, headers: corsHeaders });
  }

  const answersText = answers.map((a: any, i: number) =>
    `${i + 1}. [${a?.category || ""}] ${a?.question || ""}\n   ตอบ: ${a?.answer || ""}`
  ).join("\n\n");

  const ageContext = ageNum !== null
    ? (language === "en"
      ? `\nRespondent age: ${ageNum} years old (group: ${ageGroup === "under20" ? "under 20" : "20 and above"}).`
      : `\nอายุผู้ทำแบบประเมิน: ${ageNum} ปี (กลุ่ม: ${ageGroup === "under20" ? "ต่ำกว่า 20 ปี" : "20 ปีขึ้นไป"}).`)
    : "";

  let result = localFallback(answers, language);
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  let aiSucceeded = false;

  if (apiKey) {
    const prompt = (language === "en" ? "You are an expert clinical psychologist specializing in adolescent and youth mental health. Analyze the following assessment answers.\n\nReference validated instruments and research when scoring:\n- PHQ-9 (Patient Health Questionnaire-9) criteria for depression severity\n- Common depression/anxiety screening thresholds used in adolescent mental health research\n- Risk indicators: hopelessness, social withdrawal, sleep/appetite disturbance, self-worth issues, self-harm ideation\n\nRespondent context:{AGE_CONTEXT}\n\nAssessment answers:\n{ANSWERS_TEXT}\n\nYou must determine the risk_score (0-100) YOURSELF based on the answers — there are NO per-question scores. Judge severity by how closely the answers match clinically depressed/at-risk profiles from research.\n\nRespond as JSON:\n{\n  \"risk_level\": \"low | moderate | high | severe\",\n  \"risk_score\": 0-100,\n  \"depression_chance\": \"estimate the likelihood of depression as a short phrase (e.g. 'Low likelihood', 'Moderate likelihood', 'High likelihood') with one sentence of reasoning referencing PHQ-9-like criteria\",\n  \"ai_summary\": \"summarize the mental health status in 2-3 sentences, easy to understand, no technical terms\",\n  \"similar_case\": \"a similar case or common pattern explaining what this situation resembles (e.g. depression, anxiety, bullying) with reasoning\",\n  \"recommendations\": [\"3-5 realistic, friendly, easy-to-understand recommendations\"]\n}\n\nScoring guidance (reference research):\n- low: 0-25, minimal symptoms, functioning well\n- moderate: 26-50, several symptoms present, some impairment\n- high: 51-75, significant symptoms, clear distress\n- severe: 76-100, severe symptoms, self-harm risk or inability to function\n\nIf high or severe risk is detected, always recommend contacting mental health hotline 1327 or 1667.\n\nOutput-detail requirements:\n- Keep the same scoring approach and the same four risk levels above. Do not change the risk score merely to make the explanation longer.\n- depression_chance must be 2-4 sentences: state the overall screening concern level and explain the main reasons from the actual answers, especially PHQ-9-like symptoms or protective factors that are present.\n- ai_summary must be 3-4 sentences describing the respondent's current situation in clear, natural language. Focus on what the answers suggest about the person, not on explaining what the app is.\n- similar_case must be 2-4 sentences explaining the main patterns/domains reflected in the answers and why they stand out. Do not present any condition as a diagnosis.\n- recommendations must contain 4-5 practical, friendly recommendations whenever the answers provide enough information. Each recommendation must connect to a concrete domain or answer pattern from the assessment. Prefer specific advice over generic self-care.\n- Use the respondent's actual answer patterns as evidence and do not invent facts.\n- Do not omit any of the JSON fields." : "คุณคือนักจิตวิทยาคลินิกผู้เชี่ยวชาญด้านสุขภาพจิตเด็กและเยาวชน วิเคราะห์คำตอบแบบประเมินต่อไปนี้\n\nอ้างอิงเครื่องมือและงานวิจัยที่ผ่านการตรวจสอบเมื่อให้คะแนน:\n- เกณฑ์ PHQ-9 (Patient Health Questionnaire-9) สำหรับระดับความรุนแรงของโรคซึมเศร้า\n- ค่าคะแนนตัดสินใจการคัดกรองโรคซึมเศร้า/วิตกกังวลในเยาวชนจากงานวิจัย\n- ตัวชี้วัดความเสี่ยง: ความสิ้นหวัง การถอนตัวจากสังคม ปัญหาการนอน/การกิน ความรู้สึกไร้คุณค่า ความคิดทำร้ายตัวเอง\n\nบริบทผู้ทำแบบประเมิน:{AGE_CONTEXT}\n\nคำตอบแบบประเมิน:\n{ANSWERS_TEXT}\n\nคุณต้องกำหนด risk_score (0-100) ด้วยตัวเองจากคำตอบ — ไม่มีคะแนนรายข้อ ให้พิจารณาความรุนแรงจากความใกล้เคียงของคำตอบกับโปรไฟล์ผู้ป่วยซึมเศร้า/กลุ่มเสี่ยงจากงานวิจัย\n\nจงวิเคราะห์และสรุปเป็น JSON ตามรูปแบบนี้:\n{\n  \"risk_level\": \"low | moderate | high | severe\",\n  \"risk_score\": 0-100,\n  \"depression_chance\": \"ประเมินโอกาสที่จะเป็นโรคซึมเศร้า เป็นวลีสั้นๆ (เช่น 'โอกาสต่ำ', 'โอกาสปานกลาง', 'โอกาสสูง') พร้อมเหตุผลสั้นๆ อ้างอิงเกณฑ์แบบ PHQ-9\",\n  \"ai_summary\": \"สรุปสถานะสุขภาพจิตของผู้ทำแบบประเมิน 2-3 ประโยค ภาษาเข้าใจง่าย ไม่ใช้ศัพท์เทคนิค\",\n  \"similar_case\": \"เคสที่คล้ายกันหรือรูปแบบที่พบบ่อย ที่อธิบายว่าสถานการณ์นี้คล้ายกับภาวะอะไร (เช่น ซึมเศร้า วิตกกังวล ถูกกลั่นแกล้ง) พร้อมเหตุผล\",\n  \"recommendations\": [\"คำแนะนำที่เป็นไปได้จริง 3-5 ข้อ ภาษาเป็นมิตร เข้าใจง่าย\"]\n}\n\nเกณฑ์ให้คะแนน (อ้างอิงงานวิจัย):\n- low: 0-25 อาการน้อย ทำหน้าที่ได้ปกติ\n- moderate: 26-50 มีอาการหลายข้อ มีผลกระทบบางส่วน\n- high: 51-75 อาการรุนแรง มีความทุกข์ชัดเจน\n- severe: 76-100 อาการรุนแรงมาก มีความเสี่ยงทำร้ายตัวเองหรือทำหน้าที่ไม่ได้\n\nหากตรวจพบความเสี่ยงสูงหรือรุนแรง ให้แนะนำให้ติดต่อสายด่วนสุขภาพจิต 1327 หรือ 1667\n\nข้อกำหนดด้านรายละเอียด:\n- คงวิธีให้คะแนนและระดับความเสี่ยง 4 ระดับเดิม ห้ามเปลี่ยนคะแนนเพียงเพื่อให้คำอธิบายยาวขึ้น\n- depression_chance ต้องมี 2-4 ประโยค โดยบอกภาพรวมระดับข้อกังวลและอธิบายเหตุผลหลักจากคำตอบจริง โดยเฉพาะอาการลักษณะเดียวกับ PHQ-9 หรือปัจจัยปกป้องที่พบ\n- ai_summary ต้องมี 3-4 ประโยค สรุปว่าจากคำตอบแล้วช่วงนี้ผู้ทำแบบประเมินน่าจะเป็นอย่างไร ใช้ภาษาธรรมชาติที่เข้าใจง่าย และไม่อธิบายว่าแอปคืออะไร\n- similar_case ต้องมี 2-4 ประโยค อธิบายรูปแบบ/ด้านสำคัญที่สะท้อนจากคำตอบและเหตุผลว่าทำไมจึงเด่น โดยห้ามนำเสนอภาวะใดเป็นการวินิจฉัย\n- recommendations ควรมี 4-5 ข้อเมื่อคำตอบมีข้อมูลเพียงพอ และแต่ละข้อต้องเชื่อมโยงกับด้านหรือรูปแบบคำตอบจริงของผู้ทำแบบประเมินโดยตรง หลีกเลี่ยงคำแนะนำทั่วไปที่ไม่เกี่ยวกับคำตอบ\n- ใช้รูปแบบคำตอบจริงเป็นหลักฐานและห้ามสร้างข้อมูลที่ไม่มีในคำตอบ\n- ห้ามละฟิลด์ใด ๆ ใน JSON")
      .replace("{AGE_CONTEXT}", ageContext)
      .replace("{ANSWERS_TEXT}", answersText);

    const fullPrompt = prompt + (language === "en"
      ? "\n\nPersonalized tool selection: Return 2-4 ranked tools using only breath, ground, worry, community, resources, sound. Choose based on the actual answer patterns and current situation. Each item must contain id and a short reason grounded in the answers. Do not recommend a tool merely because the risk score is high. If support or professional help is relevant, include resources."
      : "\n\nการเลือกเครื่องมือแบบเฉพาะบุคคล: ส่งเครื่องมือ 2-4 รายการเรียงตามความเหมาะสม โดยใช้เฉพาะ breath, ground, worry, community, resources, sound. เลือกจากรูปแบบคำตอบและสถานการณ์จริงของผู้ทำแบบประเมิน แต่ละรายการต้องมี id และเหตุผลสั้น ๆ ที่เชื่อมโยงกับคำตอบจริง ห้ามแนะนำเครื่องมือเพียงเพราะคะแนนสูง และหากควรได้รับข้อมูลหรือความช่วยเหลือเพิ่มเติมให้รวม resources");



    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: Deno.env.get("OPENAI_MODEL") || "gpt-5.6-luna",
          input: fullPrompt,
          text: {
            format: {
              type: "json_schema",
              name: "assessment_result",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  risk_level: { type: "string", enum: ["low", "moderate", "high", "severe"] },
                  risk_score: { type: "number", minimum: 0, maximum: 100 },
                  depression_chance: { type: "string" },
                  ai_summary: { type: "string" },
                  similar_case: { type: "string" },
                  recommendations: { type: "array", items: { type: "string" } },
                  tool_recommendations: {
                    type: "array",
                    minItems: 2,
                    maxItems: 4,
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", enum: ["breath", "ground", "worry", "community", "resources", "sound"] },
                        reason: { type: "string" }
                      },
                      required: ["id", "reason"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["risk_level", "risk_score", "depression_chance", "ai_summary", "similar_case", "recommendations", "tool_recommendations"],
                additionalProperties: false
              }
            }
          },
          max_output_tokens: 2500,
        }),
      });

      if (!response.ok) {
        console.error("OpenAI Responses API error", response.status, await response.text());
      } else {
        const payload = await response.json();
        const raw = payload.output_text || payload.output?.flatMap((x: any) => x.content || []).find((x: any) => x.type === "output_text")?.text;
        const ai = JSON.parse(raw);
        aiSucceeded = true;
        result = {
          risk_level: validLevels.includes(ai.risk_level) ? ai.risk_level : result.risk_level,
          risk_score: Number.isFinite(Number(ai.risk_score))
            ? Math.max(0, Math.min(100, Math.round(Number(ai.risk_score))))
            : result.risk_score,
          depression_chance: toText(ai.depression_chance, toText(result.depression_chance)),
          ai_summary: toText(ai.ai_summary, toText(result.ai_summary)),
          similar_case: toText(ai.similar_case, toText(result.similar_case)),
          recommendations: Array.isArray(ai.recommendations) && ai.recommendations.length
            ? ai.recommendations.slice(0, 5).map(String)
            : result.recommendations,
          tool_recommendations: Array.isArray(ai.tool_recommendations) && ai.tool_recommendations.length
            ? ai.tool_recommendations.slice(0, 4).filter((x: any) => x && ["breath", "ground", "worry", "community", "resources", "sound"].includes(x.id) && typeof x.reason === "string")
            : (result.tool_recommendations || []),
        };
      }
    } catch (err) {
      console.error("Assessment AI analysis failed", err);
      // Keep a safe local fallback if the model/API is unavailable.
    }
  }

  // Gemini fallback: only used when the primary OpenAI analysis fails.
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (!aiSucceeded && geminiKey) {
    try {
      const geminiPrompt = fullPrompt + (language === "en"
        ? "\nReturn ONLY valid JSON matching the requested assessment_result structure."
        : "\nส่งกลับเป็น JSON ที่ถูกต้องตามโครงสร้าง assessment_result เท่านั้น");
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        console.error("Gemini fallback error", response.status, await response.text());
      } else {
        const payload = await response.json();
        const raw = payload?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("") || "";
        const ai = JSON.parse(raw);
        aiSucceeded = true;
        result = {
          risk_level: validLevels.includes(ai.risk_level) ? ai.risk_level : result.risk_level,
          risk_score: Number.isFinite(Number(ai.risk_score))
            ? Math.max(0, Math.min(100, Math.round(Number(ai.risk_score))))
            : result.risk_score,
          depression_chance: toText(ai.depression_chance, toText(result.depression_chance)),
          ai_summary: toText(ai.ai_summary, toText(result.ai_summary)),
          similar_case: toText(ai.similar_case, toText(result.similar_case)),
          recommendations: Array.isArray(ai.recommendations) && ai.recommendations.length
            ? ai.recommendations.slice(0, 5).map(String)
            : result.recommendations,
          tool_recommendations: Array.isArray(ai.tool_recommendations) && ai.tool_recommendations.length
            ? ai.tool_recommendations.slice(0, 4).filter((x: any) => x && ["breath", "ground", "worry", "community", "resources", "sound"].includes(x.id) && typeof x.reason === "string")
            : localToolRecommendations(answers, language),
        };
      }
    } catch (err) {
      console.error("Gemini fallback failed", err);
    }
  }

  const row = {
    id: crypto.randomUUID(),
    created_by_id: userData.user.id,
    risk_level: validLevels.includes(result.risk_level) ? result.risk_level : "moderate",
    risk_score: Math.max(0, Math.min(100, Math.round(Number(result.risk_score) || 0))),
    depression_chance: result.depression_chance || "",
    answers,
    ai_summary: result.ai_summary || "",
    similar_case: result.similar_case || "",
    recommendations: Array.isArray(result.recommendations) ? result.recommendations.slice(0, 5) : [],
    tool_recommendations: Array.isArray(result.tool_recommendations) ? result.tool_recommendations.slice(0, 4) : [],
    age: ageNum,
    age_group: ageGroup,
    nationality: nat,
  };

  const { data: saved, error: saveError } = await userClient.from("assessments").insert(row).select("*").single();
  if (saveError) {
    return new Response(JSON.stringify({ error: `บันทึกผลไม่สำเร็จ: ${saveError.message}` }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({
    risk_level: row.risk_level,
    risk_score: row.risk_score,
    depression_chance: row.depression_chance,
    ai_summary: row.ai_summary,
    similar_case: row.similar_case,
    recommendations: row.recommendations,
    tool_recommendations: row.tool_recommendations,
    id: saved.id,
    is_guest: false,
    analysis_source: aiSucceeded ? (apiKey ? "openai" : "gemini") : "fallback",
  }), { headers: corsHeaders });
}

Deno.serve(main);
