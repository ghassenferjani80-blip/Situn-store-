import { CircleDollarSign, ShieldCheck } from "lucide-react";

export default function CommissionNotice() {
  return (
    <aside className="commission-notice" aria-label="شفافية عمولة SITUN">
      <span className="commission-notice-icon"><CircleDollarSign size={19} /></span>
      <div>
        <strong>العمولة واضحة قبل التواصل</strong>
        <p>تظهر الرسوم والنسبة والمبلغ قبل طلب الربط. يحدد الاتفاق المكتوب من يدفعها، والتحصيل يدوي تحت إدارة SITUN — لا يوجد خصم آلي.</p>
      </div>
      <ShieldCheck size={20} className="commission-notice-check" aria-hidden="true" />
    </aside>
  );
}
