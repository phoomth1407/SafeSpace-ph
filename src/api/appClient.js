import { supabase } from "@/lib/supabaseClient";
import { computeAssessmentResult } from "@/lib/assessmentScoring";

// Compatibility adapter: existing pages keep the Base44-style API while the
// actual data, auth, and server functions run through Supabase.
const tableFor = (name) => ({
  Assessment: "assessments",
  GuestAssessment: "guest_assessments",
  CommunityPost: "community_posts",
  CommunityComment: "community_comments",
  EmergencyResource: "emergency_resources",
  Report: "reports",
  ContactRequest: "contact_requests",
  User: "users",
}[name] || name);

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const currentAuthUser = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  return sessionData.session?.user || null;
};

const currentAppUser = async () => {
  const authUser = await currentAuthUser();
  if (!authUser) return null;
  const { data: profile, error } = await supabase
    .from("users")
    .select("id,email,full_name,role,banned,banned_until,created_date,updated_date")
    .eq("id", authUser.id)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return {
    id: authUser.id,
    email: authUser.email,
    ...authUser.user_metadata,
    ...(profile || {}),
  };
};

const entity = (name) => {
  const table = tableFor(name);
  return {
    async list(order = "-created_date", limit = 50) {
      const field = order.replace(/^-/, "");
      let query = supabase.from(table).select("*");
      query = query.order(field, { ascending: !order.startsWith("-") });
      const { data, error } = await query.limit(limit);
      if (error) throw error;
      return data || [];
    },
    async filter(filters = {}, order = "created_date", limit = 100) {
      const field = order.replace(/^-/, "");
      let query = supabase.from(table).select("*");
      for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
      query = query.order(field, { ascending: !order.startsWith("-") });
      const { data, error } = await query.limit(limit);
      if (error) throw error;
      return data || [];
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data || null;
    },
    async create(input) {
      const authUser = await currentAuthUser();
      if (!authUser) throw new Error("authentication required");

      const row = {
        ...input,
        id: input?.id || makeId(),
        created_by_id: input?.created_by_id ?? authUser.id,
      };

      // contact_requests intentionally has no SELECT policy for normal users.
      // Do not chain .select() after INSERT, because PostgREST would then
      // require SELECT permission on the inserted row and RLS would reject it.
      if (table === "contact_requests") {
        const { error } = await supabase.from(table).insert(row);
        if (error) throw error;
        return row;
      }

      const { data, error } = await supabase.from(table).insert(row).select("*").single();
      if (error) throw error;
      return data;
    },
    async update(id, patch) {
      const { data, error } = await supabase.from(table).update(patch).eq("id", id).select("*").single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return { success: true };
    },
  };
};

const entities = new Proxy({}, { get: (_, name) => entity(name) });

async function localScreeningAssessment(payload, { isGuest = false } = {}) {
  const result = computeAssessmentResult(payload.answers || []);
  const row = {
    ...result,
    id: makeId(),
    created_by_id: isGuest ? null : (await currentAuthUser())?.id || null,
    created_by: isGuest ? null : (await currentAuthUser())?.email || null,
    age: Number.isFinite(Number(payload.age)) ? Number(payload.age) : null,
    nationality: payload.nationality || "thai",
    screening_type: "wellbeing",
    answers: payload.answers || [],
  };
  if (isGuest) return { ...row, is_guest: true };
  const { data, error } = await supabase.from("assessments").insert(row).select("*").single();
  if (error) throw error;
  return { ...data, is_guest: false, analysis_source: "offline-model" };
}

