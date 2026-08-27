import { ArrowRight, MessageCircle, Search, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { SITUN_WHATSAPP } from "@shared/marketplace";

const euro = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

export default function Marketplace() {
  const products = trpc.marketplace.products.useQuery();
  const items = products.data ?? [];
  return <main className="section-page marketplace-page" dir="rtl">
    <header className="section-header"><Link href="/" className="section-brand">✦ SITUN</Link><nav><Link href="/services">الخدمات والعمل</Link><Link href="/promotion">الترويج</Link><Link href="/marketplace" className="active">التسوق والشراء</Link></nav><Link href="/workspace" className="section-profile">ملفي الشخصي</Link></header>
    <section className="section-hero"><p className="section-kicker"><ShoppingBag size={15} /> قسم التسوق والبيع والشراء</p><h1>اكتشف.<br /><em>قارن. اشترِ.</em></h1><p>إعلانات ومنتجات وخدمات بيع حقيقية من أفراد حول العالم. اختر العرض، ثم تواصل مع SITUN لطلب المعلومات والوساطة الواضحة.</p><div className="section-actions"><a className="section-gold-button" href="#offers">ابدأ التسوق <ArrowRight size={16} /></a><Link className="section-outline-button" href="/promotion">أريد الترويج لعرضي</Link></div></section>
    <section className="section-content" id="offers"><div className="section-heading"><div><p className="section-kicker">عروض مختارة</p><h2>سوق مستقل<br /><em>دون تعقيد.</em></h2></div><label className="section-search"><Search size={17} /><input placeholder="ابحث عن منتج أو مدينة أو دولة..." /></label></div>{products.isLoading ? <p className="section-empty">جاري تحميل العروض...</p> : items.length === 0 ? <div className="section-empty"><p>لا توجد إعلانات منشورة بعد.</p><Link href="/promotion">أضف عرضك الأول</Link></div> : <div className="market-grid">{items.map((item) => <article className="market-card" key={item.id}>{item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <div className="market-image-placeholder">SITUN</div>}<p className="section-kicker">{item.category} · {item.location ?? "دولي"}</p><h3>{item.name}</h3><p>{item.description ?? "عرض منشور عبر SITUN. اطلب التفاصيل والمعلومات قبل الشراء."}</p><div className="market-card-footer"><strong>{euro(item.priceCents)}</strong><a href={`https://wa.me/${SITUN_WHATSAPP}?text=${encodeURIComponent(`مرحبًا SITUN، أريد معلومات عن العرض: ${item.name}`)}`} target="_blank" rel="noreferrer">طلب معلومات <MessageCircle size={15} /></a></div></article>)}</div>}</section>
    <section className="section-note-band"><strong>البيع والشراء بوضوح.</strong><span>SITUN ينسق التعارف الأول، والاتفاق النهائي يكون بين الأطراف.</span></section>
    <footer className="section-footer"><span>© SITUN · جميع الدول</span><Link href="/services">الخدمات والعمل</Link><Link href="/">الصفحة الرئيسية</Link></footer>
  </main>;
}
