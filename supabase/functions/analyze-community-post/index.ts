import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Content-Type": "application/json" };

const flag = (text: string) => /(suicide|self[- ]?harm|ฆ่าตัวตาย|ทำร้ายตัวเอง|ไม่อยากมีชีวิต)/i.test(text) ? "high" : /(hopeless|worthless|โดดเดี่ยว|สิ้นหวัง|เครียดมาก|ไม่ไหว)/i.test(text) ? "moderate" : "safe";

async function main(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > 64000) {
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
  const { data: allowed, error: rateError } = await client.rpc("consume_rate_limit", { p_endpoint: "analyze-community-post", p_window_seconds: 60, p_max_requests: 5 });
  if (rateError || allowed !== true) return new Response(JSON.stringify({ error: "rate limit exceeded" }), { status: 429, headers: corsHeaders });
  const content = String(body.content || "").trim();
  if (content.length < 10) return new Response(JSON.stringify({ error: "Content must be at least 10 characters." }), { status: 400, headers: corsHeaders });
  const lang = body.language === "en" ? "en" : "th";
  let aiResponse = lang === "en" ? "Thanks for sharing. Your experience matters, and talking with someone you trust can make difficult moments easier to handle." : "ขอบคุณที่แบ่งปันนะ สิ่งที่คุณเจอมีความหมาย และการคุยกับคนที่ไว้ใจได้อาจช่วยให้รับมือกับช่วงเวลาที่ยากได้ง่ายขึ้น";
  let aiRiskFlag = flag(content);
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (apiKey && body.ai_enabled !== false) {
    const prompt = `You are a supportive youth wellbeing assistant. Reply in ${lang === "en" ? "English" : "Thai"}. Do not diagnose or predict self-harm. Be empathetic, concise, and practical. Classify as safe, moderate, or high concern. Avoid graphic details. User post:\n${content}`;
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: Deno.env.get("OPENAI_MODEL") || "gpt-5.6-luna", input: prompt, max_output_tokens: 300 }) });
    if (response.ok) {
      const payload = await response.json();
      const text = payload.output_text || "";
      if (text.trim()) aiResponse = text.trim();
    }
  }

  const row = { id: crypto.randomUUID(), created_by_id: userData.user.id, author_name: String(body.author_name || "anonymous").trim() || "anonymous", content, category: body.category || "other", ai_response: aiResponse, ai_risk_flag: aiRiskFlag, ai_enabled: body.ai_enabled !== false, is_announcement: false, hearts: 0, bumps: 0, hearted_by: [], bumped_by: [] };
  const { data: saved, error: saveError } = await client.from("community_posts").insert(row).select("*").single();
  if (saveError) return new Response(JSON.stringify({ error: saveError.message }), { status: 500, headers: corsHeaders });
  return new Response(JSON.stringify({ ai_response: aiResponse, ai_risk_flag: aiRiskFlag, ai_enabled: body.ai_enabled !== false, id: saved.id }), { headers: corsHeaders });
}
Deno.serve(main);
