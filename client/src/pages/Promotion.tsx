import { ArrowRight, Megaphone, UserCircle } from "lucide-react";
import { useEffect } from "react";
import { applySeo, SECTION_SEO } from "@/lib/seo";
import { Link } from "wouter";
import { SITUN_WHATSAPP } from "@shared/marketplace";

const whatsapp = (text: string) => `https://wa.me/${SITUN_WHATSAPP}?text=${encodeURIComponent(text)}`;

export default function Promotion() {
  useEffect(() => { const saved = window.localStorage.getItem("situn-language"); const language = saved === "ar" || saved === "fr" || saved === "en" ? saved : "en"; applySeo({ ...SECTION_SEO.promotion[language], language, path: "/promotion" }); }, []);
  return <main className="section-page promotion-page" dir="rtl">
    <header className="section-header"><Link href="/" className="section-brand">✦ SITUN</Link><nav><Link href="/services">الخدمات والعمل</Link><Link href="/promotion" className="active">الترويج</Link><Link href="/marketplace">التسوق والشراء</Link></nav><Link href="/workspace" className="section-profile"><UserCircle size={17} /> ملفي الشخصي</Link></header>
    <section className="section-hero promotion-hero"><p className="section-kicker"><Megaphone size={15} /> قسم الترويج والظهور</p><h1>أظهر ما تقدّم.<br /><em>واجذب فرصتك.</em></h1><p>سواء كنت مقدم خدمة أو صاحب منتج أو مشروعًا مستقلًا، يساعدك SITUN على تقديم عرضك بوضوح والوصول إلى أشخاص يبحثون عن العمل والشراء حول العالم.</p><div className="section-actions"><a className="section-gold-button" href={whatsapp("مرحبًا SITUN، أريد الترويج لخدمة أو منتج. أرجو شرح الخطوات والرسوم.")} target="_blank" rel="noreferrer">اطلب الترويج <ArrowRight size={16} /></a><Link className="section-outline-button" href="/services">أعرض مهارتي</Link></div></section>
    <section className="promo-grid"><article><span>01</span><h2>روّج لخدمة</h2><p>اعرض البرمجة، المحاسبة، التعليم، التصميم، التسويق، كتابة المحتوى أو أي حرفة يحتاجها الناس.</p><Link href="/services">أضف خدمتك <ArrowRight size={15} /></Link></article><article><span>02</span><h2>روّج لمنتج</h2><p>أرسل معلومات عرضك وصورته وسعره. بعد المراجعة، يظهر في قسم التسوق والبيع والشراء.</p><Link href="/marketplace">شاهد السوق <ArrowRight size={15} /></Link></article><article><span>03</span><h2>روّج لملفك</h2><p>أنشئ صفحة شخصية قابلة للمشاركة تجمع نبذتك ولغاتك وخدماتك المنشورة.</p><Link href="/workspace">أنشئ ملفك <ArrowRight size={15} /></Link></article></section>
    <section className="section-note-band"><strong>وصول أوضح. تواصل إنساني.</strong><span>النشر يحتاج موافقة المالك، ولا توجد باقات أو أسعار إشهار ثابتة معروضة للعامة؛ يحدد العرض والعمولة كتابةً بعد التواصل، ولا يوجد دفع آلي.</span></section>
    <footer className="section-footer"><span>© SITUN · جميع الدول</span><Link href="/services">الخدمات والعمل</Link><Link href="/marketplace">التسوق والشراء</Link><Link href="/">الصفحة الرئيسية</Link></footer>
  </main>;
}
