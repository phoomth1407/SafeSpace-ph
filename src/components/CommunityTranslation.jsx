import React, { useEffect, useState } from "react";
import { Languages, Loader2 } from "lucide-react";

export default function CommunityTranslation({ text, lang }) {
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPhrase, setSelectedPhrase] = useState("");
  const thaiCount = (text.match(/[\u0E00-\u0E7F]/g) || []).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;
  const target = lang === "en" ? "en" : "th";
  const needsTranslation = target === "en" ? thaiCount > 0 : latinCount > thaiCount;
  useEffect(() => {
    const updateSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) { setSelectedPhrase(""); return; }
      const range = selection.getRangeAt(0);
      const startNode = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
      const endNode = range.endContainer.nodeType === Node.ELEMENT_NODE ? range.endContainer : range.endContainer.parentElement;
      const source = startNode?.closest?.("[data-translation-source]");
      setSelectedPhrase(source && endNode?.closest?.("[data-translation-source]") === source ? selection.toString().trim() : "");
    };
    document.addEventListener("selectionchange", updateSelection);
    return () => document.removeEventListener("selectionchange", updateSelection);
  }, []);
  if (!needsTranslation) return null;

  const translate = async () => {
    if (translated) { setTranslated(""); return; }
    if (!selectedPhrase) {
      setError(lang === "en" ? "Select a word or short phrase in the post or comment first." : "เลือกคำหรือวลีสั้น ๆ ในโพสต์หรือความคิดเห็นก่อน");
      return;
    }
    if (new TextEncoder().encode(selectedPhrase).length > 500) {
      setError(lang === "en" ? "Select a shorter phrase (up to 500 bytes)." : "กรุณาเลือกวลีให้สั้นลง (ไม่เกิน 500 ไบต์)");
      return;
    }
    const selectedThai = /[\u0E00-\u0E7F]/.test(selectedPhrase);
    if ((target === "en" && !selectedThai) || (target === "th" && selectedThai)) {
      setError(lang === "en" ? "Select text written in Thai to translate to English." : "เลือกข้อความภาษาอังกฤษเพื่อแปลเป็นภาษาไทย");
      return;
    }
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ q: selectedPhrase, langpair: target === "en" ? "th|en" : "en|th" });
      const response = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`);
      if (!response.ok) throw new Error("Translation is temporarily unavailable.");
      const result = await response.json();
      const value = result?.responseData?.translatedText;
      if (!value || result?.responseStatus !== 200) throw new Error("Translation is temporarily unavailable.");
      setTranslated(value);
    } catch {
      setError(lang === "en" ? "Could not translate this text right now." : "แปลข้อความนี้ไม่ได้ในขณะนี้");
    } finally { setLoading(false); }
  };

  return <div className="mt-2">
    <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={translate} disabled={loading} title={lang === "en" ? "Only the selected word or short phrase is sent to MyMemory" : "ส่งเฉพาะคำหรือวลีสั้น ๆ ที่เลือกไปยัง MyMemory"} className="inline-flex min-h-7 items-center gap-1 rounded-full border border-slate-700 px-2.5 py-1 text-[10px] text-slate-400 transition hover:border-sky-500/40 hover:text-sky-300 disabled:opacity-50">
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
      {translated ? (lang === "en" ? "Hide translation" : "ซ่อนคำแปล") : (lang === "en" ? "Translate selected word" : "แปลคำที่เลือก")}
    </button>
    {!translated && <span className="ml-2 text-[9px] text-slate-500">{lang === "en" ? "Select a word first · only your selection is sent to MyMemory." : "เลือกคำก่อน · ส่งเฉพาะข้อความที่เลือกไปยัง MyMemory"}</span>}
    {translated && <p className="mt-2 whitespace-pre-wrap rounded-xl border border-sky-500/15 bg-sky-500/5 p-3 text-xs leading-relaxed text-slate-300">{translated}<span className="mt-1 block text-[9px] text-slate-500">{lang === "en" ? "Machine translation · MyMemory" : "แปลอัตโนมัติ · MyMemory"}</span></p>}
    {error && <p role="status" className="mt-1 text-[10px] text-rose-400">{error}</p>}
  </div>;
}
