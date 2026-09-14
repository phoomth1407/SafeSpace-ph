// Pure, runtime-agnostic helpers for the assessment AI fallback chain.
// Kept free of Deno/Supabase imports so Vitest can test the behavior directly.

export const ANALYSIS_SOURCES = {
  OPENAI: "openai",
  GEMINI: "gemini",
  FALLBACK: "fallback",
};

export async function runWithFallbacks({
  primary,
  secondary,
  fallback,
}) {
  try {
    const primaryResult = await primary();
    return { source: ANALYSIS_SOURCES.OPENAI, result: primaryResult };
  } catch (primaryError) {
    try {
      const secondaryResult = await secondary(primaryError);
      return { source: ANALYSIS_SOURCES.GEMINI, result: secondaryResult };
    } catch (secondaryError) {
      const fallbackResult = await fallback(secondaryError);
      return { source: ANALYSIS_SOURCES.FALLBACK, result: fallbackResult };
    }
  }
}
