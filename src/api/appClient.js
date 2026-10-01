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

const PRIVATE_ASSESSMENT_CACHE = "safespace_private_assessment_results_v1";
function cachePrivateAssessment(result) {
  if (!result?.id || typeof window === "undefined") return;
  try {
    const existing = JSON.parse(window.localStorage.getItem(PRIVATE_ASSESSMENT_CACHE) || "{}");
    const cache = existing && typeof existing === "object" && !Array.isArray(existing) ? existing : {};
    cache[result.id] = result;
    const entries = Object.entries(cache).slice(-20);
    window.localStorage.setItem(PRIVATE_ASSESSMENT_CACHE, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // The assessment remains available for this page view if local storage is unavailable.
  }
}
function getCachedPrivateAssessment(id) {
  if (!id || typeof window === "undefined") return null;
  try {
    const cache = JSON.parse(window.localStorage.getItem(PRIVATE_ASSESSMENT_CACHE) || "{}");
    return cache && typeof cache === "object" ? cache[id] || null : null;
  } catch { return null; }
}
function removeCachedPrivateAssessment(id) {
  if (!id || typeof window === "undefined") return;
  try {
    const cache = JSON.parse(window.localStorage.getItem(PRIVATE_ASSESSMENT_CACHE) || "{}");
    if (!cache || typeof cache !== "object" || Array.isArray(cache) || !(id in cache)) return;
    delete cache[id];
    window.localStorage.setItem(PRIVATE_ASSESSMENT_CACHE, JSON.stringify(cache));
  } catch {
    // Database deletion still proceeds if browser storage is unavailable.
  }
}

async function validatePasswordBeforeSignup(password) {
  if (typeof password !== "string" || password.length < 12) {
    throw new Error("Password must be at least 12 characters long.");
  }
  if (password.length > 128) {
    throw new Error("Password is too long.");
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw new Error("Password must include uppercase, lowercase, a number, and a symbol.");
  }

  try {
    const digest = await crypto.subtle.digest(
      "SHA-1",
      new TextEncoder().encode(password)
    );
    const hash = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      { headers: { "Add-Padding": "true" } }
    );
    if (!response.ok) return;

    const lines = (await response.text()).split("\n");
    const match = lines.find((line) => line.trim().toUpperCase().startsWith(`${suffix}:`));
    if (match) {
      throw new Error("This password has appeared in known data breaches. Please choose a different password.");
    }
  } catch (error) {
    if (/appeared in known data breaches/i.test(error?.message || "")) throw error;
  }
}


const currentAuthUser = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  return sessionData.session?.user || null;
};

const currentAppUser = async () => {
  let authUser = await currentAuthUser();
  if (!authUser) return null;
  try {
    const pendingAge = Number(window.sessionStorage.getItem("safespace_pending_oauth_age"));
    if (Number.isInteger(pendingAge) && pendingAge >= 13 && pendingAge <= 120 && Number(authUser.user_metadata?.age) !== pendingAge) {
      const { data, error } = await supabase.auth.updateUser({ data: { age: pendingAge } });
      if (!error && data?.user) authUser = data.user;
    }
    window.sessionStorage.removeItem("safespace_pending_oauth_age");
  } catch {}

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
      if (table === "assessments") await claimPendingGuestScores();
      const field = order.replace(/^-/, "");
      const columns = table === "assessments"
        ? "id,created_date,updated_date,created_by_id,risk_level,risk_score,screening_type,analysis_source,language"
        : table === "guest_assessments"
          ? "id,created_date,updated_date,risk_level,risk_score,language"
          : "*";
      let query = supabase.from(table).select(columns);
      query = query.order(field, { ascending: !order.startsWith("-") });
      const { data, error } = await query.limit(limit);
      if (error) throw error;
      if (table === "assessments") {
        const { data: shared, error: sharedError } = await supabase.rpc("get_my_guest_score_shares");
        if (sharedError) throw sharedError;
        return [...(data || []), ...(shared || []).map((item) => ({ ...item, created_date: item.created_at, screening_type: "wellbeing", analysis_source: "guest-shared", ai_summary: "Guest-shared risk score", is_shared_guest_score: true }))].sort((a,b) => new Date(b.created_date)-new Date(a.created_date)).slice(0,limit);
      }
      return data || [];
    },
    async filter(filters = {}, order = "created_date", limit = 100) {
      const field = order.replace(/^-/, "");
      const columns = table === "assessments"
        ? "id,created_date,updated_date,created_by_id,risk_level,risk_score,screening_type,analysis_source,language"
        : table === "guest_assessments"
          ? "id,created_date,updated_date,risk_level,risk_score,language"
          : "*";
      let query = supabase.from(table).select(columns);
      for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
      query = query.order(field, { ascending: !order.startsWith("-") });
      const { data, error } = await query.limit(limit);
      if (error) throw error;
      return data || [];
    },
    async get(id) {
      const columns = table === "assessments"
        ? "id,created_date,updated_date,created_by_id,risk_level,risk_score,screening_type,analysis_source,language"
        : table === "guest_assessments"
          ? "id,created_date,updated_date,risk_level,risk_score,language"
          : "*";
      const { data, error } = await supabase.from(table).select(columns).eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const privateResult = table === "assessments" ? getCachedPrivateAssessment(id) : null;
      if (privateResult) return { ...data, ...privateResult, id: data.id, created_date: data.created_date };


      return data;
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
      if (table === "assessments") removeCachedPrivateAssessment(id);
      return { success: true };
    },
  };
};

