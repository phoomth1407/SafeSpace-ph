import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://phoomth1407.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

function headersFor(origin: string | null) {
  const allowedOrigin = origin && allowedOrigins.has(origin)
    ? origin
    : origin ? "null" : "https://phoomth1407.github.io";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json",
  };
}

function json(body: Record<string, string>, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers });
}

Deno.serve(async (req: Request) => {
  const headers = headersFor(req.headers.get("Origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, headers);

  const authHeader = req.headers.get("Authorization") || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!accessToken) return json({ error: "authentication_required" }, 401, headers);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
    console.error("delete-account is missing required Supabase configuration");
    return json({ error: "account_deletion_unavailable" }, 500, headers);
  }

  const userClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(accessToken);
  const user = userData.user;
  if (userError || !user) return json({ error: "authentication_required" }, 401, headers);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userId = user.id;

  try {
    const deleteOwned = async (table: string, column = "created_by_id") => {
      const { error } = await admin.from(table).delete().eq(column, userId);
      if (error) throw new Error(`Could not delete account-owned ${table} records`);
    };

    // Remove this account's reactions from posts that belong to other people.
    // Recalculate counts from the stored identity lists while preserving other users' reactions.
    for (const [column, countColumn] of [["hearted_by", "hearts"], ["bumped_by", "bumps"]]) {
      const { data: posts, error: queryError } = await admin
        .from("community_posts")
        .select(`id,created_by_id,${column}`)
        .contains(column, [userId]);
      if (queryError) throw new Error("Could not remove account reactions");
      for (const post of posts || []) {
        if (post.created_by_id === userId) continue;
        const remaining = (Array.isArray(post[column]) ? post[column] : []).filter((id: string) => id !== userId);
        const { error } = await admin.from("community_posts")
          .update({ [column]: remaining, [countColumn]: remaining.length })
          .eq("id", post.id);
        if (error) throw new Error("Could not remove account reactions");
      }
    }

    // Delete user-authored content and account-linked records before removing Auth.
    // Tables with auth.users foreign keys (profile, moods, preferences, policies,
    // claimed guest shares) also cascade when the Auth user is deleted below.
    await deleteOwned("community_comments");
    await deleteOwned("community_posts");
    await deleteOwned("assessments");
    await deleteOwned("guest_assessments");
    await deleteOwned("contact_requests");
    await deleteOwned("reports");
    const { error: reportsAboutUserError } = await admin.from("reports").delete().eq("reported_user_id", userId);
    if (reportsAboutUserError) throw new Error("Could not delete account-related reports");
    const { error: rateLimitError } = await admin.from("edge_rate_limits").delete().eq("user_id", userId);
    if (rateLimitError) throw new Error("Could not delete account rate-limit records");

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) throw new Error("Could not delete the SafeSpace account");

    return json({ success: "account_deleted" }, 200, headers);
  } catch (error) {
    console.error("delete-account failed", error instanceof Error ? error.message : "unknown error");
    return json({ error: "account_deletion_incomplete" }, 500, headers);
  }
});
