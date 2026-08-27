import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { commissionSettings, InsertUser, orderItems, orders, products, sellers, serviceProfiles, serviceRequests, services, users } from "../drizzle/schema";
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

export async function listCommissionSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(commissionSettings).orderBy(commissionSettings.category);
}

export async function upsertCommissionSetting(category: string, sellerRateBps: number, buyerRateBps: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(commissionSettings).values({ category, sellerRateBps, buyerRateBps }).onDuplicateKeyUpdate({ set: { sellerRateBps, buyerRateBps } });
  return { success: true as const, category, sellerRateBps, buyerRateBps };
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

export type ProductInput = {
  sellerId: number;
  name: string;
  category: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  priceCents: number;
  status?: "draft" | "active" | "archived";
};

export async function createProduct(input: ProductInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(products).values({ ...input, description: input.description || null, imageUrl: input.imageUrl || null, location: input.location || null, status: input.status ?? "draft" });
  return { success: true as const, productId: Number(result[0].insertId) };
}

export async function updateProduct(productId: number, input: Omit<ProductInput, "status">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(products).set({ ...input, description: input.description || null, imageUrl: input.imageUrl || null, location: input.location || null }).where(eq(products.id, productId));
  return { success: true as const, productId };
}

export async function updateProductStatus(productId: number, status: "draft" | "active" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(products).set({ status }).where(eq(products.id, productId));
  return { success: true as const, productId, status };
}

export type ServiceProfileInput = {
  displayName: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
};

export async function getServiceProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(serviceProfiles).where(eq(serviceProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function upsertServiceProfile(userId: number, input: ServiceProfileInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(serviceProfiles).values({ userId, displayName: input.displayName, bio: input.bio || null, location: input.location || null, avatarUrl: input.avatarUrl || null, status: "draft" }).onDuplicateKeyUpdate({ set: { displayName: input.displayName, bio: input.bio || null, location: input.location || null, avatarUrl: input.avatarUrl || null } });
  return { success: true as const, userId };
}

export type ServiceInput = {
  providerUserId: number;
  title: string;
  category: string;
  description: string;
  location?: string;
  priceCents: number;
  imageUrl?: string;
};

export async function createService(input: ServiceInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(services).values({ ...input, location: input.location || null, imageUrl: input.imageUrl || null, status: "pending" });
  return { success: true as const, serviceId: Number(result[0].insertId) };
}

export async function getServiceById(serviceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
  return result[0];
}

export async function listActiveServices() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ service: services, profile: serviceProfiles }).from(services).leftJoin(serviceProfiles, eq(services.providerUserId, serviceProfiles.userId)).where(eq(services.status, "active")).orderBy(desc(services.createdAt));
}

export async function listServicesForUser(providerUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(services).where(eq(services.providerUserId, providerUserId)).orderBy(desc(services.createdAt));
}

export async function listAllServicesForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ service: services, profile: serviceProfiles }).from(services).leftJoin(serviceProfiles, eq(services.providerUserId, serviceProfiles.userId)).orderBy(desc(services.createdAt));
}

export async function updateServiceStatus(serviceId: number, status: "draft" | "pending" | "active" | "paused" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(services).set({ status }).where(eq(services.id, serviceId));
  return { success: true as const, serviceId, status };
}

export type NewServiceRequest = {
  serviceId: number;
  providerUserId: number;
  buyerUserId?: number;
  buyerName: string;
  buyerPhone: string;
  message?: string;
  agreedPriceCents: number;
  commissionCents: number;
  commissionRateBps: number;
};

export async function createServiceRequest(input: NewServiceRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(serviceRequests).values({ ...input, buyerUserId: input.buyerUserId ?? null, message: input.message || null, status: "received", commissionCollectionStatus: "pending" });
  return { success: true as const, requestId: Number(result[0].insertId) };
}

export async function listServiceRequestsForAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ request: serviceRequests, service: services, profile: serviceProfiles }).from(serviceRequests).leftJoin(services, eq(serviceRequests.serviceId, services.id)).leftJoin(serviceProfiles, eq(serviceRequests.providerUserId, serviceProfiles.userId)).orderBy(desc(serviceRequests.createdAt));
}

export async function updateServiceRequestStatus(requestId: number, status: "received" | "contacted" | "accepted" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(serviceRequests).set({ status }).where(eq(serviceRequests.id, requestId));
  return { success: true as const, requestId, status };
}

export async function updateServiceRequestCommissionStatus(requestId: number, status: "pending" | "collected" | "waived") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(serviceRequests).set({ commissionCollectionStatus: status, commissionCollectedAt: status === "collected" ? new Date() : null }).where(eq(serviceRequests.id, requestId));
  return { success: true as const, requestId, status };
}
