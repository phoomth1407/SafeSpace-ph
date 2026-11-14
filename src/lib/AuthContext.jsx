import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { appClient } from "@/api/appClient";
import { supabase } from "@/lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkUserAuth = useCallback(async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        // A refresh token can be revoked or rotated by another tab/device.
        // Clear only this browser's stale session so Auth can recover cleanly.
        const message = `${sessionError.message || ""} ${sessionError.code || ""}`.toLowerCase();
        if (message.includes("refresh token") || message.includes("invalid_grant")) {
          await supabase.auth.signOut({ scope: "local" });
          setUser(null);
          setIsAuthenticated(false);
          setAuthError(null);
          return;
        }
        throw sessionError;
      }

      if (!sessionData.session) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        return;
      }

      const u = await appClient.auth.me();
      setUser(u);
      setIsAuthenticated(!!u);
      setAuthError(null);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(error?.message || null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // Update the basic auth state immediately from Supabase, then hydrate
      // the application profile without creating an auth/session race.
      if (!session?.user) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setAuthError(null);
        return;
      }

      // Keep protected routes behind the auth-loading gate until the
      // SafeSpace user profile has finished hydrating after sign-in.
      setIsLoadingAuth(true);
      // Defer Supabase calls until after the synchronous auth callback returns.
      window.setTimeout(() => { void checkUserAuth(); }, 0);

      if (event === "SIGNED_IN") {
        const pending = sessionStorage.getItem("safespace_auth_return_to");
        if (pending) {
          sessionStorage.removeItem("safespace_auth_return_to");
          window.setTimeout(() => {
            window.location.hash = pending || "/";
          }, 100);
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [checkUserAuth]);

  const logout = async () => {
    await appClient.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => appClient.auth.redirectToLogin(window.location.hash.replace(/^#/, "") || "/");

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        appPublicSettings: null,
        authChecked: !isLoadingAuth,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState: checkUserAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within an AuthProvider");
  return context;
};

