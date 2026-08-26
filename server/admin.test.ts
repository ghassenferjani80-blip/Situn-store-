import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(role: "admin" | "user"): TrpcContext {
  return {
    user: { id: 1, openId: `${role}-user`, name: role, email: `${role}@example.com`, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("marketplace owner controls", () => {
  it("rejects a regular user from reading owner orders", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.marketplace.adminOrders()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects a regular user from updating commission status", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.marketplace.updateCommissionStatus({ orderId: 1, status: "collected" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows the owner role to reach the protected orders procedure", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    await expect(caller.marketplace.adminOrders()).resolves.toEqual([]);
  });
});
