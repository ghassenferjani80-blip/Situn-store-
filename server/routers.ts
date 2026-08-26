import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createCashOnDeliveryOrder, listActiveProducts, listAllProductsForAdmin, listCommissionSettings, listOrdersForAdmin, listSellers, updateCommissionCollectionStatus, upsertCommissionSetting } from "./db";

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
