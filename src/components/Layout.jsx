import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { Home, Users, Phone, History as HistoryIcon, LogIn, UserPlus, LogOut, Shield, Globe, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { t, lang, setLang } = useTranslation();
  const { theme, toggle } = useTheme();
  const isAdmin = user?.role === "admin";
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
    <div className={cn("min-h-screen bg-slate-950", theme === "light" && "theme-light")}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/6a7e9bed0e0b77fa2b165b69/5e7c91a19_ChatGPTImageSep9202609_49_25PM.png" alt="SafeSpace" className="w-8 h-8 rounded-xl object-cover" />
            <span className="font-semibold text-slate-100 text-sm">SafeSpace</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Main navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors",
                      active ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right-side utility/auth controls */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Theme toggle */}
              <button
                onClick={toggle}
                title={t("theme.toggle")}
                className="flex items-center gap-1 text-xs text-slate-400 px-2.5 py-1.5 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Language switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 text-xs text-slate-400 px-2.5 py-1.5 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === "en" ? "EN" : "ไทย"}
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-1 w-28 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50">
                    <button
                      onClick={() => { setLang("th"); setLangOpen(false); }}
                      className={cn("w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800", lang === "th" ? "text-rose-300" : "text-slate-300")}
                    >
                      ภาษาไทย
                    </button>
                    <button
                      onClick={() => { setLang("en"); setLangOpen(false); }}
                      className={cn("w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800", lang === "en" ? "text-rose-300" : "text-slate-300")}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>

              {/* Auth controls */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-800">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={cn(
                        "flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-colors",
                        location.pathname === "/admin"
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      )}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t("nav.admin")}</span>
                    </Link>
                  )}
                  <span className="hidden sm:block text-xs text-slate-500 max-w-[120px] truncate">
                    {user?.full_name || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-xs text-slate-400 px-3 py-1.5 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-slate-800">
                  <Link
                    to="/login"
                    className="flex items-center gap-1 text-xs text-slate-400 px-3 py-1.5 rounded-full hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1 text-xs text-slate-900 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Bottom nav for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                  active ? "text-slate-100" : "text-slate-500"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
