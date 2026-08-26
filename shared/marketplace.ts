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

export function validateCheckout(customer: CheckoutCustomer) {
  const errors: Partial<Record<keyof CheckoutCustomer, string>> = {};
  if (!customer.name.trim()) errors.name = "Le nom est obligatoire.";
  if (!customer.phone.trim()) errors.phone = "Le téléphone est obligatoire.";
  if (!customer.city.trim()) errors.city = "L’adresse de livraison est obligatoire.";
  return errors;
}

export function buildWhatsAppMessage(lines: Array<MarketplaceLine & { name: string }>, subtotal: number, customer: CheckoutCustomer) {
  const items = lines.map((line) => `• ${line.name} x${line.quantity} — ${line.price * line.quantity} €`).join("\n");
  return `Bonjour SITUN,\n\nJe souhaite commander :\n${items}\n\nTotal estimé : ${subtotal.toFixed(2)} €\nNom : ${customer.name}\nTéléphone : ${customer.phone}\nAdresse : ${customer.city}\nNote : ${customer.note?.trim() || "Aucune"}\n\nPaiement à la livraison.`;
}
