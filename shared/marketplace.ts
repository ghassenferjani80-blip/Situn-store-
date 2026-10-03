export type MarketplaceLine = {
  price: number;
  quantity: number;
};

export type CheckoutCustomer = {
  name: string;
  phone: string;
  city: string;
  note?: string;
};

export const DEFAULT_COMMISSION_RATE = 0.1;
export const DEFAULT_BUYER_FEE_RATE = 0.02;

export const CATEGORY_FEES = {
  Immobilier: { seller: 0.025, buyer: 0.005 },
  Automobile: { seller: 0.04, buyer: 0.01 },
  Luxe: { seller: 0.08, buyer: 0.02 },
  Transport: { seller: 0.05, buyer: 0.01 },
  default: { seller: DEFAULT_COMMISSION_RATE, buyer: DEFAULT_BUYER_FEE_RATE },
} as const;

export function getCategoryFees(category: string) {
  return CATEGORY_FEES[category as keyof typeof CATEGORY_FEES] ?? CATEGORY_FEES.default;
}
/** Public WhatsApp contact supplied by the SITUN owner; payments remain manual. */
export const SITUN_WHATSAPP = "33602257226";

export function calculateSubtotal(lines: MarketplaceLine[]) {
  return lines.reduce((total, line) => total + line.price * line.quantity, 0);
}

export function calculateCommission(subtotal: number, rate = DEFAULT_COMMISSION_RATE) {
  return Math.round(subtotal * rate * 100) / 100;
}

export function calculateSellerNet(subtotal: number, rate = DEFAULT_COMMISSION_RATE) {
  return Math.round((subtotal - calculateCommission(subtotal, rate)) * 100) / 100;
}

export function calculateBuyerFee(subtotal: number, rate = DEFAULT_BUYER_FEE_RATE) {
  return Math.round(subtotal * rate * 100) / 100;
}

export function calculateBuyerTotal(subtotal: number, rate = DEFAULT_BUYER_FEE_RATE) {
  return Math.round((subtotal + calculateBuyerFee(subtotal, rate)) * 100) / 100;
}

export function validateCheckout(customer: CheckoutCustomer) {
  const errors: Partial<Record<keyof CheckoutCustomer, string>> = {};
  if (!customer.name.trim()) errors.name = "Le nom est obligatoire.";
  if (!customer.phone.trim()) errors.phone = "Le numéro WhatsApp est obligatoire.";
  if (!customer.city.trim()) errors.city = "L’adresse de livraison est obligatoire.";
  return errors;
}

export type SitunLanguage = "fr" | "ar" | "en" | "es" | "it" | "de" | "pt" | "tr" | "nl";

export function buildWhatsAppMessage(lines: Array<MarketplaceLine & { name: string }>, subtotal: number, customer: CheckoutCustomer, language: SitunLanguage = "fr") {
  const items = lines.map((line) => `• ${line.name} x${line.quantity} — ${line.price * line.quantity} €`).join("\n");
  if (language === "ar") return `مرحبًا SITUN،\n\nأرغب في طلب:\n${items}\n\nالإجمالي التقديري: ${subtotal.toFixed(2)} €\nالاسم: ${customer.name}\nWhatsApp: ${customer.phone}\nالعنوان: ${customer.city}\nملاحظة: ${customer.note?.trim() || "لا توجد"}\n\nالتنسيق المباشر بين الأطراف عبر SITUN؛ لا تتم معالجة المدفوعات تلقائيًا.`;
  if (language === "en" || !["fr", "ar", "en"].includes(language)) return `Hello SITUN,\n\nI would like to order:\n${items}\n\nEstimated total: ${subtotal.toFixed(2)} €\nName: ${customer.name}\nWhatsApp: ${customer.phone}\nAddress: ${customer.city}\nNote: ${customer.note?.trim() || "None"}\n\nDirect coordination between the relevant parties; SITUN does not process payments automatically.`;
  return `Bonjour SITUN,\n\nJe souhaite commander :\n${items}\n\nTotal estimé : ${subtotal.toFixed(2)} €\nNom : ${customer.name}\nWhatsApp : ${customer.phone}\nAdresse : ${customer.city}\nNote : ${customer.note?.trim() || "Aucune"}\n\nCoordination directe entre les parties ; SITUN ne traite pas automatiquement les paiements.`;
}
