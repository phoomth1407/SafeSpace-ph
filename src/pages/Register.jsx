import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, CalendarDays, ShieldCheck } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useTranslation } from "@/lib/i18n";

const getAge = (year, month, day, today = new Date()) => {
  if (!year || !month || !day) return null;
  const birth = new Date(year, month - 1, day);
  if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day || birth > today) return null;
  let age = today.getFullYear() - year;
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) age--;
  return age;
};

export default function Register() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const en = lang === "en";
  const [today, setToday] = useState(() => new Date());
  const todayYear = today.getFullYear();
  useEffect(() => { const refresh = () => setToday(new Date()); const timer = window.setInterval(refresh, 60_000); return () => window.clearInterval(timer); }, []);
  const [step, setStep] = useState("method");
  const [method, setMethod] = useState(null);
  // Start with a valid historical date so the day selector is immediately
  // useful; starting at today's year limited it to only dates up to today.
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(todayYear - 18));
  const [shareRiskScore, setShareRiskScore] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const calendarDays = useMemo(() => new Date(Number(year), Number(month), 0).getDate(), [year, month]);
  const maxDay = Number(year) === todayYear && Number(month) === today.getMonth() + 1 ? Math.min(calendarDays, today.getDate()) : calendarDays;
  const selectedDay = Math.min(Number(day), maxDay);
  const age = getAge(Number(year), Number(month), selectedDay, today);
  const validAge = Number.isInteger(age) && age >= 13 && age <= 120;
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const years = Array.from({ length: 121 }, (_, i) => todayYear - i);
  const months = Array.from({ length: Number(year) === todayYear ? today.getMonth() + 1 : 12 }, (_, i) => i + 1);
  const birthDateValid = age !== null && age >= 0 && age <= 120;

  const begin = (selectedMethod) => {
    setMethod(selectedMethod);
    setError("");
    setPolicyAccepted(false);
    setPolicyOpen(true);
  };
  const continueAfterPolicy = () => {
    setPolicyOpen(false);
    setPolicyAccepted(true);
    setStep("profile");
  };
  const closePolicy = () => {
    setPolicyOpen(false);
    setMethod(null);
    setStep("method");
    setPolicyAccepted(false);
  };

  const continueProfile = async () => {
    setError("");
    if (!policyAccepted) { setError(en ? "Please accept the SafeSpace Policy first." : "กรุณายอมรับนโยบาย SafeSpace ก่อน"); return; }
    if (!birthDateValid) { setError(en ? "Please select a valid date of birth." : "กรุณาเลือกวันเกิดที่ถูกต้อง"); return; }
    if (!validAge) { setError(en ? "You must be at least 13 years old to create a SafeSpace account." : "คุณต้องมีอายุอย่างน้อย 13 ปีจึงจะสร้างบัญชี SafeSpace ได้"); return; }
    if (shareRiskScore === null) { setError(en ? "Choose Yes or No for sharing assessment risk scores." : "กรุณาเลือก ใช่ หรือ ไม่ สำหรับการแบ่งปันคะแนนความเสี่ยง"); return; }
    if (method === "google") {
      setLoading(true);
      try {
        await appClient.auth.loginWithProvider("google", safeReturnTo(), age, shareRiskScore);
      } catch (err) {
        sessionStorage.removeItem("safespace_pending_share_risk_score");
        setError(err.message || (en ? "Google sign-in failed." : "เข้าสู่ระบบด้วย Google ไม่สำเร็จ"));
      } finally { setLoading(false); }
    } else {
      setStep("credentials");
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!policyAccepted || !validAge || shareRiskScore === null) { setError(en ? "Complete the policy, age, and sharing steps first." : "กรุณาทำขั้นตอนนโยบาย อายุ และการแบ่งปันให้ครบ"); return; }
    if (password !== confirmPassword) { setError(t("auth.passwordMismatch")); return; }
    setLoading(true);
    try {
      const result = await appClient.auth.register({ email, password, age, shareRiskScore });
      if (result?.session) {
        const dest = safeReturnTo();
        if (dest.startsWith("http://") || dest.startsWith("https://")) window.location.href = dest;
        else navigate(dest);
        return;
      }
      setShowOtp(true);
    } catch (err) {
      sessionStorage.removeItem("safespace_pending_share_risk_score");
      setError(err.message || t("auth.registrationFailed"));
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setError(""); setLoading(true);
    try {
      await appClient.auth.verifyOtp({ email, otpCode });
      // Hydrate the authenticated user and apply the pending sharing choice before navigation.
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Email verification succeeded, but no login session was created. Please log in.");
      await appClient.auth.me();
      const dest = safeReturnTo();
      if (dest.startsWith("http://") || dest.startsWith("https://")) window.location.href = dest;
      else navigate(dest);
    } catch (err) { setError(err.message || "Invalid verification code"); }
    finally { setLoading(false); }
  };
  const handleResend = async () => {
    setError("");
    try { await appClient.auth.resendOtp(email); toast({ title: en ? "Code sent" : "ส่งรหัสแล้ว", description: en ? "Check your email for the new code." : "ตรวจสอบอีเมลเพื่อรับรหัสใหม่" }); }
    catch (err) { setError(err.message || "Failed to resend code"); }
  };

  const SelectField = ({ label, value, onChange, children, ariaLabel }) => (
    <div className="min-w-0 flex-1 space-y-2">
      <Label>{label}</Label>
      <select size={5} aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} className="h-32 w-full rounded-xl border border-input bg-background px-2 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring">
        {children}
      </select>
    </div>
  );

  if (showOtp) return (
    <AuthLayout icon={Mail} title={t("auth.verifyEmail")} subtitle={`${t("auth.codeSent")} ${email}`}>
      {error && <div role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <div className="mb-6 flex justify-center"><InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code"><InputOTPGroup>{[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup></InputOTP></div>
      <Button className="h-12 w-full font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>{t("auth.verifying")}</> : "Verify"}</Button>
      <p className="mt-4 text-center text-sm text-muted-foreground">{t("auth.didntReceive")} <button onClick={handleResend} className="font-medium text-primary hover:underline">Resend</button></p>
    </AuthLayout>
  );

  const titles = {
    method: en ? "Create your account" : "สร้างบัญชีของคุณ",
    profile: en ? "A few details first" : "ข้อมูลเบื้องต้น",
    credentials: en ? "Create login details" : "สร้างข้อมูลเข้าสู่ระบบ",
  };
  const subtitles = {
    method: en ? "Choose how you want to join SafeSpace." : "เลือกวิธีที่ต้องการสมัครใช้งาน SafeSpace",
    profile: en ? "Your full birthdate stays in this form and is not sent during registration." : "วันเดือนปีเกิดจะอยู่ในแบบฟอร์มนี้ และจะไม่ถูกส่งไปตอนสมัครบัญชี",
    credentials: en ? "Use an email address and a secure password." : "ใช้อีเมลและรหัสผ่านที่ปลอดภัย",
  };

  return (
    <AuthLayout icon={step === "method" ? UserPlus : step === "profile" ? CalendarDays : Lock} title={titles[step]} subtitle={subtitles[step]} policyOpen={policyOpen} onPolicyAccept={continueAfterPolicy} persistPolicyAcknowledgement onPolicyClose={closePolicy} footer={<>{t("auth.haveAccount")}{" "}<Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")} className="font-medium text-primary hover:underline">Log in</Link></>}>
      {error && <div role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {step === "method" && <div className="space-y-4">
        <Button variant="outline" className="h-12 w-full text-sm font-medium text-foreground" onClick={() => begin("google")}><GoogleIcon className="mr-2 h-5 w-5"/>{t("auth.google")}</Button>
        <div className="relative py-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"/></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">{t("auth.or")}</span></div></div>
        <Button className="h-12 w-full font-medium" onClick={() => begin("email")}><Mail className="mr-2 h-4 w-4"/>{en ? "Create an account with email" : "สร้างบัญชีด้วยอีเมล"}</Button>
      </div>}
      {step === "profile" && <div className="space-y-5">
        <div className="space-y-2">
          <Label>{en ? "Date of birth" : "วันเดือนปีเกิด"}</Label>
          <div className="flex gap-2">
            <SelectField label={en ? "Day" : "วัน"} ariaLabel="Day" value={day} onChange={setDay}>{days.map((d) => <option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}</SelectField>
            <SelectField label={en ? "Month" : "เดือน"} ariaLabel="Month" value={month} onChange={(next) => { setMonth(next); setDay("1"); }}>{months.map((m) => <option key={m} value={m}>{en ? new Date(2000,m-1,1).toLocaleString("en",{month:"short"}) : new Date(2000,m-1,1).toLocaleString("th",{month:"short"})}</option>)}</SelectField>
            <SelectField label={en ? "Year" : "ปี"} ariaLabel="Year" value={year} onChange={(next) => { setYear(next); setMonth(next === String(todayYear) ? String(today.getMonth() + 1) : "1"); setDay("1"); }}>{years.map((y) => <option key={y} value={y}>{y}</option>)}</SelectField>
          </div>
          <p className="text-xs text-muted-foreground">{en ? `Latest selectable date: ${today.toLocaleDateString("en-GB")} · Calculated age: ${birthDateValid ? age : "—"}` : `เลือกวันเกิดได้ถึง: ${today.toLocaleDateString("th-TH")} · อายุที่คำนวณได้: ${birthDateValid ? age : "—"}`}</p>
          <p className="text-xs text-muted-foreground">{en ? "Only your calculated age is used for account features; the full date is not stored." : "ระบบใช้เฉพาะอายุที่คำนวณได้สำหรับฟีเจอร์บัญชี โดยไม่จัดเก็บวันเกิดแบบเต็ม"}</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary"/><Label>{en ? "Share assessment risk scores with admins?" : "อนุญาตให้ผู้ดูแลดูคะแนนความเสี่ยงจากแบบประเมินหรือไม่?"}</Label></div>
          <p className="text-xs leading-relaxed text-muted-foreground">{en ? "This shares risk scores and risk levels only—not your answers or written responses. You can change this later." : "จะแบ่งปันเฉพาะคะแนนและระดับความเสี่ยงเท่านั้น ไม่รวมคำตอบหรือข้อความที่คุณเขียน และคุณเปลี่ยนการตั้งค่านี้ภายหลังได้"}</p>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant={shareRiskScore === true ? "default" : "outline"} className="h-11" aria-pressed={shareRiskScore === true} onClick={() => setShareRiskScore(true)}>{en ? "Yes, share" : "ใช่ แบ่งปัน"}</Button>
            <Button type="button" variant={shareRiskScore === false ? "default" : "outline"} className="h-11" aria-pressed={shareRiskScore === false} onClick={() => setShareRiskScore(false)}>{en ? "No, keep private" : "ไม่ แยกเป็นส่วนตัว"}</Button>
          </div>
        </div>
        <Button className="h-12 w-full" disabled={!birthDateValid || !validAge || shareRiskScore === null || loading} onClick={continueProfile}>{loading ? <Loader2 className="h-4 w-4 animate-spin"/> : (method === "google" ? (en ? "Continue with Google" : "ดำเนินการต่อด้วย Google") : (en ? "Continue" : "ดำเนินการต่อ"))}</Button>
        <Button variant="ghost" className="w-full" onClick={() => setStep("method")}>{en ? "Back" : "ย้อนกลับ"}</Button>
      </div>}
      {step === "credentials" && <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="email">{t("auth.email")}</Label><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/><Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} className="h-12 pl-10" required/></div></div>
        <div className="space-y-2"><Label htmlFor="password">{t("auth.password")}</Label><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/><Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} className="h-12 pl-10" required/></div></div>
        <div className="space-y-2"><Label htmlFor="confirm">{t("auth.confirmPassword")}</Label><div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/><Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="h-12 pl-10" required/></div></div>
        <Button type="submit" className="h-12 w-full font-medium" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>{t("auth.creating")}</> : (en ? "Create account" : "สร้างบัญชี")}</Button>
        <Button type="button" variant="ghost" className="w-full" onClick={()=>setStep("profile")}>{en ? "Back" : "ย้อนกลับ"}</Button>
      </form>}
    </AuthLayout>
  );
}
