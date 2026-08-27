import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Globe2, Send } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const postTypes = [
  ["product", "منتج للبيع"], ["service", "خدمة"], ["job", "فرصة عمل"], ["online_work", "عمل عبر الإنترنت / Freelance"], ["real_estate", "عقار"], ["vehicle", "سيارة"], ["classified", "إعلان عام"],
] as const;

export default function PostWizard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/publish/:id");
  const editingId = Number(params?.id);
  const myPosts = trpc.marketplace.myPosts.useQuery(undefined, { enabled: isAuthenticated && Number.isInteger(editingId) && editingId > 0 });
  const createPost = trpc.marketplace.createPost.useMutation({ onSuccess: () => navigate("/workspace") });
  const updatePost = trpc.marketplace.updatePost.useMutation({ onSuccess: () => navigate("/workspace") });
  const [postType, setPostType] = useState("product");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState(user?.country ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [language, setLanguage] = useState(user?.preferredLanguage ?? "ar");
  const [currency, setCurrency] = useState(user?.preferredCurrency ?? "EUR");
  const [price, setPrice] = useState("");
  const [remote, setRemote] = useState("no");
  useEffect(() => { if (!loading && !isAuthenticated) window.location.href = `/auth?next=${editingId > 0 ? `/publish/${editingId}` : "/publish"}`; }, [loading, isAuthenticated, editingId]);
  useEffect(() => { const existing = myPosts.data?.find((post) => post.id === editingId); if (!existing) return; setPostType(existing.postType); setTitle(existing.title); setCategory(existing.category); setDescription(existing.description); setCountry(existing.country ?? ""); setCity(existing.city ?? ""); setLanguage(existing.language); setCurrency(existing.currency); setPrice(existing.priceCents == null ? "" : String(existing.priceCents / 100)); setRemote(existing.remote); }, [editingId, myPosts.data]);
  if (loading || !isAuthenticated) return <main className="workspace-page"><p>جاري فتح صفحة النشر...</p></main>;
  const submit = (event: FormEvent) => { event.preventDefault(); const input = { postType: postType as typeof postTypes[number][0], title, category, description, country: country || undefined, city: city || undefined, language, currency, priceCents: price ? Math.round(Number(price) * 100) : undefined, remote: remote as "yes" | "no" | "hybrid" }; if (editingId > 0) updatePost.mutate({ postId: editingId, ...input }); else createPost.mutate(input); };
  return <main className="workspace-page" dir="rtl"><header className="profile-header"><Link href="/workspace" className="profile-back"><ArrowRight size={16} /> العودة إلى مساحتي</Link><Link href="/" className="services-brand"><span>✦</span> SITUN</Link></header><section className="post-wizard"><div className="post-wizard-heading"><p className="services-kicker"><Globe2 size={15} /> منصة عالمية للنشر</p><h1>{editingId > 0 ? "عدّل منشورك." : "أنشئ منشورك."}</h1><p>اختر نوع المحتوى وأضف المعلومات الأساسية. سيُرسل المنشور للمراجعة قبل ظهوره للعامة.</p></div><form className="post-form" onSubmit={submit}><label>نوع المنشور<select value={postType} onChange={(event) => setPostType(event.target.value)}>{postTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>العنوان<input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} maxLength={180} placeholder="مثال: محاسب مستقل أو سيارة عائلية" /></label><label>التصنيف<input value={category} onChange={(event) => setCategory(event.target.value)} required minLength={2} maxLength={100} placeholder="مثال: محاسبة، سيارات، عقارات" /></label><label>الوصف<textarea value={description} onChange={(event) => setDescription(event.target.value)} required minLength={20} maxLength={20000} rows={6} placeholder="اكتب وصفًا دقيقًا وصادقًا لما تقدمه أو تعرضه." /></label><div className="post-form-grid"><label>الدولة<input value={country} onChange={(event) => setCountry(event.target.value)} maxLength={120} placeholder="France" /></label><label>المدينة<input value={city} onChange={(event) => setCity(event.target.value)} maxLength={120} placeholder="Paris" /></label><label>لغة المنشور<select value={language} onChange={(event) => setLanguage(event.target.value)}><option value="ar">العربية</option><option value="fr">Français</option><option value="en">English</option></select></label><label>العملة<select value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option><option value="EGP">EGP</option><option value="TND">TND</option></select></label></div><div className="post-form-grid"><label>السعر أو الأجر<input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="اختياري" /></label><label>نمط العمل<select value={remote} onChange={(event) => setRemote(event.target.value)}><option value="no">محلي / حضوري</option><option value="yes">عن بُعد</option><option value="hybrid">مختلط</option></select></label></div>{createPost.error && <p className="post-form-error">تعذر إرسال المنشور. تحقق من البيانات وحاول مرة أخرى.</p>}<button className="services-gold-button" type="submit" disabled={createPost.isPending || updatePost.isPending}><Send size={16} /> {createPost.isPending || updatePost.isPending ? "جارٍ الحفظ..." : editingId > 0 ? "حفظ التعديلات وإعادة المراجعة" : "إرسال للمراجعة"}</button><p className="post-form-note">النشر لا يصبح عامًا إلا بعد موافقة إدارة SITUN. لا تستخدم صورًا أو أوصافًا دون إذن.</p></form></section></main>;
}
