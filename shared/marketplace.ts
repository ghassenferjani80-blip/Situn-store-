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
  if (!customer.phone.trim()) errors.phone = "Le téléphone est obligatoire.";
  if (!customer.city.trim()) errors.city = "L’adresse de livraison est obligatoire.";
  return errors;
}

export function buildWhatsAppMessage(lines: Array<MarketplaceLine & { name: string }>, subtotal: number, customer: CheckoutCustomer, language: "fr" | "ar" | "en" = "fr") {
  const items = lines.map((line) => `• ${line.name} x${line.quantity} — ${line.price * line.quantity} €`).join("\n");
  if (language === "ar") return `مرحبًا SITUN،\n\nأرغب في طلب:\n${items}\n\nالإجمالي التقديري: ${subtotal.toFixed(2)} €\nالاسم: ${customer.name}\nالهاتف: ${customer.phone}\nالعنوان: ${customer.city}\nملاحظة: ${customer.note?.trim() || "لا توجد"}\n\nالدفع عند الاستلام.`;
  if (language === "en") return `Hello SITUN,\n\nI would like to order:\n${items}\n\nEstimated total: ${subtotal.toFixed(2)} €\nName: ${customer.name}\nPhone: ${customer.phone}\nAddress: ${customer.city}\nNote: ${customer.note?.trim() || "None"}\n\nCash on delivery.`;
  return `Bonjour SITUN,\n\nJe souhaite commander :\n${items}\n\nTotal estimé : ${subtotal.toFixed(2)} €\nNom : ${customer.name}\nTéléphone : ${customer.phone}\nAdresse : ${customer.city}\nNote : ${customer.note?.trim() || "Aucune"}\n\nPaiement à la livraison.`;
}
