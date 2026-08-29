import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Auth() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/workspace";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils();
  const login = trpc.auth.login.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); navigate(next); } });
  const register = trpc.auth.register.useMutation({ onSuccess: async () => { await utils.auth.me.invalidate(); navigate(next); } });
  const mutation = mode === "login" ? login : register;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === "login") login.mutate({ email, password });
    else register.mutate({ name, email, password });
  };

  return (
    <main className="auth-page" dir="rtl">
      <header className="auth-header"><Link href="/" className="services-brand"><img className="brand-logo" src="/manus-storage/situn-user-logo_90e86129.jpg" alt="SITUN" /></Link><Link href="/" className="profile-back"><ArrowRight size={16} /> العودة للموقع</Link></header>
      <section className="auth-shell">
        <div className="auth-intro"><p className="services-kicker"><LockKeyhole size={15} /> حساب SITUN مستقل</p><h1>{mode === "login" ? "مرحبًا بعودتك." : "ابدأ حضورك."}</h1><p>أنشئ حسابك باسم SITUN لإدارة منشوراتك وخدماتك وفرصك، من دون مغادرة منصة SITUN إلى موقع آخر.</p></div>
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-tabs"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>تسجيل الدخول</button><button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>إنشاء حساب</button></div>
          {mode === "register" && <label><span>الاسم</span><div className="auth-input"><UserRound size={16} /><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} /></div></label>}
          <label><span>البريد الإلكتروني</span><div className="auth-input"><Mail size={16} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div></label>
          <label><span>كلمة المرور</span><div className="auth-input"><LockKeyhole size={16} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : 1} /></div></label>
          {mutation.error && <p className="auth-error">{mutation.error.message}</p>}
          <button className="services-gold-button auth-submit" type="submit" disabled={mutation.isPending}>{mutation.isPending ? "جارٍ التحقق..." : mode === "login" ? "الدخول إلى SITUN" : "إنشاء حساب SITUN"}</button>
          <p className="auth-note">لن تُطلب منك بيانات بطاقة. استعادة كلمة المرور عبر البريد الإلكتروني تحتاج تفعيل خدمة بريد خارجية لاحقًا.</p>
        </form>
      </section>
    </main>
  );
}
