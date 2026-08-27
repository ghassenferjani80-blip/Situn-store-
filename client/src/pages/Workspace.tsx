import { useEffect, useState } from "react";
import { ArrowRight, CircleUserRound, EyeOff, Globe2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const statusLabels: Record<string, string> = { draft: "مسودة", pending: "قيد المراجعة", active: "منشور", paused: "متوقف", rejected: "مرفوض", archived: "مؤرشف" };
const typeLabels: Record<string, string> = { product: "منتج", service: "خدمة", job: "فرصة عمل", online_work: "عمل عن بُعد", real_estate: "عقار", vehicle: "سيارة", classified: "إعلان" };

type AccountType = "customer" | "seller" | "service_provider" | "employer" | "freelancer";

export default function Workspace() {
  const { user, loading, isAuthenticated } = useAuth();
  const profile = trpc.marketplace.profile.useQuery(undefined, { enabled: isAuthenticated });
  const services = trpc.marketplace.myServices.useQuery(undefined, { enabled: isAuthenticated });
  const posts = trpc.marketplace.myPosts.useQuery(undefined, { enabled: isAuthenticated });
  const inquiries = trpc.marketplace.myInquiries.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const updateStatus = trpc.marketplace.updatePostStatus.useMutation({ onSuccess: () => utils.marketplace.myPosts.invalidate() });
  const deletePost = trpc.marketplace.deletePost.useMutation({ onSuccess: () => utils.marketplace.myPosts.invalidate() });
  const savePreferences = trpc.marketplace.updateUserPreferences.useMutation();
  const [accountType, setAccountType] = useState<AccountType>(user?.accountType ?? "customer");
  const [country, setCountry] = useState(user?.country ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage ?? "ar");
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency ?? "EUR");

  useEffect(() => { if (!loading && !isAuthenticated) startLogin(); }, [loading, isAuthenticated]);
  if (loading || !isAuthenticated) return <main className="workspace-page"><p>جاري فتح مساحتك...</p></main>;
  const remove = (postId: number) => { if (window.confirm("هل تريد حذف هذا المنشور نهائيًا؟")) deletePost.mutate({ postId }); };

  return (
    <main className="workspace-page" dir="rtl">
      <header className="profile-header">
        <Link href="/" className="services-brand"><span>✦</span> SITUN</Link>
        <Link href="/services" className="profile-back"><ArrowRight size={16} /> سوق الخدمات</Link>
      </header>
      <section className="workspace-hero">
        <div className="profile-avatar"><CircleUserRound size={32} /></div>
        <div><p className="services-kicker"><Globe2 size={15} /> مساحتي في SITUN</p><h1>{profile.data?.displayName ?? user?.name ?? "عضو SITUN"}</h1><p>أدر ملفك، خدماتك، ومنشوراتك من مكان واحد.</p></div>
      </section>
      <section className="workspace-grid">
        <div className="workspace-card workspace-card-wide"><div><p className="services-kicker">منشوراتي</p><h2>{posts.data?.length ?? 0} منشور</h2><p>منتجات، خدمات، وظائف، عقارات، سيارات وإعلانات؛ كل منشور يمر بالمراجعة قبل ظهوره للعامة.</p></div><Link href="/publish" className="services-gold-button"><Plus size={16} /> إنشاء منشور</Link></div>
        <div className="workspace-card"><p className="services-kicker">إدارة المنشورات</p>{posts.data?.length ? <div className="workspace-post-list">{posts.data.map((post) => <article className="workspace-post" key={post.id}><div><span className="workspace-post-type">{typeLabels[post.postType] ?? post.postType}</span><h3><Link href={`/publish/${post.id}`}>{post.title}</Link></h3><small>{post.country || "دولي"}{post.city ? ` · ${post.city}` : ""} · {post.currency}</small></div><div className="workspace-post-actions"><b className={`status-pill ${post.status}`}>{statusLabels[post.status] ?? post.status}</b>{post.status === "active" ? <button title="إيقاف المنشور" onClick={() => updateStatus.mutate({ postId: post.id, status: "paused" })}><EyeOff size={15} /></button> : post.status === "paused" || post.status === "draft" ? <button title="أرشفة المنشور" onClick={() => updateStatus.mutate({ postId: post.id, status: "archived" })}><EyeOff size={15} /></button> : null}<button className="danger-action" title="حذف المنشور" onClick={() => remove(post.id)}><Trash2 size={15} /></button></div></article>)}</div> : <p>لم تنشر أي محتوى بعد. ابدأ بمنتج أو خدمة أو فرصة عمل.</p>}<Link href="/publish" className="services-outline-button"><Plus size={16} /> إضافة منشور</Link></div>
        <div className="workspace-card"><p className="services-kicker">خدماتي القديمة</p><h2>{services.data?.length ?? 0} خدمة</h2>{services.data?.length ? <div className="workspace-list">{services.data.map((service) => <div key={service.id}><span>{service.title}</span><b className={`status-pill ${service.status}`}>{service.status}</b></div>)}</div> : <p>يمكنك الاحتفاظ بخدماتك الحالية أو إضافة خدمة جديدة من سوق الخدمات.</p>}<Link href="/services" className="services-outline-button"><Plus size={16} /> إدارة الخدمات</Link></div>
        <div className="workspace-card workspace-card-wide"><div><p className="services-kicker">طلبات العملاء</p><h2>{inquiries.data?.length ?? 0} طلب</h2>{inquiries.data?.length ? <div className="workspace-list">{inquiries.data.slice(0, 5).map(({ inquiry, post }) => <div key={inquiry.id}><span>{inquiry.requesterName} · {post?.title ?? "منشور"}</span><b className={`status-pill ${inquiry.status}`}>{inquiry.status}</b></div>)}</div> : <p>ستظهر هنا رسائل وطلبات المهتمين بمنشوراتك.</p>}</div></div>
        <div className="workspace-card workspace-card-wide workspace-preferences"><div><p className="services-kicker">إعدادات حسابي</p><h2>عرّف طريقة استعمالك للمنصة</h2><p>هذه المعلومات تساعد SITUN على تنظيم العروض حول العالم.</p></div><form className="workspace-preferences-form" onSubmit={(event) => { event.preventDefault(); savePreferences.mutate({ accountType, country: country || undefined, city: city || undefined, preferredLanguage, preferredCurrency }); }}><select value={accountType} onChange={(event) => setAccountType(event.target.value as AccountType)}><option value="customer">Customer · مشتري</option><option value="seller">Seller · بائع</option><option value="service_provider">Service Provider · مقدم خدمة</option><option value="employer">Employer · صاحب عمل</option><option value="freelancer">Freelancer · مستقل</option></select><input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="الدولة" /><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="المدينة" /><select value={preferredLanguage} onChange={(event) => setPreferredLanguage(event.target.value)}><option value="ar">العربية</option><option value="fr">Français</option><option value="en">English</option></select><select value={preferredCurrency} onChange={(event) => setPreferredCurrency(event.target.value)}><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option><option value="EGP">EGP</option><option value="TND">TND</option></select><button className="services-gold-button" type="submit" disabled={savePreferences.isPending}>{savePreferences.isPending ? "جارٍ الحفظ..." : "حفظ إعداداتي"}</button></form></div>
        <div className="workspace-card workspace-card-wide"><ShieldCheck size={22} /><div><h2>تحكم واضح ومحترم</h2><p>أنت تدير محتواك، بينما تراجع إدارة SITUN المنشورات قبل النشر. لا توجد مدفوعات آلية، وتتبع العمولة يتم يدويًا.</p></div></div>
      </section>
      <footer className="services-footer"><span>© SITUN · جميع الدول</span><Link href="/profile/1">صفحة عامة نموذجية</Link></footer>
    </main>
  );
}