const invoke = async (name, payload = {}) => {
  if (name === "analyzeAssessment") {
    const authUser = await currentAuthUser();
    if (!authUser) return { data: await localScreeningAssessment(payload, { isGuest: true }) };

    try {
      const { data, error } = await supabase.functions.invoke("analyze-assessment", { body: payload });
      if (error) throw error;
      if (!data || data.error) {
        throw new Error(data?.error || "remote AI analysis unavailable");
      }

      // The current Supabase function may have its own legacy local fallback.
      // Replace that result with the newer offline model and update the same
      // database row so the user does not get a duplicate history entry.
      if (data.analysis_source === "fallback") {
        const offline = computeAssessmentResult(payload.answers || []);
        const patch = {
          risk_level: offline.risk_level,
          risk_score: offline.risk_score,
          depression_chance: offline.depression_chance,
          ai_summary: offline.ai_summary,
          similar_case: offline.similar_case,
          recommendations: offline.recommendations,
          tool_recommendations: offline.tool_recommendations || [],
          analysis_source: "offline-model",
        };

        if (data.id) {
          const { data: updated, error: updateError } = await supabase
            .from("assessments")
            .update(patch)
            .eq("id", data.id)
            .select("*")
            .single();

          if (!updateError && updated) {
            return { data: { ...updated, is_guest: false, analysis_source: "offline-model" } };
          }
        }

        return { data: { ...data, ...patch, is_guest: false, analysis_source: "offline-model" } };
      }

      return { data: { ...data, is_guest: false, analysis_source: data.analysis_source || "ai" } };
    } catch (error) {
      // All remote AI providers unavailable/exhausted: use the local classical
      // screening model so the assessment still produces a usable result.
      const fallback = await localScreeningAssessment(payload, { isGuest: false });
      return {
        data: {
          ...fallback,
          fallback_reason: error?.message || "remote AI unavailable",
          analysis_source: "offline-model",
        },
      };
    }
  }

  if (name === "analyzeCommunityPost") {
    const { data, error } = await supabase.functions.invoke("analyze-community-post", { body: payload });
    if (error) throw error;
    return { data };
  }

  if (name === "communityInteract") {
    const authUser = await currentAuthUser();
    if (!authUser) return { data: { error: "auth_required" } };
    const post = await entities.CommunityPost.get(payload.post_id);
    if (!post) return { data: { error: "not_found" } };
    const key = payload.action === "heart" ? "hearted_by" : "bumped_by";
    const countKey = payload.action === "heart" ? "hearts" : "bumps";
    const users = Array.isArray(post[key]) ? post[key] : [];
    const next = users.includes(authUser.id) ? users.filter((id) => id !== authUser.id) : [...users, authUser.id];
    const updated = await entities.CommunityPost.update(payload.post_id, { [key]: next, [countKey]: next.length });
    return { data: { hearts: updated.hearts || 0, bumps: updated.bumps || 0, hearted: (updated.hearted_by || []).includes(authUser.id), bumped: (updated.bumped_by || []).includes(authUser.id) } };
  }

  if (name === "createComment") {
    const authUser = await currentAuthUser();
    if (!authUser) return { data: { error: "auth_required" } };
    return { data: await entities.CommunityComment.create(payload) };
  }

  if (name === "manageBan") {
    const authUser = await currentAuthUser();
    if (!authUser) return { data: { error: "auth_required" } };
    const { data: me } = await supabase.from("users").select("role").eq("id", authUser.id).maybeSingle();
    if (me?.role !== "admin") return { data: { error: "admin_required" } };
    const result = await entities.User.update(payload.target_id, { banned: !!payload.banned, banned_until: payload.banned_until || null });
    return { data: result };
  }

  return { data: { error: `Function ${name} is unavailable.` } };
};

const auth = {
  async me() {
    return currentAppUser();
  },
  async loginViaEmailPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return currentAppUser();
  },
  async register({ email, password }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data.user ? currentAppUser() : data;
  },
  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: "signup" });
    if (error) throw error;
    return { ...data, access_token: data.session?.access_token };
  },
  async resendOtp(email) {
    const { data, error } = await supabase.auth.resend({ type: "signup", email });
    if (error) throw error;
    return data;
  },
  setToken() {},
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.hash = "/";
  },
  redirectToLogin(returnTo = "/") {
    window.location.hash = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  },
  async loginWithProvider(provider = "google", returnTo = "/") {
    try {
      sessionStorage.setItem("safespace_auth_return_to", returnTo || "/");
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (error) {
      sessionStorage.removeItem("safespace_auth_return_to");
      const message = error?.message || "Google sign-in failed";
      if (/provider.*not enabled|unsupported provider/i.test(message)) {
        throw new Error("Google sign-in is not enabled in the SafeSpace Supabase project yet.");
      }
      throw error;
    }
  },

  async loginWithGoogleIdToken(idToken, returnTo = "/", nonce) {
    sessionStorage.setItem("safespace_auth_return_to", returnTo || "/");
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
      ...(nonce ? { nonce } : {}),
    });
    if (error) {
      sessionStorage.removeItem("safespace_auth_return_to");
      throw error;
    }
  },
};

export const appClient = { entities, functions: { invoke }, auth };
