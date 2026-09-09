import React,{createContext,useState,useContext,useEffect} from "react";
import {base44} from "@/api/base44Client";
const AuthContext=createContext();
export const AuthProvider=({children})=>{
 const [user,setUser]=useState(null),[isAuthenticated,setIsAuthenticated]=useState(false),[isLoadingAuth,setIsLoadingAuth]=useState(true),[authError,setAuthError]=useState(null);
 const checkUserAuth=async()=>{setIsLoadingAuth(true);try{const u=await base44.auth.me();setUser(u);setIsAuthenticated(!!u);setAuthError(null);}catch{setUser(null);setIsAuthenticated(false);}finally{setIsLoadingAuth(false);}};
 useEffect(()=>{checkUserAuth();},[]);
 const logout=()=>{setUser(null);setIsAuthenticated(false);base44.auth.logout(false);};
 const navigateToLogin=()=>base44.auth.redirectToLogin(window.location.pathname);
 return <AuthContext.Provider value={{user,isAuthenticated,isLoadingAuth,isLoadingPublicSettings:false,authError,appPublicSettings:null,authChecked:!isLoadingAuth,logout,navigateToLogin,checkUserAuth,checkAppState:checkUserAuth}}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>{const c=useContext(AuthContext);if(!c)throw Error("useAuth must be used within an AuthProvider");return c;};
