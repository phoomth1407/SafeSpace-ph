import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { Home, Users, Phone, History as HistoryIcon, LogIn, UserPlus, LogOut, Shield, Globe, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import AmbientSoundPlayer from "@/components/AmbientSoundPlayer";
import { BreathingBackdrop } from "@/components/fx";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { t, lang, setLang } = useTranslation();
  const { theme, toggle } = useTheme();
  const isAdmin = user?.role === "admin";
  const pageTheme = location.pathname === "/" ? "ss-page-home" : location.pathname === "/history" ? "ss-page-history" : location.pathname === "/community" ? "ss-page-social" : location.pathname === "/resources" ? "ss-page-resources" : location.pathname === "/assessment" ? "ss-page-assessment" : location.pathname.startsWith("/result") ? "ss-page-result" : location.pathname === "/admin" ? "ss-page-admin" : "ss-page-default";
  const [langOpen, setLangOpen] = useState(false);

  const navItems = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/history", label: t("nav.history"), icon: HistoryIcon },
    { to: "/community", label: t("nav.community"), icon: Users },
    { to: "/resources", label: t("nav.resources"), icon: Phone }
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className={cn("min-h-screen relative overflow-x-clip", theme === "light" && "theme-light", pageTheme)}>
      <BreathingBackdrop />
      <header className="site-header sticky top-0 z-40">
        <div className="site-header-inner max-w-6xl mx-auto px-4 h-16 flex items-center gap-2 min-w-0">
          <Link to="/" className="brand-lockup flex items-center gap-2.5 desktop-header-brand">
            <img src="https://media.base44.com/images/public/6a7e9bed0e0b77fa2b165b69/5e7c91a19_ChatGPTImageSep9202609_49_25PM.png" alt="SafeSpace" className="w-9 h-9 rounded-2xl object-cover ring-1 ring-white/15 shadow-lg" />
            <span className="font-semibold tracking-tight text-slate-100 text-sm">SafeSpace<span className="text-rose-500">.</span></span>
          </Link>

          <div className="header-main flex items-center gap-2 min-w-0 flex-1">
            <nav className="hidden md:flex items-center gap-1 nav-rail desktop-centered-nav min-w-0 flex-1 justify-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to} className={cn("nav-link flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all", active ? "nav-link-active" : "text-slate-400 hover:text-slate-100")}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="header-actions flex items-center gap-1.5 ml-auto flex-shrink-0">
              <button onClick={toggle} title={t("theme.toggle")} className="flex items-center gap-1 text-xs text-slate-400 px-2.5 py-1.5 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-colors">
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <div className="relative">
                <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 text-xs text-slate-400 px-2.5 py-1.5 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-colors">
                  <Globe className="w-3.5 h-3.5" />
                  {lang === "en" ? "EN" : "ไทย"}
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-1 w-28 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50">
                    <button onClick={() => { setLang("th"); setLangOpen(false); }} className={cn("w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800", lang === "th" ? "text-rose-300" : "text-slate-300")}>ภาษาไทย</button>
                    <button onClick={() => { setLang("en"); setLangOpen(false); }} className={cn("w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800", lang === "en" ? "text-rose-300" : "text-slate-300")}>English</button>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-800">
                  {isAdmin && (
                    <Link to="/admin" className={cn("admin-nav-link flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-colors", location.pathname === "/admin" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200")}>
                      <Shield className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t("nav.admin")}</span>
                    </Link>
                  )}
                  <span className="header-user hidden sm:block text-xs text-slate-500 max-w-[120px] truncate">{user?.full_name || user?.email}</span>
                  <button onClick={handleLogout} className="header-logout flex items-center gap-1 text-xs text-slate-400 px-3 py-1.5 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-colors"><LogOut className="w-3.5 h-3.5" />{t("nav.logout")}</button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-slate-800">
                  <Link to="/login" className="flex items-center gap-1 text-xs text-slate-400 px-3 py-1.5 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-colors"><LogIn className="w-3.5 h-3.5" />{t("nav.login")}</Link>
                  <Link to="/register" className="flex items-center gap-1 text-xs text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-white transition-colors"><UserPlus className="w-3.5 h-3.5" />{t("nav.register")}</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AmbientSoundPlayer />

      <main className="page-shell max-w-6xl mx-auto px-4 py-8 md:py-10 pb-24 md:pb-10">
        <Outlet />
      </main>

      <footer className="relative z-[1] max-w-6xl mx-auto px-4 pb-28 md:pb-8 pt-2">
        <div className="border-t border-white/10 pt-5 text-center" />
      </footer>

      <nav className="mobile-nav md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return <Link key={item.to} to={item.to} className={cn("flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all", active ? "mobile-nav-active" : "text-slate-500")}><Icon className="w-5 h-5" /><span className="text-[10px] font-medium">{item.label}</span></Link>;
          })}
        </div>
      </nav>
    </div>
  );
}
