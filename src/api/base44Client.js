import { supabase } from "@/lib/supabaseClient";
import { computeAssessmentResult } from "@/lib/assessmentScoring";

const tableFor = (name) => ({ Assessment: "assessments", GuestAssessment: "guest_assessments", CommunityPost: "community_posts", CommunityComment: "community_comments", EmergencyResource: "emergency_resources", Report: "reports", ContactRequest: "contact_requests", User: "users" }[name] || name);
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const currentAuthUser = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session?.user) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) { if (/session|jwt|auth/i.test(error.message || "")) return null; throw error; }
  return data.user || null;
};
const currentAppUser = async () => {
  const authUser = await currentAuthUser(); if (!authUser) return null;
  const { data: profile, error } = await supabase.from("users").select("id,email,full_name,role,banned,banned_until,created_date,updated_date").eq("id", authUser.id).maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return { id: authUser.id, email: authUser.email, ...authUser.user_metadata, ...(profile || {}) };
};
const entity = (name) => {
  const table = tableFor(name);
  return {
    async list(order = "-created_date", limit = 50) { const field = order.replace(/^-/, ""); const { data, error } = await supabase.from(table).select("*").order(field, { ascending: !order.startsWith("-") }).limit(limit); if (error) throw error; return data || []; },
    async filter(filters = {}, order = "created_date", limit = 100) { const field = order.replace(/^-/, ""); let query = supabase.from(table).select("*"); for (const [key, value] of Object.entries(filters)) query = query.eq(key, value); const { data, error } = await query.order(field, { ascending: !order.startsWith("-") }).limit(limit); if (error) throw error; return data || []; },
    async get(id) { const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle(); if (error) throw error; return data || null; },
    async create(input) { const authUser = await currentAuthUser(); const row = { ...input, id: input?.id || makeId(), created_by_id: input?.created_by_id ?? authUser?.id ?? null }; const { data, error } = await supabase.from(table).insert(row).select("*").single(); if (error) throw error; return data; },
    async update(id, patch) { const { data, error } = await supabase.from(table).update(patch).eq("id", id).select("*").single(); if (error) throw error; return data; },
    async delete(id) { const { error } = await supabase.from(table).delete().eq("id", id); if (error) throw error; return { success: true }; },
  };
};
const entities = new Proxy({}, { get: (_, name) => entity(name) });
async function localGuestAssessment(payload) { return { ...(computeAssessmentResult(payload.answers || [])), id: makeId(), is_guest: true, analysis_source: "local-screening-fallback" }; }

const invoke = async (name, payload = {}) => {
  if (name === "analyzeAssessment") {
    const authUser = await currentAuthUser(); if (!authUser) return { data: await localGuestAssessment(payload) };
    const { data, error } = await supabase.functions.invoke("analyze-assessment", { body: payload });
    if (error) { if (/auth|session|jwt|unauthorized|401/i.test(error.message || "")) return { data: await localGuestAssessment(payload) }; throw error; }
    return { data: { ...(data || {}), is_guest: false } };
  }
  if (name === "analyzePhq9") {
    const authUser = await currentAuthUser(); if (!authUser) throw new Error("Please log in before using PHQ-9 screening.");
    const { data, error } = await supabase.functions.invoke("analyze-phq9", { body: payload });
    if (error) throw error;
    return { data: { ...(data || {}), is_guest: false } };
  }
  if (name === "analyzeCommunityPost") { const { data, error } = await supabase.functions.invoke("analyze-community-post", { body: payload }); if (error) throw error; return { data }; }
  if (name === "communityInteract") { const authUser = await currentAuthUser(); if (!authUser) return { data: { error: "auth_required" } }; const post = await entities.CommunityPost.get(payload.post_id); if (!post) return { data: { error: "not_found" } }; const key = payload.action === "heart" ? "hearted_by" : "bumped_by"; const countKey = payload.action === "heart" ? "hearts" : "bumps"; const users = Array.isArray(post[key]) ? post[key] : []; const next = users.includes(authUser.id) ? users.filter((id) => id !== authUser.id) : [...users, authUser.id]; const updated = await entities.CommunityPost.update(payload.post_id, { [key]: next, [countKey]: next.length }); return { data: { hearts: updated.hearts || 0, bumps: updated.bumps || 0, hearted: (updated.hearted_by || []).includes(authUser.id), bumped: (updated.bumped_by || []).includes(authUser.id) } }; }
  if (name === "createComment") { const authUser = await currentAuthUser(); if (!authUser) return { data: { error: "auth_required" } }; return { data: await entities.CommunityComment.create(payload) }; }
  if (name === "manageBan") { const authUser = await currentAuthUser(); if (!authUser) return { data: { error: "auth_required" } }; const { data: me } = await supabase.from("users").select("role").eq("id", authUser.id).maybeSingle(); if (me?.role !== "admin") return { data: { error: "admin_required" } }; return { data: await entities.User.update(payload.target_id, { banned: !!payload.banned, banned_until: payload.banned_until || null }) }; }
  return { data: { error: `Function ${name} is unavailable.` } };
};

const auth = {
  async me() { return currentAppUser(); },
  async loginViaEmailPassword(email, password) { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; return currentAppUser(); },
  async register({ email, password }) { const { data, error } = await supabase.auth.signUp({ email, password }); if (error) throw error; return data.user ? currentAppUser() : data; },
  async verifyOtp({ email, otpCode }) { const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: "signup" }); if (error) throw error; return { ...data, access_token: data.session?.access_token }; },
  async resendOtp(email) { const { data, error } = await supabase.auth.resend({ type: "signup", email }); if (error) throw error; return data; },
  setToken() {},
  async logout() { const { error } = await supabase.auth.signOut(); if (error) throw error; window.location.hash = "/"; },
  redirectToLogin(returnTo = "/") { window.location.hash = `/login?returnTo=${encodeURIComponent(returnTo)}`; },
  async loginWithProvider(provider = "google", returnTo = "/") { try { const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}${window.location.pathname}#/login?returnTo=${encodeURIComponent(returnTo)}` } }); if (error) throw error; } catch (error) { const message = error?.message || "Google sign-in failed"; if (/provider.*not enabled|unsupported provider/i.test(message)) throw new Error("Google sign-in is not enabled in the SafeSpace Supabase project yet."); throw error; } },
};
export const base44 = { entities, functions: { invoke }, auth };
