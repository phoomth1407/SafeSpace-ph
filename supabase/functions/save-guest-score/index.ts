import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://phoomth1407.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: corsHeaders });

  try {
    const body = await req.json();
    const score = body?.risk_score;
    const level = body?.risk_level;
    const language = body?.language === "en" ? "en" : "th";
    const token = body?.claim_token;
    if (!Number.isInteger(score) || score < 0 || score > 100 ||
      !["low", "moderate", "high", "severe"].includes(level) ||
      typeof token !== "string" || !/^[A-Za-z0-9_-]{40,100}$/.test(token)) {
      return new Response(JSON.stringify({ error: "invalid_payload" }), { status: 400, headers: corsHeaders });
    }

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) return new Response(JSON.stringify({ error: "server_configuration_error" }), { status: 500, headers: corsHeaders });
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await admin.from("guest_score_shares").insert({
      risk_score: score,
      risk_level: level,
      language,
      claim_token_hash: await sha256(token),
    });
    if (error) {
      console.error("guest score save failed", error.message);
      return new Response(JSON.stringify({ error: "score_save_failed" }), { status: 500, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ saved: true }), { status: 200, headers: corsHeaders });
  } catch {
    return new Response(JSON.stringify({ error: "invalid_request" }), { status: 400, headers: corsHeaders });
  }
});