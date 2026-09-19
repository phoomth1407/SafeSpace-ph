import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Content-Type": "application/json" };
const clamp = (n:number) => Math.max(0, Math.min(27, Math.round(n)));
const band = (score:number) => score <= 4 ? "minimal" : score <= 9 ? "mild" : score <= 14 ? "moderate" : score <= 19 ? "moderately_severe" : "severe";

async function main(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > 32000) {
    return new Response(JSON.stringify({ error: "request too large" }), { status: 413, headers: corsHeaders });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return new Response(JSON.stringify({ error: "invalid request body" }), { status: 400, headers: corsHeaders });
  }
  const authHeader = req.headers.get("Authorization") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
  const client = createClient(supabaseUrl, publishableKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  const { data: allowed, error: rateError } = await client.rpc("consume_rate_limit", { p_endpoint: "analyze-phq9", p_window_seconds: 60, p_max_requests: 5 });
  if (rateError || allowed !== true) return new Response(JSON.stringify({ error: "rate limit exceeded" }), { status: 429, headers: corsHeaders });
  const answers = Array.isArray(body.answers) ? body.answers.slice(0, 9).map((x:any) => Math.max(0, Math.min(3, Number(x) || 0))) : [];
  if (answers.length !== 9) return new Response(JSON.stringify({ error: "PHQ-9 requires 9 answers." }), { status: 400, headers: corsHeaders });

  const score = clamp(answers.reduce((a:number,b:number) => a + b, 0));
  const phq9Band = band(score);
  const language = body.language === "en" ? "English" : "Thai";
  let summary = language === "English" ? `PHQ-9 screening score: ${score}/27 (${phq9Band}). This result is a screening indicator, not a diagnosis.` : `คะแนน PHQ-9 จากการคัดกรอง: ${score}/27 (${phq9Band}). ผลนี้เป็นตัวชี้วัดจากการคัดกรอง ไม่ใช่การวินิจฉัย`;
  let recommendations = language === "English" ? ["Consider talking with someone you trust about how you have been feeling.", "Keep regular sleep, meals, movement, and supportive routines where possible.", "If symptoms are persistent or affect daily life, consider speaking with a qualified mental-health professional."] : ["ลองพูดคุยกับคนที่คุณไว้ใจเกี่ยวกับความรู้สึกที่เกิดขึ้น", "ดูแลการนอน อาหาร การเคลื่อนไหว และกิจวัตรที่ช่วยให้รู้สึกมั่นคงเท่าที่ทำได้", "หากอาการต่อเนื่องหรือรบกวนชีวิตประจำวัน ควรปรึกษาผู้เชี่ยวชาญด้านสุขภาพจิต"];

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (apiKey) {
    const prompt = `You are a supportive youth wellbeing assistant. Explain a PHQ-9 screening result in ${language}. Do not diagnose, do not claim clinical certainty, and do not predict self-harm. Use the provided numeric score and band. Return JSON with summary (2-3 short sentences) and recommendations (3-5 practical supportive suggestions). Do not repeat or reconstruct the questionnaire items. Score: ${score}/27. Band: ${phq9Band}.`;
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: Deno.env.get("OPENAI_MODEL") || "gpt-5.6-luna", input: prompt, text: { format: { type: "json_object" } }, max_output_tokens: 600 }) });
    if (response.ok) {
      const payload = await response.json();
      const raw = payload.output_text || payload.output?.flatMap((x:any) => x.content || []).find((x:any) => x.type === "output_text")?.text;
      try { const ai = JSON.parse(raw); if (typeof ai.summary === "string") summary = ai.summary; if (Array.isArray(ai.recommendations)) recommendations = ai.recommendations.slice(0,5).map(String); } catch {}
    }
  }

  const row = { id: crypto.randomUUID(), created_by_id: userData.user.id, screening_type: "phq9", answers: { phq9: answers }, phq9_score: score, phq9_band: phq9Band, risk_score: score, risk_level: phq9Band, phq9_ai_summary: summary, phq9_recommendations: recommendations, ai_summary: summary, recommendations };
  const { data: saved, error: saveError } = await client.from("assessments").insert(row).select("*").single();
  if (saveError) return new Response(JSON.stringify({ error: saveError.message }), { status: 500, headers: corsHeaders });
  return new Response(JSON.stringify({ id: saved.id, screening_type: "phq9", phq9_score: score, phq9_band: phq9Band, ai_summary: summary, recommendations, analysis_source: apiKey ? "openai" : "screening-fallback" }), { headers: corsHeaders });
}
Deno.serve(main);
