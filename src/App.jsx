import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { LanguageProvider, useTranslation } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import { RefreshCw } from "lucide-react";
import Preloader from "./components/Preloader/Preloader";
import RouteTransition from "./components/RouteTransition/RouteTransition";

const Layout = lazy(() => import("@/components/Layout"));
const Home = lazy(() => import("@/pages/Home"));
const Assessment = lazy(() => import("@/pages/Assessment"));
const AssessmentResult = lazy(() => import("@/pages/AssessmentResult"));
const Community = lazy(() => import("@/pages/Community"));
const ContactAdmin = lazy(() => import("@/pages/ContactAdmin"));
const Resources = lazy(() => import("@/pages/Resources"));
const History = lazy(() => import("@/pages/History"));
const Admin = lazy(() => import("@/pages/Admin"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const LanguageSelect = lazy(() => import("@/pages/LanguageSelect"));

const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'development';

const VersionGate = ({ children }) => {
  const { lang } = useTranslation();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');

  useEffect(() => {
    if (APP_VERSION === 'development') return undefined;

    let cancelled = false;

    const checkForNewVersion = async () => {
      try {
        const response = await fetch("./version.json?ts=" + Date.now(), {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!response.ok) return;

        const latest = await response.json();
        if (!cancelled && latest.version && latest.version !== APP_VERSION) {
          setLatestVersion(latest.version);
          setUpdateAvailable(true);
        }
      } catch {
        // A failed version check must never prevent the app from loading.
      }
    };

    checkForNewVersion();
    const interval = window.setInterval(checkForNewVersion, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const isEnglish = lang === "en";

  return (
    <>
      {children}

      {updateAvailable && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="safespace-update-title"
          aria-describedby="safespace-update-description"
        >
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[28px] backdrop-saturate-50" />

          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-7 text-center shadow-2xl shadow-slate-950/30 dark:border-slate-700/80 dark:bg-slate-900/95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 ring-1 ring-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20">
              <RefreshCw className="h-7 w-7" strokeWidth={2} />
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600 dark:text-sky-300">
                SafeSpace
              </p>
              <h2 id="safespace-update-title" className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {isEnglish ? "A new version is ready" : "มี SafeSpace เวอร์ชันใหม่แล้ว"}
              </h2>
              <p id="safespace-update-description" className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {isEnglish
                  ? "Please update SafeSpace to continue with the latest improvements and fixes."
                  : "กรุณาอัปเดต SafeSpace เพื่อใช้งานการปรับปรุงและการแก้ไขล่าสุด"}
              </p>
            </div>

            {latestVersion && (
              <div className="mt-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                {isEnglish ? "New version " + latestVersion : "เวอร์ชันใหม่ " + latestVersion}
              </div>
            )}

            <button
              type="button"
              onClick={handleUpdate}
              className="safespace-update-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            >
              <RefreshCw className="h-4 w-4" />
              {isEnglish ? "Update SafeSpace" : "อัปเดต SafeSpace"}
            </button>

            <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
              {isEnglish ? "The page will refresh after you click Update." : "เว็บไซต์จะโหลดใหม่หลังจากกดอัปเดต"}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

const RouteLoading = () => (
  <div className="min-h-[40vh] flex items-center justify-center" role="status" aria-live="polite">
    <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" aria-label="Loading" />
  </div>
);

const AppGate = () => {
  const { hasLang, lang } = useTranslation();
  return hasLang ? <AuthenticatedApp /> : <LanguageSelect />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <RouteLoading />;

  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/result" element={<AssessmentResult />} />
          <Route path="/result/:id" element={<AssessmentResult />} />
          <Route path="/community" element={<Community />} />
          <Route path="/contact-admin" element={<ContactAdmin />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <ScrollToTop />
              <VersionGate>
                <AppGate />
                <RouteTransition lang={lang} />
              </VersionGate>
            </Router>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
