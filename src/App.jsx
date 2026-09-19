import React, { lazy, Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { LanguageProvider, useTranslation } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';

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
  useEffect(() => {
    if (APP_VERSION === 'development') return undefined;

    let cancelled = false;

    const checkForNewVersion = async () => {
      try {
        const response = await fetch(`./version.json?ts=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!response.ok) return;

        const latest = await response.json();
        if (!cancelled && latest.version && latest.version !== APP_VERSION) {
          window.location.reload();
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

  return children;
};

const RouteLoading = () => (
  <div className="min-h-[40vh] flex items-center justify-center" role="status" aria-live="polite">
    <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" aria-label="Loading" />
  </div>
);

const AppGate = () => {
  const { hasLang } = useTranslation();
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
              </VersionGate>
            </Router>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
