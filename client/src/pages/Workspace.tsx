import { useEffect, useState } from "react";
import { ArrowRight, CircleUserRound, Plus, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function Workspace() {
  const { user, loading, isAuthenticated } = useAuth();
  const profile = trpc.marketplace.profile.useQuery(undefined, { enabled: isAuthenticated });
  const services = trpc.marketplace.myServices.useQuery(undefined, { enabled: isAuthenticated });
  const [lang] = useState("ar");
  useEffect(() => { if (!loading && !isAuthenticated) startLogin(); }, [loading, isAuthenticated]);
  if (loading || !isAuthenticated) return <main className="workspace-page"><p>جاري فتح مساحتك...</p></main>;
  return <main className="workspace-page" dir="rtl"><header className="profile-header"><Link href="/" className="services-brand"><span>✦</span> SITUN</Link><Link href="/services" className="profile-back"><ArrowRight size={16} /> سوق الخدمات</Link></header><section className="workspace-hero"><div className="profile-avatar"><CircleUserRound size={32} /></div><div><p className="services-kicker">مساحتي في SITUN</p><h1>{profile.data?.displayName ?? user?.name ?? "عضو SITUN"}</h1><p>أدر ملفك، خدماتك، وعروضك من مكان واحد.</p></div></section><section className="workspace-grid"><div className="workspace-card"><p className="services-kicker">ملفي الشخصي</p><h2>{profile.data ? "ملفك جاهز للمراجعة" : "ابدأ بملفك"}</h2><p>{profile.data?.bio ?? "أضف نبذة قصيرة عن مهارتك أو حرفتك أو خدمتك."}</p><Link href="/services" className="services-gold-button">{profile.data ? "تعديل الملف" : "إنشاء الملف"} <ArrowRight size={16} /></Link></div><div className="workspace-card"><p className="services-kicker">خدماتي</p><h2>{services.data?.length ?? 0} خدمة</h2>{services.data?.length ? <div className="workspace-list">{services.data.map((service) => <div key={service.id}><span>{service.title}</span><b className={`status-pill ${service.status}`}>{service.status}</b></div>)}</div> : <p>لم ترسل خدمة بعد. اعرض مهارتك على الناس حول العالم.</p>}<Link href="/services" className="services-outline-button"><Plus size={16} /> إضافة خدمة</Link></div><div className="workspace-card workspace-card-wide"><ShieldCheck size={22} /><div><h2>تحكم واضح ومحترم</h2><p>كل خدمة تُرسل للمراجعة قبل النشر. لا توجد مدفوعات آلية، وتتبع العمولة يتم يدويًا بإدارة SITUN.</p></div></div></section><footer className="services-footer"><span>© SITUN · {lang === "ar" ? "جميع الدول" : "Worldwide"}</span><Link href="/profile/1">صفحة عامة نموذجية</Link></footer></main>;
}
