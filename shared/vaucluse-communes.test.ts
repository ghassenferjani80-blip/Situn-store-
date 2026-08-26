import { describe, expect, it } from "vitest";
import { VAUCLUSE_COMMUNES } from "./vaucluse-communes";

describe("Vaucluse commune directory", () => {
  it("contains the exhaustive INSEE directory with unique five-digit codes", () => {
    expect(VAUCLUSE_COMMUNES).toHaveLength(151);
    expect(new Set(VAUCLUSE_COMMUNES.map((commune) => commune.code)).size).toBe(151);
    expect(VAUCLUSE_COMMUNES.every((commune) => /^84\d{3}$/.test(commune.code))).toBe(true);
    expect(VAUCLUSE_COMMUNES.map((commune) => commune.name)).toEqual(expect.arrayContaining([
      "Avignon",
      "Carpentras",
      "Orange",
      "Cavaillon",
      "Apt",
      "L'Isle-sur-la-Sorgue",
      "Fontaine-de-Vaucluse",
    ]));
  });
});
