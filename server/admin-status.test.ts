import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const updateCommissionCollectionStatus = vi.hoisted(() => vi.fn(async (orderId: number, status: "pending" | "collected" | "waived") => ({ success: true as const, orderId, status })));

vi.mock("./db", () => ({
  createCashOnDeliveryOrder: vi.fn(),
  listActiveProducts: vi.fn(async () => []),
  listAllProductsForAdmin: vi.fn(async () => []),
  listOrdersForAdmin: vi.fn(async () => []),
  listSellers: vi.fn(async () => []),
  updateCommissionCollectionStatus,
}));

const { appRouter } = await import("./routers");

function adminContext(): TrpcContext {
  return { user: { id: 1, openId: "owner", name: "Owner", email: "owner@example.com", loginMethod: "test", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("manual commission update", () => {
  beforeEach(() => updateCommissionCollectionStatus.mockClear());

  it.each(["pending", "collected", "waived"] as const)("updates status to %s for the owner", async (status) => {
    const result = await appRouter.createCaller(adminContext()).marketplace.updateCommissionStatus({ orderId: 42, status });
    expect(result).toEqual({ success: true, orderId: 42, status });
    expect(updateCommissionCollectionStatus).toHaveBeenCalledWith(42, status);
  });
});
