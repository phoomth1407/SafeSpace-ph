import React, { useEffect, useRef, useState } from "react";
import { Languages, Loader2 } from "lucide-react";

const MAX_SEGMENT_BYTES = 440;

function byteLength(value) {
  return new TextEncoder().encode(value).length;
}

function graphemes(value) {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value), (part) => part.segment);
  }
  return Array.from(value);
}

function splitLine(line) {
  if (byteLength(line) <= MAX_SEGMENT_BYTES) return [line];
  const parts = [];
  let remaining = line;
  while (remaining && byteLength(remaining) > MAX_SEGMENT_BYTES) {
    const chars = graphemes(remaining);
    let bytes = 0;
    let limit = 0;
    let preferred = 0;
    for (let index = 0; index < chars.length; index += 1) {
      const nextBytes = byteLength(chars[index]);
      if (bytes + nextBytes > MAX_SEGMENT_BYTES) break;
      bytes += nextBytes;
      limit = index + 1;
      if (/\s|[.!?。！？、，；：]/u.test(chars[index])) preferred = index + 1;
    }
    const cut = preferred > Math.floor(limit * 0.6) ? preferred : limit;
    if (!cut) break;
    parts.push(chars.slice(0, cut).join("").trim());
    remaining = chars.slice(cut).join("").trimStart();
  }
  if (remaining) parts.push(remaining.trim());
  return parts.filter(Boolean);
}

function splitForTranslation(value) {
  return value.split("\n").flatMap((line) => line ? splitLine(line) : [""]);
}

function decodeEntities(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function languageCounts(value) {
  const thai = (value.match(/[\u0E00-\u0E7F]/gu) || []).length;
  const latin = (value.match(/[A-Za-z]/gu) || []).length;
  return { thai, latin };
}

export default function CommunityTranslation({ text = "", lang = "en" }) {
  const [translated, setTranslated] = useState("");
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const controllerRef = useRef(null);

  const target = lang === "en" ? "en" : "th";
  const { thai, latin } = languageCounts(text);
  const source = thai > latin ? "th" : "en";
  const hasWords = thai + latin > 0;
  const needsTranslation = Boolean(text.trim()) && hasWords && source !== target;
  const targetName = target === "en" ? "English" : "ไทย";

  useEffect(() => {
    controllerRef.current?.abort();
    setTranslated("");
    setVisible(true);
    setLoading(false);
    setProgress(null);
    setError("");
    return () => controllerRef.current?.abort();
  }, [text, target]);

  if (!needsTranslation) return null;

  const translateWholeText = async () => {
    if (translated) {
      setVisible((current) => !current);
      setError("");
      return;
    }

    const requestController = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = requestController;
    setLoading(true);
    setError("");
    const chunks = splitForTranslation(text);

    try {
      const results = [];
      for (let index = 0; index < chunks.length; index += 1) {
        const chunk = chunks[index];
        if (!chunk) {
          results.push("");
          continue;
        }

        setProgress({ current: index + 1, total: chunks.filter(Boolean).length });
        const params = new URLSearchParams({
          q: chunk,
          langpair: source === "th" ? "th|en" : "en|th",
        });
        const response = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`, {
          signal: requestController.signal,
          headers: { Accept: "application/json" },
        });
        let result;
        try {
          result = await response.json();
        } catch {
          throw new Error("unavailable");
        }

        const detail = String(result?.responseDetails || "");
        if (!response.ok || Number(result?.responseStatus) !== 200 || !result?.responseData?.translatedText) {
          if (/quota|daily|limit|too many/i.test(detail)) throw new Error("quota");
          throw new Error("unavailable");
        }
        results.push(decodeEntities(result.responseData.translatedText));
      }

      if (controllerRef.current === requestController) {
        const joiner = target === "en" ? " " : "";
        setTranslated(results.join(joiner));
        setVisible(true);
      }
    } catch (translateError) {
      if (translateError?.name === "AbortError") return;
      setError(translateError?.message === "quota"
        ? (lang === "en" ? "The free translation limit has been reached. Please try again later." : "ถึงขีดจำกัดการแปลฟรีแล้ว กรุณาลองใหม่ภายหลัง")
        : (lang === "en" ? "The translation service is unavailable right now. Please try again later." : "บริการแปลภาษาใช้งานไม่ได้ในขณะนี้ กรุณาลองใหม่ภายหลัง"));
    } finally {
      if (controllerRef.current === requestController) {
        setLoading(false);
        setProgress(null);
      }
    }
  };

  const buttonText = loading
    ? (lang === "en" ? "Translating full text…" : "กำลังแปลทั้งข้อความ…")
    : translated
      ? (visible ? (lang === "en" ? "Hide translation" : "ซ่อนคำแปล") : (lang === "en" ? "Show translation" : "แสดงคำแปล"))
      : (lang === "en" ? "Translate full text" : "แปลทั้งข้อความ");

  return <div className="mt-2">
    <button
      type="button"
      onClick={translateWholeText}
      disabled={loading}
      aria-expanded={Boolean(translated && visible)}
      className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-sky-500/25 bg-sky-500/5 px-3 py-1.5 text-xs font-semibold text-sky-200 transition hover:border-sky-400/60 hover:bg-sky-500/10 hover:text-white disabled:cursor-wait disabled:opacity-70"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Languages className="h-3.5 w-3.5" aria-hidden="true" />}
      {buttonText}
    </button>
    {loading && progress && <span className="ml-2 text-[10px] text-slate-500" role="status">{progress.current}/{progress.total}</span>}
    {error && <p role="status" className="mt-2 text-xs text-rose-400">{error}</p>}
    {translated && visible && <div className="mt-2 rounded-xl border border-sky-500/15 bg-sky-500/5 p-3">
      <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-200">{translated}</p>
      <span className="mt-2 block text-[10px] text-slate-500">{lang === "en" ? `Machine translation · MyMemory · ${targetName}` : `แปลอัตโนมัติ · MyMemory · ${targetName}`}</span>
    </div>}
  </div>;
}
