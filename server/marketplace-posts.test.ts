import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const createMarketplacePost = vi.hoisted(() => vi.fn(async (input: Record<string, unknown>) => ({ success: true as const, postId: 7, input })));
const deleteMarketplacePost = vi.hoisted(() => vi.fn(async (postId: number, ownerId: number) => ({ success: true as const, postId, ownerId })));
const updateMarketplacePostStatusForAdmin = vi.hoisted(() => vi.fn(async (postId: number, status: string) => ({ success: true as const, postId, status })));
const createContentReport = vi.hoisted(() => vi.fn(async (input: Record<string, unknown>) => ({ success: true as const, reportId: 3, input })));

vi.mock("./db", () => ({
  createCashOnDeliveryOrder: vi.fn(), createContentReport, createMarketplacePost, createPostInquiry: vi.fn(), createProduct: vi.fn(), createService: vi.fn(), createServiceRequest: vi.fn(), deleteMarketplacePost, getMarketplacePost: vi.fn(), getPublicServiceProfile: vi.fn(), getServiceProfile: vi.fn(), getServiceById: vi.fn(), listActiveMarketplacePosts: vi.fn(async () => []), listActiveProducts: vi.fn(async () => []), listActiveServices: vi.fn(async () => []), listAllMarketplacePostsForAdmin: vi.fn(async () => []), listAllPostInquiriesForAdmin: vi.fn(async () => []), listAllProductsForAdmin: vi.fn(async () => []), listAllServicesForAdmin: vi.fn(async () => []), listCommissionSettings: vi.fn(async () => []), listContentReportsForAdmin: vi.fn(async () => []), listMarketplacePostsForUser: vi.fn(async () => []), listManualServicePayments: vi.fn(async () => []), listOrdersForAdmin: vi.fn(async () => []), listPostInquiriesForOwner: vi.fn(async () => []), listServiceRequestsForAdmin: vi.fn(async () => []), listServicesForUser: vi.fn(async () => []), listSellers: vi.fn(async () => []), updateCommissionCollectionStatus: vi.fn(), updateContentReportStatus: vi.fn(), updateMarketplacePost: vi.fn(), updateMarketplacePostStatusForAdmin, updateMarketplacePostStatusForUser: vi.fn(), updatePostInquiryStatus: vi.fn(), updateProduct: vi.fn(), updateProductStatus: vi.fn(), updateServiceRequestCommissionStatus: vi.fn(), updateServiceRequestStatus: vi.fn(), updateServiceStatus: vi.fn(), upsertCommissionSetting: vi.fn(), upsertManualServicePayment: vi.fn(), upsertServiceProfile: vi.fn(),
}));

const { appRouter } = await import("./routers");
const user = { id: 12, openId: "user-12", name: "Test User", email: "user@example.com", loginMethod: "test", role: "user" as const, accountType: "seller" as const, country: null, city: null, preferredLanguage: "en", preferredCurrency: "EUR", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const admin = { ...user, id: 1, openId: "owner", role: "admin" as const };
const context = (currentUser: typeof user | typeof admin | null): TrpcContext => ({ user: currentUser, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] });

describe("marketplace posts", () => {
  it("allows an authenticated user to submit a post owned by their account", async () => {
    const result = await appRouter.createCaller(context(user)).marketplace.createPost({ postType: "vehicle", title: "Voiture familiale", category: "Automobile", description: "Une description suffisamment longue pour passer la validation.", language: "fr", currency: "EUR", priceCents: 1200000, remote: "no" });
    expect(result.postId).toBe(7);
    expect(createMarketplacePost).toHaveBeenCalledWith(expect.objectContaining({ ownerId: 12, postType: "vehicle" }));
  });

  it("rejects a non-authenticated post submission", async () => {
    await expect(appRouter.createCaller(context(null)).marketplace.createPost({ postType: "service", title: "Service test", category: "Design", description: "Une description suffisamment longue pour passer la validation.", language: "en", currency: "USD", remote: "yes" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("keeps user deletion scoped to the authenticated owner", async () => {
    await appRouter.createCaller(context(user)).marketplace.deletePost({ postId: 21 });
    expect(deleteMarketplacePost).toHaveBeenCalledWith(21, 12);
  });

  it("allows only admin callers to moderate posts", async () => {
    const result = await appRouter.createCaller(context(admin)).marketplace.updatePostStatusAdmin({ postId: 21, status: "active" });
    expect(result.status).toBe("active");
    await expect(appRouter.createCaller(context(user)).marketplace.updatePostStatusAdmin({ postId: 21, status: "active" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("binds reports to the authenticated reporter", async () => {
    await appRouter.createCaller(context(user)).marketplace.reportPost({ postId: 21, reason: "محتوى مضلل" });
    expect(createContentReport).toHaveBeenCalledWith(expect.objectContaining({ reporterUserId: 12, postId: 21 }));
  });
});
