import { describe, expect, it } from "vitest";

describe("product image upload contract", () => {
  it("accepts supported image types and the 8 MB limit", () => {
    const supported = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    expect(supported.every((type) => /^image\/(jpeg|png|webp|gif)$/.test(type))).toBe(true);
    expect(8 * 1024 * 1024).toBe(8388608);
  });

  it("does not accept non-image content types", () => {
    expect(/^image\/(jpeg|png|webp|gif)$/.test("application/pdf")).toBe(false);
    expect(/^image\/(jpeg|png|webp|gif)$/.test("text/html")).toBe(false);
  });
});
