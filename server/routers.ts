import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { createCashOnDeliveryOrder, createProduct, listActiveProducts, listAllProductsForAdmin, listCommissionSettings, listOrdersForAdmin, listSellers, updateCommissionCollectionStatus, updateProduct, updateProductStatus, upsertCommissionSetting } from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  marketplace: router({
    products: publicProcedure.query(() => listActiveProducts()),
    sellers: adminProcedure.query(() => listSellers()),
    adminOrders: adminProcedure.query(() => listOrdersForAdmin()),
    adminProducts: adminProcedure.query(() => listAllProductsForAdmin()),
    uploadProductImage: adminProcedure.input(z.object({ fileName: z.string().trim().min(1).max(180), contentType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/), base64: z.string().min(1).max(12_000_000) })).mutation(async ({ input, ctx }) => {
      const bytes = Buffer.from(input.base64, "base64");
      if (bytes.length > 8 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Image must be 8 MB or smaller." });
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      return storagePut(`situn-listings/${ctx.user.id}/${safeName}`, bytes, input.contentType);
    }),
    createProduct: adminProcedure.input(z.object({ sellerId: z.number().int().positive(), name: z.string().trim().min(2).max(180), category: z.string().trim().min(1).max(80), description: z.string().trim().max(10000).optional(), imageUrl: z.string().url().optional().or(z.literal("")), location: z.string().trim().max(180).optional(), priceCents: z.number().int().positive(), status: z.enum(["draft", "active", "archived"]).default("draft") })).mutation(({ input }) => createProduct(input)),
    updateProduct: adminProcedure.input(z.object({ productId: z.number().int().positive(), sellerId: z.number().int().positive(), name: z.string().trim().min(2).max(180), category: z.string().trim().min(1).max(80), description: z.string().trim().max(10000).optional(), imageUrl: z.string().url().optional().or(z.literal("")), location: z.string().trim().max(180).optional(), priceCents: z.number().int().positive() })).mutation(({ input }) => { const { productId, ...product } = input; return updateProduct(productId, product); }),
    updateProductStatus: adminProcedure.input(z.object({ productId: z.number().int().positive(), status: z.enum(["draft", "active", "archived"]) })).mutation(({ input }) => updateProductStatus(input.productId, input.status)),
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
