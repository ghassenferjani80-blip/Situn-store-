import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createProduct: vi.fn().mockResolvedValue({ success: true, productId: 41 }),
  updateProduct: vi.fn().mockResolvedValue({ success: true, productId: 41 }),
  updateProductStatus: vi.fn().mockResolvedValue({ success: true, productId: 41, status: "active" }),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...mocks };
});

function contextFor(role: "admin" | "user"): TrpcContext {
  return {
    user: { id: 1, openId: `${role}-user`, name: role, email: `${role}@example.com`, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const productInput = {
  sellerId: 1,
  name: "Villa testée",
  category: "Immobilier",
  description: "Description vérifiée pour le test.",
  imageUrl: "/manus-storage/situn-listings/owner/photo.heic",
  location: "Carpentras, Vaucluse",
  priceCents: 250000,
};

describe("owner listing controls", () => {
  it("rejects regular users from creating listings", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.marketplace.createProduct({ ...productInput, status: "draft" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.createProduct).not.toHaveBeenCalled();
  });

  it("allows the owner to create, update and publish a listing", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    await expect(caller.marketplace.createProduct({ ...productInput, status: "draft" })).resolves.toMatchObject({ productId: 41 });
    await caller.marketplace.updateProduct({ productId: 41, ...productInput });
    await caller.marketplace.updateProductStatus({ productId: 41, status: "active" });
    expect(mocks.createProduct).toHaveBeenCalledWith({ ...productInput, status: "draft" });
    expect(mocks.updateProduct).toHaveBeenCalledWith(41, productInput);
    expect(mocks.updateProductStatus).toHaveBeenCalledWith(41, "active");
  });

  it("rejects invalid product values before reaching the database", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    await expect(caller.marketplace.createProduct({ ...productInput, name: "x", priceCents: 0, status: "draft" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
