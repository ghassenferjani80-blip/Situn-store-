import { describe, expect, it } from "vitest";
import { SECTION_SEO, SITE_SEO } from "./seo";

describe("SITUN SEO identity", () => {
  it("uses the global marketplace identity in the three primary languages", () => {
    expect(SITE_SEO.en.title).toContain("Buy, Sell, Work");
    expect(SITE_SEO.en.description).toContain("global marketplace");
    expect(SITE_SEO.fr.title).toContain("Achetez, vendez");
    expect(SITE_SEO.ar.title).toContain("اشترِ");
  });

  it("defines distinct SEO copy for the main sections", () => {
    expect(SECTION_SEO.marketplace.en.title).toContain("Marketplace");
    expect(SECTION_SEO.services.en.title).toContain("Services");
    expect(SECTION_SEO.promotion.en.title).toContain("Promotion");
    expect(SITE_SEO.en.description).not.toMatch(/world's largest|number one|largest marketplace/i);
  });
});
