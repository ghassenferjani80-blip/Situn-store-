import { ArrowRight, BriefcaseBusiness, MapPin, UserRound } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

const euro = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const userId = Number(params?.id);
  const profile = trpc.marketplace.publicProfile.useQuery({ userId }, { enabled: Number.isInteger(userId) && userId > 0 });
  const services = trpc.marketplace.services.useQuery();
  const listedServices = (services.data ?? []).filter(({ service }) => service.providerUserId === userId);

  if (!userId) return <main className="profile-page"><p>الصفحة الشخصية غير متاحة.</p><Link href="/services">العودة إلى الخدمات</Link></main>;
  return <main className="profile-page" dir="rtl"><header className="profile-header"><Link href="/services" className="services-brand"><span>✦</span> SITUN</Link><Link href="/services" className="profile-back"><ArrowRight size={16} /> العودة إلى الخدمات</Link></header><section className="profile-hero"><div className="profile-avatar"><UserRound size={32} /></div><div><p className="services-kicker">ملف مقدم خدمة مستقل</p><h1>{profile.data?.displayName ?? "عضو SITUN"}</h1>{(profile.data?.location || profile.data?.country) && <p className="profile-location"><MapPin size={15} /> {[profile.data?.location, profile.data?.country].filter(Boolean).join(" · ")}</p>}{profile.data?.languages && <p className="profile-languages">اللغات: {profile.data.languages}</p>}</div></section><section className="profile-body"><div className="profile-about"><p className="services-kicker">نبذة</p><p>{profile.data?.bio ?? "هذا العضو يجهز ملفه الشخصي في SITUN."}</p><div className="profile-note"><BriefcaseBusiness size={19} /><span>التواصل والاتفاق يتمان مباشرة وبوضوح عبر SITUN، سواء كانت الخدمة عن بعد أو محلية.</span></div></div><div className="profile-services"><p className="services-kicker">الخدمات المنشورة</p>{services.isLoading || profile.isLoading ? <p>جاري التحميل...</p> : listedServices.length === 0 ? <p className="profile-muted">لا توجد خدمات منشورة حاليًا.</p> : listedServices.map(({ service }) => <article className="profile-service" key={service.id}><div><span>{service.category}</span><h2>{service.title}</h2><p>{service.description}</p></div><strong>{euro(service.priceCents)}</strong></article>)}</div></section><footer className="services-footer"><span>© SITUN · جميع الدول</span><Link href="/services">اعرض خدمتك</Link></footer></main>;
}