const entities = new Proxy({}, { get: (_, name) => entity(name) });

async function localScreeningAssessment(payload, { isGuest = false } = {}) {
  const result = computeAssessmentResult(payload.answers || [], payload.language || "th");
  const authUser = isGuest ? null : await currentAuthUser();
  const row = {
    id: makeId(),
    created_by_id: authUser?.id || null,
    risk_level: result.risk_level,
    risk_score: result.risk_score,
    screening_type: "wellbeing",
    language: payload.language === "en" ? "en" : "th",
    analysis_source: "offline-model",
    ...(payload.sensitive_data_consent === true ? {
      consent_version: payload.consent_version,
      sensitive_data_consent_at: new Date().toISOString(),
    } : {}),
  };
  const privateResult = {
    ...result,
    ...row,
    created_by: null,
    age: Number.isFinite(Number(payload.age)) ? Number(payload.age) : null,
    nationality: payload.nationality || "thai",
    answers: payload.answers || [],
    is_guest: isGuest,
  };
  if (isGuest) return privateResult;
  const { data, error } = await supabase.from("assessments")
    .insert(row)
    .select("id,created_date,risk_level,risk_score,screening_type,analysis_source,language")
    .single();
  if (error) throw error;
  const fullResult = { ...privateResult, ...data, is_guest: false };
  cachePrivateAssessment(fullResult);
  return fullResult;
}

const GUEST_SCORE_CLAIM_KEY = "safespace_guest_score_claim_token_v1";
async function claimPendingGuestScores() {
  const authUser = await currentAuthUser();
  if (!authUser || typeof window === "undefined") return;
  let tokens = [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(GUEST_SCORE_CLAIM_KEY) || "[]");
    tokens = Array.isArray(stored) ? stored.filter((token) => /^[A-Za-z0-9_-]{40,100}$/.test(token)) : [];
  } catch {}
  const remaining = [];
  for (const token of [...new Set(tokens)]) {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    const tokenHash = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const { data, error } = await supabase.rpc("claim_guest_score", { p_token_hash: tokenHash });
    if (error) { remaining.push(token); continue; }
    if (data !== true) remaining.push(token);
  }
  try {
    if (remaining.length) window.localStorage.setItem(GUEST_SCORE_CLAIM_KEY, JSON.stringify(remaining));
    else window.localStorage.removeItem(GUEST_SCORE_CLAIM_KEY);
  } catch {}
}

