import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "@/lib/i18n";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "912407578947-p1vbqspkg2e1v3k4lk6o4qu49ofe7u02.apps.googleusercontent.com";

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const raw = btoa(String.fromCharCode(...bytes));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { raw, hashed };
}

export default function GoogleOneTap({ returnTo = "/" }) {
  const { lang } = useTranslation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        await loadGoogleScript();
        if (cancelled || !window.google?.accounts?.id) return;

        const { raw, hashed } = await createNonce();

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (!response?.credential) return;
            try {
              await base44.auth.loginWithGoogleIdToken(response.credential, returnTo, raw);
            } catch (error) {
              if (!cancelled) {
                setMessage(error?.message || (lang === "en" ? "Google sign-in failed." : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ"));
              }
            }
          },
          nonce: hashed,
          use_fedcm_for_prompt: true,
          auto_select: false,
        });

        window.google.accounts.id.prompt();
      } catch {
        if (!cancelled) {
          setMessage(lang === "en" ? "Google One Tap is unavailable right now." : "Google One Tap ยังไม่พร้อมใช้งานในขณะนี้");
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      try {
        window.google?.accounts?.id?.cancel();
      } catch {}
    };
  }, [returnTo, lang]);

  if (!message) return null;

  return <p className="mt-3 text-xs text-destructive text-center">{message}</p>;
}
