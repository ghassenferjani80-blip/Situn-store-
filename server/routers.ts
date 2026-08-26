import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createCashOnDeliveryOrder, listActiveProducts, listSellers } from "./db";

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
    sellers: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin access required");
      return listSellers();
    }),
    createOrder: publicProcedure.input(z.object({
      customerName: z.string().trim().min(2),
      customerPhone: z.string().trim().min(6),
      deliveryAddress: z.string().trim().min(5),
      note: z.string().optional(),
      subtotalCents: z.number().int().positive(),
      commissionCents: z.number().int().nonnegative(),
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
