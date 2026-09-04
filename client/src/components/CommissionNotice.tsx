import { CircleDollarSign, ShieldCheck } from "lucide-react";

type Language = "fr" | "en" | "ar";

const copy: Record<Language, { label: string; title: string; text: string }> = {
  fr: {
    label: "Transparence de la commission SITUN",
    title: "Commission claire avant le contact",
    text: "Les frais, le taux et le montant sont présentés avant la mise en relation. La partie qui les paie est définie par écrit ; aucun prélèvement automatique n’est effectué.",
  },
  en: {
    label: "SITUN commission transparency",
    title: "Commission clear before contact",
    text: "The fee, rate and amount are presented before an introduction. The paying party is defined in writing; no automatic collection is made.",
  },
  ar: {
    label: "شفافية عمولة SITUN",
    title: "العمولة واضحة قبل التواصل",
    text: "تظهر الرسوم والنسبة والمبلغ قبل طلب الربط. يحدد الاتفاق المكتوب من يدفعها، ولا يوجد تحصيل آلي.",
  },
};

export default function CommissionNotice({ language }: { language: Language }) {
  const tx = copy[language];
  return (
    <aside className="commission-notice" aria-label={tx.label}>
      <span className="commission-notice-icon"><CircleDollarSign size={19} /></span>
      <div>
        <strong>{tx.title}</strong>
        <p>{tx.text}</p>
      </div>
      <ShieldCheck size={20} className="commission-notice-check" aria-hidden="true" />
    </aside>
  );
}
