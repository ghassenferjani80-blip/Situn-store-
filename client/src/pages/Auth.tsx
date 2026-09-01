import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { trpc } from "@/lib/trpc";

const authCopy = {
  fr: { back: "Retour au site", kicker: "Compte SITUN indépendant", welcome: "Bon retour.", start: "Commencez votre présence.", intro: "Créez votre compte SITUN pour gérer vos annonces, services et opportunités sans quitter la plateforme.", login: "Se connecter", register: "Créer un compte", name: "Nom", email: "Adresse e-mail", password: "Mot de passe", submitLogin: "Entrer dans SITUN", submitRegister: "Créer mon compte SITUN", pending: "Vérification…", note: "Aucune carte bancaire ne vous sera demandée. La récupération par e-mail nécessite l’activation future d’un service externe." },
  en: { back: "Back to site", kicker: "Independent SITUN account", welcome: "Welcome back.", start: "Start your presence.", intro: "Create your SITUN account to manage listings, services and opportunities without leaving the platform.", login: "Log in", register: "Create account", name: "Name", email: "Email address", password: "Password", submitLogin: "Enter SITUN", submitRegister: "Create my SITUN account", pending: "Checking…", note: "No card details are requested. Email password recovery requires a future external mail service." },
  ar: { back: "العودة للموقع", kicker: "حساب SITUN مستقل", welcome: "مرحبًا بعودتك.", start: "ابدأ حضورك.", intro: "أنشئ حسابك في SITUN لإدارة منشوراتك وخدماتك وفرصك من دون مغادرة المنصة.", login: "تسجيل الدخول", register: "إنشاء حساب", name: "الاسم", email: "البريد الإلكتروني", password: "كلمة المرور", submitLogin: "الدخول إلى SITUN", submitRegister: "إنشاء حساب SITUN", pending: "جارٍ التحقق…", note: "لن تُطلب منك بيانات بطاقة. استعادة كلمة المرور عبر البريد الإلكتروني تحتاج تفعيل خدمة خارجية لاحقًا." },
} as const;

export default function Auth() {
  const [, navigate] = useLocation();
  const language = window.localStorage.getItem("situn-language") === "en" ? "en" : window.localStorage.getItem("situn-language") === "ar" ? "ar" : "fr";
  const tx = authCopy[language];
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
    <main className="auth-page" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="auth-header"><Link href="/" className="services-brand"><img className="brand-logo" src="/manus-storage/situn-user-logo_90e86129.jpg" alt="SITUN" /></Link><Link href="/" className="profile-back"><ArrowRight size={16} /> {tx.back}</Link></header>
      <section className="auth-shell">
        <div className="auth-intro"><p className="services-kicker"><LockKeyhole size={15} /> {tx.kicker}</p><h1>{mode === "login" ? tx.welcome : tx.start}</h1><p>{tx.intro}</p></div>
        <form className="auth-card" onSubmit={submit}>
          <div className="auth-tabs"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>{tx.login}</button><button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>{tx.register}</button></div>
          {mode === "register" && <label><span>{tx.name}</span><div className="auth-input"><UserRound size={16} /><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} /></div></label>}
          <label><span>{tx.email}</span><div className="auth-input"><Mail size={16} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div></label>
          <label><span>{tx.password}</span><div className="auth-input"><LockKeyhole size={16} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : 1} /></div></label>
          {mutation.error && <p className="auth-error">{mutation.error.message}</p>}
          <button className="services-gold-button auth-submit" type="submit" disabled={mutation.isPending}>{mutation.isPending ? tx.pending : mode === "login" ? tx.submitLogin : tx.submitRegister}</button>
          <p className="auth-note">{tx.note}</p>
        </form>
      </section>
    </main>
  );
}
