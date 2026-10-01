import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { appClient } from "@/api/appClient";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useTranslation } from "@/lib/i18n";
import { hasAcceptedSafeSpacePolicy } from "@/components/SafeSpacePolicyModal";

const SHARE_PENDING_KEY = "safespace_pending_share_risk_score";
const pad = (n) => String(n).padStart(2, "0");
const getAge = (year, month, day, today) => {
  if (!year || !month || !day) return null;
  const birth = new Date(year, month - 1, day);
  if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day || birth > today) return null;
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--;
  return age;
};

export default function Register() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const en = lang === "en";
  const [method, setMethod] = useState(null);
  const [stage, setStage] = useState("choose");
  const [email, setEmail] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [today, setToday] = useState(() => new Date());
  const [shareRisk, setShareRisk] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyAcceptedThisVisit, setPolicyAcceptedThisVisit] = useState(() => hasAcceptedSafeSpacePolicy());

  useEffect(() => {
    const refreshToday = () => setToday(new Date());
    const timer = window.setInterval(refreshToday, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const monthDays = useMemo(() => {
    if (!month || !year) return 31;
    return new Date(Number(year), Number(month), 0).getDate();
  }, [month, year]);
  const maxDay = Number(year) === today.getFullYear() && Number(month) === today.getMonth() + 1
    ? Math.min(monthDays, today.getDate()) : monthDays;
  const age = getAge(Number(year), Number(month), Number(day), today);
  const validAge = Number.isInteger(age) && age >= 13 && age <= 120;
  const years = useMemo(() => Array.from({ length: 121 }, (_, i) => today.getFullYear() - i), [today.getFullYear()]);
  const months = en
    ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    : ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  const selectMethod = (nextMethod) => {
    setMethod(nextMethod);
    setError("");
    setPolicyOpen(true);
  };
  const continueAfterPolicy = () => {
    setPolicyOpen(false);
    setPolicyAcceptedThisVisit(true);
    setStage("details");
  };
  const closePolicy = () => {
    setPolicyOpen(false);
    setMethod(null);
    setStage("choose");
    setPolicyAcceptedThisVisit(false);
  };
  const validateDetails = () => {
    if (!validAge) {
      setError(age !== null && age < 13
        ? (en ? "You must be at least 13 years old to create a SafeSpace account." : "ผู้สมัครต้องมีอายุอย่างน้อย 13 ปีจึงจะสร้างบัญชี SafeSpace ได้")
        : (en ? "Please select a valid date of birth and check that you are at least 13." : "กรุณาเลือกวันเกิดที่ถูกต้องและยืนยันว่าคุณมีอายุอย่างน้อย 13 ปี"));
      return false;
    }
    if (shareRisk !== "yes" && shareRisk !== "no") {
      setError(en ? "Please choose Yes or No for sharing assessment risk scores." : "กรุณาเลือก ใช่ หรือ ไม่ใช่ สำหรับการแบ่งปันคะแนนความเสี่ยง");
      return false;
    }
    return true;
  };
  const rememberSharingChoice = () => {
    try { sessionStorage.setItem(SHARE_PENDING_KEY, shareRisk === "yes" ? "true" : "false"); } catch {}
  };
  const goToDestination = () => {
    const dest = safeReturnTo();
    if (dest.startsWith("http://") || dest.startsWith("https://")) window.location.href = dest;
    else navigate(dest);
  };

  const handleEmailSubmit = async (event) => {
    event?.preventDefault();
    setError("");
    if (!validateDetails()) return;
    if (password !== confirmPassword) { setError(t("auth.passwordMismatch")); return; }
    setLoading(true);
    rememberSharingChoice();
    try {
      const result = await appClient.auth.register({ email, password, age });
      if (result?.session) {
        goToDestination();
        return;
      }
      setShowOtp(true);
    } catch (err) {
      setError(err.message || t("auth.registrationFailed"));
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      await appClient.auth.verifyOtp({ email, otpCode });
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Email verification succeeded, but no login session was created. Please log in.");
      await appClient.auth.me();
      goToDestination();
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally { setLoading(false); }
  };
  const handleResend = async () => {
    setError("");
    try {
      await appClient.auth.resendOtp(email);
      toast({ title: en ? "Code sent" : "ส่งรหัสแล้ว", description: en ? "Check your email for the new code." : "ตรวจสอบอีเมลของคุณเพื่อรับรหัสใหม่" });
    } catch (err) { setError(err.message || "Failed to resend code"); }
  };
  const handleGoogle = async () => {
    setError("");
    if (!validateDetails()) return;
    setLoading(true);
    rememberSharingChoice();
    try {
      await appClient.auth.loginWithProvider("google", safeReturnTo(), age);
    } catch (err) {
      setError(err.message || "Google sign-in failed");
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <AuthLayout icon={Mail} title={t("auth.verifyEmail")} subtitle={`${t("auth.codeSent")} ${email}`}>
        {error && <div role="alert" className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>{[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>{t("auth.verifying")}</> : (en ? "Verify" : "ยืนยัน")}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">{t("auth.didntReceive")}{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">{en ? "Resend" : "ส่งอีกครั้ง"}</button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title={t("auth.createYourAccount")}
      subtitle={t("auth.registerSubtitle")}
      policyOpen={policyOpen}
      onPolicyAccept={continueAfterPolicy}
      persistPolicyAcknowledgement
      onPolicyClose={closePolicy}
      footer={<>{t("auth.haveAccount")}{" "}<Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")} className="text-primary font-medium hover:underline">Log in</Link></>}
    >
      {stage === "choose" && <>
        <p className="text-sm text-muted-foreground text-center mb-4">{en ? "Choose how you would like to join SafeSpace." : "เลือกวิธีที่คุณต้องการใช้สมัคร SafeSpace"}</p>
        <Button variant="outline" className="w-full h-12 mb-3 text-foreground" onClick={() => selectMethod("google")}>
          <GoogleIcon className="w-5 h-5 mr-2"/>{t("auth.google")}
        </Button>
        <Button className="w-full h-12" onClick={() => selectMethod("email")}>
          <Mail className="w-4 h-4 mr-2"/>{en ? "Create an account with email" : "สร้างบัญชีด้วยอีเมล"}
        </Button>
      </>}

      {stage === "details" && <>
        <button type="button" onClick={() => { setStage("choose"); setMethod(null); setError(""); }} className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4"/>{en ? "Back" : "กลับ"}
        </button>
        <div className="mb-5 rounded-xl border border-border bg-muted/40 p-3 text-sm">
          <p className="font-medium text-foreground">{en ? "Step 2: Date of birth" : "ขั้นตอนที่ 2: วันเดือนปีเกิด"}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{en ? "Choose your date of birth. SafeSpace calculates your age and does not send or store the full date of birth during signup." : "เลือกวันเดือนปีเกิดเพื่อคำนวณอายุ โดย SafeSpace จะไม่ส่งหรือจัดเก็บวันเกิดแบบเต็มระหว่างสมัคร"}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2"><Label htmlFor="birth-day">{en ? "Day" : "วัน"}</Label>
            <select id="birth-day" size={5} value={day} onChange={(e) => setDay(e.target.value)} className="w-full h-32 rounded-xl border border-input bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" aria-label={en ? "Day of birth" : "วันเกิด"}>
              <option value="">{en ? "Day" : "วัน"}</option>{Array.from({length:maxDay},(_,i)=>i+1).map(v=><option key={v} value={String(v)}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label htmlFor="birth-month">{en ? "Month" : "เดือน"}</Label>
            <select id="birth-month" size={5} value={month} onChange={(e) => { setMonth(e.target.value); setDay(""); }} className="w-full h-32 rounded-xl border border-input bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" aria-label={en ? "Month of birth" : "เดือนเกิด"}>
              <option value="">{en ? "Month" : "เดือน"}</option>{months.map((name,i)=><option key={name} value={String(i+1)}>{name}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label htmlFor="birth-year">{en ? "Year" : "ปี"}</Label>
            <select id="birth-year" size={5} value={year} onChange={(e) => { setYear(e.target.value); setDay(""); }} className="w-full h-32 rounded-xl border border-input bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" aria-label={en ? "Year of birth" : "ปีเกิด"}>
              <option value="">{en ? "Year" : "ปี"}</option>{years.map(v=><option key={v} value={String(v)}>{v}</option>)}
            </select>
          </div>
        </div>
        {age !== null && <p className={`mt-2 text-xs ${validAge ? "text-muted-foreground" : "text-destructive"}`}>{en ? `Calculated age: ${age}` : `อายุที่คำนวณได้: ${age} ปี`}</p>}
        <div className="mt-6 space-y-3">
          <div><p className="font-medium text-sm text-foreground">{en ? "Step 3: Share assessment risk scores?" : "ขั้นตอนที่ 3: แบ่งปันคะแนนความเสี่ยงจากแบบประเมินหรือไม่?"}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{en ? "Choose whether admins may view your risk score and risk level. Your answers and written responses are not shared. You can change this later." : "เลือกว่าจะอนุญาตให้ผู้ดูแลดูคะแนนและระดับความเสี่ยงหรือไม่ คำตอบและข้อความที่เขียนจะไม่ถูกแบ่งปัน และคุณเปลี่ยนการตั้งค่านี้ภายหลังได้"}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" aria-pressed={shareRisk === "yes"} onClick={() => setShareRisk("yes")} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${shareRisk === "yes" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted"}`}>{en ? "Yes, share scores" : "ใช่ แบ่งปันคะแนน"}</button>
            <button type="button" aria-pressed={shareRisk === "no"} onClick={() => setShareRisk("no")} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${shareRisk === "no" ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted"}`}>{en ? "No, keep private" : "ไม่แบ่งปัน เก็บเป็นส่วนตัว"}</button>
          </div>
        </div>
        {error && <div role="alert" className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        {method === "google" ? <Button className="w-full h-12 mt-6" onClick={handleGoogle} disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>{en ? "Connecting…" : "กำลังเชื่อมต่อ…"}</> : <><GoogleIcon className="w-5 h-5 mr-2"/>{en ? "Continue with Google" : "ดำเนินการต่อด้วย Google"}</>}
        </Button> : <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
          <div className="space-y-2"><Label htmlFor="email">{t("auth.email")}</Label><div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true"/>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} className="pl-10 h-12" required/>
          </div></div>
          <div className="space-y-2"><Label htmlFor="password">{t("auth.password")}</Label><div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true"/>
            <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} className="pl-10 h-12" required/>
          </div></div>
          <div className="space-y-2"><Label htmlFor="confirm">{t("auth.confirmPassword")}</Label><div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true"/>
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="pl-10 h-12" required/>
          </div></div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>{t("auth.creating")}</> : (en ? "Create account" : "สร้างบัญชี")}
          </Button>
        </form>}
      </>}
    </AuthLayout>
  );
}
