import { describe, expect, it } from "vitest";
import { buildWhatsAppMessage, calculateCommission, calculateSellerNet, calculateSubtotal, validateCheckout } from "../shared/marketplace";

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

  it("validates the required delivery fields", () => {
    expect(validateCheckout({ name: "", phone: "", city: "" })).toEqual({
      name: "Le nom est obligatoire.",
      phone: "Le téléphone est obligatoire.",
      city: "L’adresse de livraison est obligatoire.",
    });
  });

  it("builds a WhatsApp-ready order summary", () => {
    const message = buildWhatsAppMessage([{ name: "Noir Élixir", price: 49, quantity: 2 }], 98, {
      name: "Ada Lovelace",
      phone: "0600000000",
      city: "Paris",
    });
    expect(message).toContain("Noir Élixir x2");
    expect(message).toContain("Paiement à la livraison.");
    expect(message).toContain("Ada Lovelace");
  });
});
