import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Assessment from "@/pages/Assessment";
import AssessmentResult from "@/pages/AssessmentResult";
import Community from "@/pages/Community";
import ContactAdmin from "@/pages/ContactAdmin";
import Resources from "@/pages/Resources";
import History from "@/pages/History";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import LanguageSelect from "@/pages/LanguageSelect";
import { LanguageProvider, useTranslation } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

const AppGate = () => {
  const { hasLang } = useTranslation();
  if (!hasLang) return <LanguageSelect />;
  return <AuthenticatedApp />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // auth_required: อนุญาตโหมด guest (ไม่ redirect)
    // ผู้ใช้สามารถเรียกดูได้ หน้าที่ต้อง login จะแสดง prompt เอง
  }

  // Render the main app
  return (
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
  );
};


function App() {

  return (
    <LanguageProvider>
    <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AppGate />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
    </ThemeProvider>
    </LanguageProvider>
  )
}

export default App
