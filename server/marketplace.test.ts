import { describe, expect, it } from "vitest";
import { buildWhatsAppMessage, calculateBuyerFee, calculateBuyerTotal, calculateCommission, calculateSellerNet, calculateSubtotal, getCategoryFees, SITUN_WHATSAPP, validateCheckout } from "../shared/marketplace";

describe("marketplace calculations", () => {
  it("calculates the basket subtotal from quantities", () => {
    expect(calculateSubtotal([{ price: 49, quantity: 2 }, { price: 20, quantity: 1 }])).toBe(118);
  });

  it("calculates SITUN commission and seller net", () => {
    expect(calculateCommission(118)).toBe(11.8);
    expect(calculateSellerNet(118)).toBe(106.2);
  });

  it("supports a configurable commission rate", () => {
    expect(calculateCommission(200, 0.15)).toBe(30);
    expect(calculateSellerNet(200, 0.15)).toBe(170);
  });

  it("calculates the transparent buyer service fee", () => {
    expect(calculateBuyerFee(100)).toBe(2);
    expect(calculateBuyerTotal(100)).toBe(102);
  });

  it("validates the required delivery fields", () => {
    expect(validateCheckout({ name: "", phone: "", city: "" })).toEqual({
      name: "Le nom est obligatoire.",
      phone: "Le numéro WhatsApp est obligatoire.",
      city: "L’adresse de livraison est obligatoire.",
    });
  });

  it("uses transparent category-specific fee defaults", () => {
    expect(getCategoryFees("Immobilier")).toEqual({ seller: 0.025, buyer: 0.005 });
    expect(getCategoryFees("Automobile")).toEqual({ seller: 0.04, buyer: 0.01 });
    expect(getCategoryFees("Luxe")).toEqual({ seller: 0.08, buyer: 0.02 });
    expect(getCategoryFees("Transport")).toEqual({ seller: 0.05, buyer: 0.01 });
  });

  it("builds a coordination summary without payment-processing claims", () => {
    const message = buildWhatsAppMessage([{ name: "Noir Élixir", price: 49, quantity: 2 }], 98, {
      name: "Ada Lovelace",
      phone: "0600000000",
      city: "Paris",
    });
    expect(message).toContain("Noir Élixir x2");
    expect(message).toContain("Coordination directe entre les parties");
    expect(message).not.toContain("Paiement à la livraison");
    expect(message).toContain("Ada Lovelace");
  });

  it("uses the owner's confirmed French WhatsApp contact", () => {
    expect(SITUN_WHATSAPP).toBe("33602257226");
  });
});