const invoke = async (name, payload = {}) => {
  if (name === "adminGuestScoreShares") {
    const authUser = await currentAuthUser();
    if (!authUser) return { data: { error: "auth_required" } };
    const { data, error } = await supabase.rpc("admin_list_guest_score_shares");
    if (error) throw error;
    return { data: data || [] };
  }
  if (name === "saveGuestScore") {
    const token = payload.claim_token;
    if (!/^[A-Za-z0-9_-]{40,100}$/.test(token || "")) return { data: { error: "invalid_claim_token" } };
    const { data, error } = await supabase.functions.invoke("save-guest-score", {
      body: { risk_score: payload.risk_score, risk_level: payload.risk_level, language: payload.language, claim_token: token },
    });
    if (error) throw error;
    if (data?.saved === true) {
      try {\n        const stored = JSON.parse(window.localStorage.getItem(GUEST_SCORE_CLAIM_KEY) || "[]");\n        const tokens = Array.isArray(stored) ? stored : [];\n        window.localStorage.setItem(GUEST_SCORE_CLAIM_KEY, JSON.stringify([...new Set([...tokens, token])].slice(-20)));\n      } catch {}
    }
    return { data: data || {} };
  }
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
      if (data.id) cachePrivateAssessment({
        ...computeAssessmentResult(payload.answers || [], payload.language || "th"),
        ...data,
        answers: payload.answers || [],
        age: payload.age,
        nationality: payload.nationality,
        is_guest: false,
      });

      if (data.analysis_source === "fallback") {
        const offline = computeAssessmentResult(payload.answers || [], payload.language || "th");
        const privateResult = {
          ...data,
          ...offline,
          answers: payload.answers || [],
          age: payload.age,
          nationality: payload.nationality,
          is_guest: false,
          analysis_source: "offline-model",
        };
        cachePrivateAssessment(privateResult);
        return { data: privateResult };
      }

      if (data.id) {
        const selectedLanguage = payload.language === "en" ? "en" : "th";
        if (data.language !== selectedLanguage) {
          const { data: localized } = await supabase
            .from("assessments")
            .update({ language: selectedLanguage })
            .eq("id", data.id)
            .select("id,created_date,updated_date,created_by_id,risk_level,risk_score,screening_type,analysis_source,language")
            .single();
          if (localized) {
            return { data: { ...localized, is_guest: false, analysis_source: localized.analysis_source || data.analysis_source || "ai" } };
          }
        }
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

  if (name === "createCommunityPost") {
    const authUser = await currentAuthUser();
    if (!authUser) return { data: { error: "auth_required" } };

    const { data, error } = await supabase.rpc("create_community_post", {
      p_author_name: payload.author_name ?? "anonymous",
      p_content: payload.content,
      p_category: payload.category ?? "other",
      p_ai_response: payload.ai_response ?? "",
      p_ai_risk_flag: payload.ai_risk_flag ?? "safe",
      p_ai_enabled: false,
    });

    if (error) throw error;
    return { data };
  }

  if (name === "createCommunityAnnouncement") {
    const authUser = await currentAuthUser();
    if (!authUser) return { data: { error: "auth_required" } };

    const { data, error } = await supabase.rpc("create_community_announcement", {
      p_content: payload.content,
    });

    if (error) throw error;
    return { data };
  }

  if (name === "analyzeCommunityPost") {
    const authUser = await currentAuthUser();
    if (!authUser) return { data: { error: "auth_required" } };

    const { data, error } = await supabase.functions.invoke("analyze-community-post", { body: payload });
    if (error) {
      let message = error.message || "Community post could not be submitted.";
      try {
        const body = await error.context?.json?.();
        if (body?.error) message = body.error;
      } catch {}
      return { data: { error: message } };
    }
    return { data: data || {} };
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
    const user = await currentAppUser();
    if (user) await claimPendingGuestScores();
    return user;
  },
  async loginViaEmailPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return currentAppUser();
  },
  async register({ email, password, age }) {
    await validatePasswordBeforeSignup(password);
    if (!Number.isInteger(age) || age < 13 || age > 120) {
      throw new Error("A valid age of 13 or older is required.");
    }
    // Store only the calculated age in Auth user metadata; never send the birthdate.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { age } },
    });
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
  async loginWithProvider(provider = "google", returnTo = "/", age) {
    try {
      if (!Number.isInteger(age) || age < 13 || age > 120) throw new Error("A valid age of 13 or older is required.");
      sessionStorage.setItem("safespace_pending_oauth_age", String(age));
      sessionStorage.setItem("safespace_auth_return_to", returnTo || "/");
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (error) {
      sessionStorage.removeItem("safespace_auth_return_to");
      sessionStorage.removeItem("safespace_pending_oauth_age");
      const message = error?.message || "Google sign-in failed";
      if (/provider.*not enabled|unsupported provider/i.test(message)) {
        throw new Error("Google sign-in is not enabled in the SafeSpace Supabase project yet.");
      }
      throw error;
    }
  },

  async loginWithGoogleIdToken(idToken, returnTo = "/", nonce, age) {
    if (!Number.isInteger(age) || age < 13 || age > 120) throw new Error("A valid age of 13 or older is required.");
    sessionStorage.setItem("safespace_pending_oauth_age", String(age));
    sessionStorage.setItem("safespace_auth_return_to", returnTo || "/");
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
      ...(nonce ? { nonce } : {}),
    });
    if (error) {
      sessionStorage.removeItem("safespace_auth_return_to");
      sessionStorage.removeItem("safespace_pending_oauth_age");
      throw error;
    }
  },
};

export const appClient = { entities, functions: { invoke }, auth };
