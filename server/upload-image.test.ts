import { describe, expect, it } from "vitest";

const imageContentType = /^image\/[a-z0-9.+-]+$/i;
const imageUrl = (value: string) => value === "" || value.startsWith("/manus-storage/") || /^https?:\/\//i.test(value);

describe("product image upload contract", () => {
  it("accepts common and modern image MIME types", () => {
    const supported = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic", "image/heif", "image/tiff", "image/svg+xml"];
    expect(supported.every((type) => imageContentType.test(type))).toBe(true);
  });

  it("does not accept non-image content types", () => {
    expect(imageContentType.test("application/pdf")).toBe(false);
    expect(imageContentType.test("text/html")).toBe(false);
  });

  it("accepts the internal storage URL returned after upload", () => {
    expect(imageUrl("/manus-storage/situn-listings/owner/photo.heic")).toBe(true);
    expect(imageUrl("https://images.example/photo.avif")).toBe(true);
    expect(imageUrl("not-a-url")).toBe(false);
  });
});
