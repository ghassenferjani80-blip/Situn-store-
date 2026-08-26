import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, orderItems, orders, products, sellers, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listAllProductsForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function listActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.status, "active"));
}

export async function listSellers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sellers);
}

export type NewOrder = {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  note?: string;
  subtotalCents: number;
  commissionCents: number;
  commissionRateBps: number;
  buyerFeeCents: number;
  buyerFeeRateBps: number;
  sellerNetCents: number;
  items: Array<{ productId: number; sellerId: number; productName: string; quantity: number; unitPriceCents: number; lineTotalCents: number }>;
};

export async function listOrdersForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateCommissionCollectionStatus(orderId: number, status: "pending" | "collected" | "waived") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(orders).set({ commissionCollectionStatus: status, commissionCollectedAt: status === "collected" ? new Date() : null }).where(eq(orders.id, orderId));
  return { success: true as const, orderId, status };
}

export async function createCashOnDeliveryOrder(input: NewOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.transaction(async (tx) => {
    const result = await tx.insert(orders).values({
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deliveryAddress: input.deliveryAddress,
      note: input.note,
      subtotalCents: input.subtotalCents,
      commissionCents: input.commissionCents,
      commissionRateBps: input.commissionRateBps,
      buyerFeeCents: input.buyerFeeCents,
      buyerFeeRateBps: input.buyerFeeRateBps,
      sellerNetCents: input.sellerNetCents,
      paymentMethod: "cash_on_delivery",
      status: "received",
    });
    const orderId = Number(result[0].insertId);
    if (input.items.length) await tx.insert(orderItems).values(input.items.map((item) => ({ ...item, orderId })));
    return { orderId };
  });
}
