import { describe, expect, it, vi } from "vitest";
import { ANALYSIS_SOURCES, runWithFallbacks } from "../src/lib/aiFallback";

describe("assessment AI fallback chain", () => {
  it("uses OpenAI when the primary provider succeeds", async () => {
    const primary = vi.fn().mockResolvedValue({ risk_score: 20 });
    const secondary = vi.fn();
    const fallback = vi.fn();

    const result = await runWithFallbacks({ primary, secondary, fallback });

    expect(result.source).toBe(ANALYSIS_SOURCES.OPENAI);
    expect(result.result.risk_score).toBe(20);
    expect(primary).toHaveBeenCalledOnce();
    expect(secondary).not.toHaveBeenCalled();
    expect(fallback).not.toHaveBeenCalled();
  });

  it("falls back to Gemini when OpenAI fails", async () => {
    const primary = vi.fn().mockRejectedValue(new Error("OpenAI unavailable"));
    const secondary = vi.fn().mockResolvedValue({ risk_score: 45 });
    const fallback = vi.fn();

    const result = await runWithFallbacks({ primary, secondary, fallback });

    expect(result.source).toBe(ANALYSIS_SOURCES.GEMINI);
    expect(result.result.risk_score).toBe(45);
    expect(primary).toHaveBeenCalledOnce();
    expect(secondary).toHaveBeenCalledOnce();
    expect(fallback).not.toHaveBeenCalled();
    expect(secondary.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("uses the local fallback when both AI providers fail", async () => {
    const primaryError = new Error("OpenAI unavailable");
    const secondaryError = new Error("Gemini unavailable");

    const primary = vi.fn().mockRejectedValue(primaryError);
    const secondary = vi.fn().mockRejectedValue(secondaryError);
    const fallback = vi.fn().mockResolvedValue({
      risk_score: 25,
      risk_level: "low",
      analysis_source: "fallback",
    });

    const result = await runWithFallbacks({ primary, secondary, fallback });

    expect(result.source).toBe(ANALYSIS_SOURCES.FALLBACK);
    expect(result.result).toEqual({
      risk_score: 25,
      risk_level: "low",
      analysis_source: "fallback",
    });
    expect(fallback).toHaveBeenCalledOnce();
    expect(fallback.mock.calls[0][0]).toBe(secondaryError);
  });

  it("never silently returns an undefined result", async () => {
    const result = await runWithFallbacks({
      primary: vi.fn().mockRejectedValue(new Error("OpenAI unavailable")),
      secondary: vi.fn().mockRejectedValue(new Error("Gemini unavailable")),
      fallback: vi.fn().mockResolvedValue({ risk_level: "low" }),
    });

    expect(result.result).toBeDefined();
    expect(result.source).toBe(ANALYSIS_SOURCES.FALLBACK);
  });
});
