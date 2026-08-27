import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  getServiceProfile: vi.fn(),
  createService: vi.fn().mockResolvedValue({ success: true, serviceId: 12 }),
  getServiceById: vi.fn(),
  createServiceRequest: vi.fn().mockResolvedValue({ success: true, requestId: 33 }),
  updateServiceStatus: vi.fn().mockResolvedValue({ success: true, serviceId: 12, status: "active" }),
  listManualServicePayments: vi.fn().mockResolvedValue([]),
  upsertManualServicePayment: vi.fn().mockResolvedValue({ success: true, serviceRequestId: 33 }),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...mocks };
});

function contextFor(role: "admin" | "user"): TrpcContext {
  return {
    user: { id: role === "admin" ? 1 : 2, openId: `${role}-user`, name: role, email: `${role}@example.com`, loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const serviceInput = { title: "Création de site vitrine", category: "إنشاء مواقع", description: "Je crée un site clair et rapide pour présenter votre activité.", location: "À distance", country: "France", languages: "Français, العربية, English", deliveryMode: "online" as const, priceCents: 25000 };

describe("independent services marketplace", () => {
  it("requires authentication for a public service profile", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });
    await expect(caller.marketplace.profile()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires a profile before a person can submit a service", async () => {
    mocks.getServiceProfile.mockResolvedValueOnce(undefined);
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.marketplace.createService(serviceInput)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mocks.createService).not.toHaveBeenCalled();
  });

  it("submits an individual service as pending for owner review", async () => {
    mocks.getServiceProfile.mockResolvedValueOnce({ id: 5, userId: 2, displayName: "Membre indépendant", bio: "Une présentation suffisamment longue pour le profil.", location: "Vaucluse", avatarUrl: null, status: "draft", createdAt: new Date(), updatedAt: new Date() });
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.marketplace.createService(serviceInput)).resolves.toMatchObject({ serviceId: 12 });
    expect(mocks.createService).toHaveBeenCalledWith({ ...serviceInput, providerUserId: 2 });
  });

  it("lets the owner publish a reviewed service", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    await caller.marketplace.updateServiceStatus({ serviceId: 12, status: "active" });
    expect(mocks.updateServiceStatus).toHaveBeenCalledWith(12, "active");
  });

  it("keeps manual financial records private to the owner", async () => {
    const userCaller = appRouter.createCaller(contextFor("user"));
    await expect(userCaller.marketplace.saveManualServicePayment({ serviceRequestId: 33, amountReceivedCents: 10000, commissionCents: 1000, providerPayoutCents: 9000, paymentMethod: "bank_transfer", status: "received" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    const adminCaller = appRouter.createCaller(contextFor("admin"));
    await adminCaller.marketplace.saveManualServicePayment({ serviceRequestId: 33, amountReceivedCents: 10000, commissionCents: 1000, providerPayoutCents: 9000, paymentMethod: "bank_transfer", status: "received", ownerNote: "تم التحقق يدويًا" });
    expect(mocks.upsertManualServicePayment).toHaveBeenCalledWith(expect.objectContaining({ serviceRequestId: 33, commissionCents: 1000, providerPayoutCents: 9000 }));
    await expect(adminCaller.marketplace.saveManualServicePayment({ serviceRequestId: 33, amountReceivedCents: 10000, commissionCents: 1000, providerPayoutCents: 8000, paymentMethod: "cash", status: "received" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("records a request using the service price and commission rate", async () => {
    mocks.getServiceById.mockResolvedValueOnce({ id: 12, providerUserId: 2, title: serviceInput.title, category: serviceInput.category, description: serviceInput.description, location: serviceInput.location, priceCents: 25000, imageUrl: null, commissionRateBps: 1000, status: "active", createdAt: new Date(), updatedAt: new Date() });
    const caller = appRouter.createCaller(contextFor("user"));
    await caller.marketplace.requestService({ serviceId: 12, buyerName: "Client SITUN", buyerPhone: "+33600000000", message: "Je souhaite en savoir plus." });
    expect(mocks.createServiceRequest).toHaveBeenCalledWith(expect.objectContaining({ serviceId: 12, agreedPriceCents: 25000, commissionRateBps: 1000, commissionCents: 2500, buyerUserId: 2 }));
  });
});
