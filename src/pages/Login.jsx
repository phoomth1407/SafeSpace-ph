import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "912407578947-p1vbqspkg2e1v3k4lk6o4qu49ofe7u02.apps.googleusercontent.com";

async function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = btoa(String.fromCharCode(...bytes));
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(nonce),
  );
  const hashedNonce = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return { nonce, hashedNonce };
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  useEffect(() => {
    let cancelled = false;
    let script = null;

    const initializeGoogleOneTap = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled || data.session) return;

        const start = async () => {
          if (cancelled || !window.google?.accounts?.id) return;
          const { nonce, hashedNonce } = await createNonce();

          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            nonce: hashedNonce,
            use_fedcm_for_prompt: true,
            cancel_on_tap_outside: true,
            callback: async (response) => {
              if (!response?.credential) {
                setError("Google did not return a sign-in credential.");
                return;
              }

              setError("");
              setLoading(true);
              try {
                const { error: signInError } = await supabase.auth.signInWithIdToken({
                  provider: "google",
                  token: response.credential,
                  nonce,
                });
                if (signInError) throw signInError;
                window.location.hash = returnTo || "/";
              } catch (signInError) {
                setError(signInError?.message || "Google One Tap sign-in failed.");
              } finally {
                setLoading(false);
              }
            },
          });

          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() && !cancelled) {
              console.debug(
                "Google One Tap not displayed:",
                notification.getNotDisplayedReason(),
              );
            }
            if (notification.isSkippedMoment() && !cancelled) {
              console.debug(
                "Google One Tap skipped:",
                notification.getSkippedReason(),
              );
            }
          });
        };

        if (window.google?.accounts?.id) {
          await start();
          return;
        }

        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = start;
        script.onerror = () => {
          if (!cancelled) setError("Could not load Google One Tap.");
        };
        document.head.appendChild(script);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError?.message || "Could not initialize Google One Tap.");
        }
      }
    };

    void initializeGoogleOneTap();

    return () => {
      cancelled = true;
      try {
        window.google?.accounts?.id?.cancel?.();
      } catch (_) {
        // Ignore cleanup errors from Google's SDK.
      }
      if (script) script.remove();
    };
  }, [returnTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await base44.auth.loginWithProvider("google", returnTo);
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="text-primary font-medium hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <div className="mb-6">
        <p className="text-xs text-muted-foreground text-center mb-3">
          Google One Tap is available when Google can verify your account.
        </p>
        <div id="google-one-tap" aria-label="Google One Tap sign-in" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6 text-foreground"
        onClick={handleGoogle}
        disabled={loading}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
