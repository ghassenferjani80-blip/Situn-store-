import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { authenticateLocalUser, createLocalSession, registerLocalUser, SITUN_SESSION_COOKIE } from "./localAuth";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { createCashOnDeliveryOrder, createContentReport, createMarketplacePost, createPostInquiry, createProduct, createService, createServiceRequest, deleteMarketplacePost, getMarketplacePost, getPublicServiceProfile, getServiceProfile, getServiceById, listActiveMarketplacePosts, listActiveProducts, listActiveServices, listContentReportsForAdmin, listUsersForAdmin, listMarketplaceTaxonomies, createMarketplaceTaxonomy, updateMarketplaceTaxonomy, listAllMarketplacePostsForAdmin, listAllPostInquiriesForAdmin, listAllProductsForAdmin, listAllServicesForAdmin, listCommissionSettings, listMarketplacePostsForUser, listOrdersForAdmin, listPostInquiriesForOwner, listServiceRequestsForAdmin, listServicesForUser, listSellers, updateCommissionCollectionStatus, updateContentReportStatus, updateMarketplacePost, updateMarketplacePostStatusForAdmin, updateMarketplacePostStatusForUser, updatePostInquiryStatusForOwner, updateUserAccountTypeForAdmin, updateUserPreferences, updateProduct, updateProductStatus, updateServiceRequestCommissionStatus, updateServiceRequestStatus, updateServiceStatus, upsertCommissionSetting, upsertManualServicePayment, upsertServiceProfile, listManualServicePayments } from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) return null;
      const { passwordHash: _passwordHash, ...safeUser } = ctx.user;
      return safeUser;
    }),
    register: publicProcedure.input(z.object({ name: z.string().trim().min(2).max(160), email: z.string().trim().email().max(320), password: z.string().min(8).max(128) })).mutation(async ({ ctx, input }) => {
      try {
        const user = await registerLocalUser(input);
        const sessionToken = await createLocalSession(user);
        const baseOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(SITUN_SESSION_COOKIE, sessionToken, { ...baseOptions, sameSite: baseOptions.secure ? "none" : "lax", maxAge: 30 * 24 * 60 * 60 * 1000 });
        const { passwordHash: _passwordHash, ...safeUser } = user;
        return safeUser;
      } catch (error) {
        if (error instanceof Error && error.message === "EMAIL_ALREADY_REGISTERED") throw new TRPCError({ code: "CONFLICT", message: "هذا البريد مستخدم بالفعل." });
        throw error;
      }
    }),
    login: publicProcedure.input(z.object({ email: z.string().trim().email().max(320), password: z.string().min(1).max(128) })).mutation(async ({ ctx, input }) => {
      const user = await authenticateLocalUser(input.email, input.password);
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
      const sessionToken = await createLocalSession(user);
      const baseOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(SITUN_SESSION_COOKIE, sessionToken, { ...baseOptions, sameSite: baseOptions.secure ? "none" : "lax", maxAge: 30 * 24 * 60 * 60 * 1000 });
      const { passwordHash: _passwordHash, ...safeUser } = user;
      return safeUser;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(SITUN_SESSION_COOKIE, { ...cookieOptions, sameSite: cookieOptions.secure ? "none" : "lax", maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  marketplace: router({
    products: publicProcedure.query(() => listActiveProducts()),
    services: publicProcedure.query(() => listActiveServices()),
    profile: protectedProcedure.query(({ ctx }) => getServiceProfile(ctx.user.id)),
    publicProfile: publicProcedure.input(z.object({ userId: z.number().int().positive() })).query(({ input }) => getPublicServiceProfile(input.userId)),
    saveProfile: protectedProcedure.input(z.object({ displayName: z.string().trim().min(2).max(160), bio: z.string().trim().max(4000).optional(), location: z.string().trim().max(180).optional(), country: z.string().trim().max(120).optional(), languages: z.string().trim().max(500).optional(), avatarUrl: z.string().trim().max(2000).refine((value) => value === "" || value.startsWith("/manus-storage/") || /^https?:\/\//i.test(value), "Invalid avatar URL").optional() })).mutation(({ ctx, input }) => upsertServiceProfile(ctx.user.id, input)),
    myServices: protectedProcedure.query(({ ctx }) => listServicesForUser(ctx.user.id)),
    createService: protectedProcedure.input(z.object({ title: z.string().trim().min(3).max(180), category: z.string().trim().min(2).max(80), description: z.string().trim().min(20).max(10000), location: z.string().trim().max(180).optional(), country: z.string().trim().max(120).optional(), languages: z.string().trim().max(500).optional(), deliveryMode: z.enum(["online", "local", "hybrid"]).default("online"), priceCents: z.number().int().positive(), imageUrl: z.string().trim().max(2000).refine((value) => value === "" || value.startsWith("/manus-storage/") || /^https?:\/\//i.test(value), "Invalid image URL").optional() })).mutation(async ({ ctx, input }) => { const profile = await getServiceProfile(ctx.user.id); if (!profile) throw new TRPCError({ code: "BAD_REQUEST", message: "Create your service profile before publishing a service." }); return createService({ ...input, providerUserId: ctx.user.id }); }),
    requestService: publicProcedure.input(z.object({ serviceId: z.number().int().positive(), buyerName: z.string().trim().min(2).max(160), buyerPhone: z.string().trim().min(6).max(40), message: z.string().trim().max(4000).optional() })).mutation(async ({ input, ctx }) => { const service = await getServiceById(input.serviceId); if (!service || service.status !== "active") throw new TRPCError({ code: "NOT_FOUND", message: "This service is not available." }); const commissionCents = Math.round(service.priceCents * service.commissionRateBps / 10000); return createServiceRequest({ serviceId: service.id, providerUserId: service.providerUserId, buyerUserId: ctx.user?.id, buyerName: input.buyerName, buyerPhone: input.buyerPhone, message: input.message, agreedPriceCents: service.priceCents, commissionCents, commissionRateBps: service.commissionRateBps }); }),
    sellers: adminProcedure.query(() => listSellers()),
    adminOrders: adminProcedure.query(() => listOrdersForAdmin()),
    adminProducts: adminProcedure.query(() => listAllProductsForAdmin()),
    adminServices: adminProcedure.query(() => listAllServicesForAdmin()),
    adminServiceRequests: adminProcedure.query(() => listServiceRequestsForAdmin()),
    adminServicePayments: adminProcedure.query(() => listManualServicePayments()),
    posts: publicProcedure.query(() => listActiveMarketplacePosts()),
    post: publicProcedure.input(z.object({ postId: z.number().int().positive() })).query(async ({ input }) => { const post = await getMarketplacePost(input.postId); return post?.status === "active" ? post : null; }),
    myPosts: protectedProcedure.query(({ ctx }) => listMarketplacePostsForUser(ctx.user.id)),
    myInquiries: protectedProcedure.query(({ ctx }) => listPostInquiriesForOwner(ctx.user.id)),
    createPost: protectedProcedure.input(z.object({ postType: z.enum(["product", "service", "job", "online_work", "real_estate", "vehicle", "classified"]), title: z.string().trim().min(3).max(180), category: z.string().trim().min(2).max(100), description: z.string().trim().min(20).max(20000), imageUrl: z.string().trim().max(2000).refine((value) => value === "" || value.startsWith("/manus-storage/") || value.startsWith("http://") || value.startsWith("https://"), "Invalid image URL").optional(), country: z.string().trim().max(120).optional(), city: z.string().trim().max(120).optional(), language: z.string().trim().min(2).max(12), currency: z.string().trim().min(3).max(8), priceCents: z.number().int().nonnegative().optional(), remote: z.enum(["yes", "no", "hybrid"]).default("no") })).mutation(({ ctx, input }) => createMarketplacePost({ ...input, ownerId: ctx.user.id })),
    updatePost: protectedProcedure.input(z.object({ postId: z.number().int().positive(), postType: z.enum(["product", "service", "job", "online_work", "real_estate", "vehicle", "classified"]), title: z.string().trim().min(3).max(180), category: z.string().trim().min(2).max(100), description: z.string().trim().min(20).max(20000), imageUrl: z.string().trim().max(2000).refine((value) => value === "" || value.startsWith("/manus-storage/") || value.startsWith("http://") || value.startsWith("https://"), "Invalid image URL").optional(), country: z.string().trim().max(120).optional(), city: z.string().trim().max(120).optional(), language: z.string().trim().min(2).max(12), currency: z.string().trim().min(3).max(8), priceCents: z.number().int().nonnegative().optional(), remote: z.enum(["yes", "no", "hybrid"]).default("no") })).mutation(({ ctx, input }) => { const { postId, ...post } = input; return updateMarketplacePost(postId, ctx.user.id, post); }),
    updateUserPreferences: protectedProcedure.input(z.object({ accountType: z.enum(["customer", "seller", "service_provider", "employer", "freelancer"]), country: z.string().trim().max(120).optional(), city: z.string().trim().max(120).optional(), preferredLanguage: z.string().trim().min(2).max(12), preferredCurrency: z.string().trim().min(3).max(8) })).mutation(({ ctx, input }) => updateUserPreferences(ctx.user.id, input)),
    updatePostStatus: protectedProcedure.input(z.object({ postId: z.number().int().positive(), status: z.enum(["draft", "paused", "archived"]) })).mutation(({ ctx, input }) => updateMarketplacePostStatusForUser(input.postId, ctx.user.id, input.status)),
    deletePost: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(({ ctx, input }) => deleteMarketplacePost(input.postId, ctx.user.id)),
    createInquiry: publicProcedure.input(z.object({ postId: z.number().int().positive(), requesterName: z.string().trim().min(2).max(160), requesterContact: z.string().trim().min(4).max(160), message: z.string().trim().max(4000).optional() })).mutation(async ({ ctx, input }) => { const post = await getMarketplacePost(input.postId); if (!post || post.status !== "active") throw new TRPCError({ code: "NOT_FOUND", message: "This listing is not available." }); return createPostInquiry({ ...input, ownerId: post.ownerId, requesterUserId: ctx.user?.id }); }),
    reportPost: protectedProcedure.input(z.object({ postId: z.number().int().positive(), reason: z.string().trim().min(3).max(120), details: z.string().trim().max(4000).optional() })).mutation(({ ctx, input }) => createContentReport({ ...input, reporterUserId: ctx.user.id })),
    updateInquiryStatus: protectedProcedure.input(z.object({ inquiryId: z.number().int().positive(), status: z.enum(["new", "contacted", "closed", "cancelled"]) })).mutation(({ ctx, input }) => updatePostInquiryStatusForOwner(input.inquiryId, ctx.user.id, input.status)),
    adminUsers: adminProcedure.query(() => listUsersForAdmin()),
    adminTaxonomies: adminProcedure.input(z.object({ kind: z.enum(["category", "country"]) }).optional()).query(({ input }) => listMarketplaceTaxonomies(input?.kind)),
    createTaxonomy: adminProcedure.input(z.object({ kind: z.enum(["category", "country"]), value: z.string().trim().min(2).max(120), labelAr: z.string().trim().min(2).max(160), labelFr: z.string().trim().min(2).max(160), labelEn: z.string().trim().min(2).max(160) })).mutation(({ input }) => createMarketplaceTaxonomy(input)),
    updateTaxonomy: adminProcedure.input(z.object({ id: z.number().int().positive(), value: z.string().trim().min(2).max(120), labelAr: z.string().trim().min(2).max(160), labelFr: z.string().trim().min(2).max(160), labelEn: z.string().trim().min(2).max(160), active: z.number().int().min(0).max(1) })).mutation(({ input }) => { const { id, ...taxonomy } = input; return updateMarketplaceTaxonomy(id, taxonomy); }),
    updateUserAccountType: adminProcedure.input(z.object({ userId: z.number().int().positive(), accountType: z.enum(["customer", "seller", "service_provider", "employer", "freelancer"]) })).mutation(({ input }) => updateUserAccountTypeForAdmin(input.userId, input.accountType)),
    adminPosts: adminProcedure.query(() => listAllMarketplacePostsForAdmin()),
    adminInquiries: adminProcedure.query(() => listAllPostInquiriesForAdmin()),
    adminReports: adminProcedure.query(() => listContentReportsForAdmin()),
    updatePostStatusAdmin: adminProcedure.input(z.object({ postId: z.number().int().positive(), status: z.enum(["pending", "active", "paused", "rejected", "archived"]), rejectionReason: z.string().trim().max(2000).optional() })).mutation(({ input }) => updateMarketplacePostStatusForAdmin(input.postId, input.status, input.rejectionReason)),
    updateReportStatus: adminProcedure.input(z.object({ reportId: z.number().int().positive(), status: z.enum(["open", "reviewing", "resolved", "dismissed"]) })).mutation(({ input }) => updateContentReportStatus(input.reportId, input.status)),
    uploadProductImage: adminProcedure.input(z.object({ fileName: z.string().trim().min(1).max(180), contentType: z.string().trim().regex(/^image\/[a-z0-9.+-]+$/i), base64: z.string().min(1).max(12_000_000) })).mutation(async ({ input, ctx }) => {
      const bytes = Buffer.from(input.base64, "base64");
      if (bytes.length > 8 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Image must be 8 MB or smaller." });
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      return storagePut(`situn-listings/${ctx.user.id}/${safeName}`, bytes, input.contentType);
    }),
    createProduct: adminProcedure.input(z.object({ sellerId: z.number().int().positive(), name: z.string().trim().min(2).max(180), category: z.string().trim().min(1).max(80), description: z.string().trim().max(10000).optional(), imageUrl: z.string().trim().max(2000).refine((value) => value === "" || value.startsWith("/manus-storage/") || /^https?:\/\//i.test(value), "Invalid image URL").optional(), location: z.string().trim().max(180).optional(), priceCents: z.number().int().positive(), status: z.enum(["draft", "active", "archived"]).default("draft") })).mutation(({ input }) => createProduct(input)),
    updateProduct: adminProcedure.input(z.object({ productId: z.number().int().positive(), sellerId: z.number().int().positive(), name: z.string().trim().min(2).max(180), category: z.string().trim().min(1).max(80), description: z.string().trim().max(10000).optional(), imageUrl: z.string().trim().max(2000).refine((value) => value === "" || value.startsWith("/manus-storage/") || /^https?:\/\//i.test(value), "Invalid image URL").optional(), location: z.string().trim().max(180).optional(), priceCents: z.number().int().positive() })).mutation(({ input }) => { const { productId, ...product } = input; return updateProduct(productId, product); }),
    updateProductStatus: adminProcedure.input(z.object({ productId: z.number().int().positive(), status: z.enum(["draft", "active", "archived"]) })).mutation(({ input }) => updateProductStatus(input.productId, input.status)),
    updateServiceStatus: adminProcedure.input(z.object({ serviceId: z.number().int().positive(), status: z.enum(["draft", "pending", "active", "paused", "archived"]) })).mutation(({ input }) => updateServiceStatus(input.serviceId, input.status)),
    updateServiceRequestStatus: adminProcedure.input(z.object({ requestId: z.number().int().positive(), status: z.enum(["received", "contacted", "accepted", "completed", "cancelled"]) })).mutation(({ input }) => updateServiceRequestStatus(input.requestId, input.status)),
    updateServiceRequestCommissionStatus: adminProcedure.input(z.object({ requestId: z.number().int().positive(), status: z.enum(["pending", "collected", "waived"]) })).mutation(({ input }) => updateServiceRequestCommissionStatus(input.requestId, input.status)),
    saveManualServicePayment: adminProcedure.input(z.object({ serviceRequestId: z.number().int().positive(), amountReceivedCents: z.number().int().positive(), commissionCents: z.number().int().nonnegative(), providerPayoutCents: z.number().int().nonnegative(), paymentMethod: z.enum(["cash", "bank_transfer", "other"]), status: z.enum(["pending", "received", "provider_paid", "settled", "cancelled"]), ownerNote: z.string().trim().max(2000).optional() })).mutation(({ input }) => { if (input.commissionCents + input.providerPayoutCents !== input.amountReceivedCents) throw new TRPCError({ code: "BAD_REQUEST", message: "La commission et la part du prestataire doivent égaler le montant reçu." }); return upsertManualServicePayment(input); }),
    commissionSettings: adminProcedure.query(() => listCommissionSettings()),
    updateCommissionSetting: adminProcedure.input(z.object({ category: z.string().trim().min(1).max(80), sellerRateBps: z.number().int().min(0).max(5000), buyerRateBps: z.number().int().min(0).max(3000) })).mutation(({ input }) => upsertCommissionSetting(input.category, input.sellerRateBps, input.buyerRateBps)),
    updateCommissionStatus: adminProcedure.input(z.object({ orderId: z.number().int().positive(), status: z.enum(["pending", "collected", "waived"]) })).mutation(({ input }) => updateCommissionCollectionStatus(input.orderId, input.status)),
    createOrder: publicProcedure.input(z.object({
      customerName: z.string().trim().min(2),
      customerPhone: z.string().trim().min(6),
      deliveryAddress: z.string().trim().min(5),
      note: z.string().optional(),
      subtotalCents: z.number().int().positive(),
      commissionCents: z.number().int().nonnegative(),
      commissionRateBps: z.number().int().nonnegative(),
      buyerFeeCents: z.number().int().nonnegative(),
      buyerFeeRateBps: z.number().int().nonnegative(),
      sellerNetCents: z.number().int().nonnegative(),
      items: z.array(z.object({
        productId: z.number().int().positive(),
        sellerId: z.number().int().positive(),
        productName: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPriceCents: z.number().int().positive(),
        lineTotalCents: z.number().int().positive(),
      })).min(1),
    })).mutation(({ input }) => createCashOnDeliveryOrder(input)),
  }),
});

export type AppRouter = typeof appRouter;
