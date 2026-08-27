import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const sellers = mysqlTable("sellers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 32 }).notNull(),
  commissionRateBps: int("commissionRateBps").default(1000).notNull(),
  status: mysqlEnum("status", ["pending", "active", "paused"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  location: varchar("location", { length: 180 }),
  priceCents: int("priceCents").notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 40 }).notNull(),
  deliveryAddress: text("deliveryAddress").notNull(),
  note: text("note"),
  subtotalCents: int("subtotalCents").notNull(),
  commissionCents: int("commissionCents").notNull(),
  commissionRateBps: int("commissionRateBps").default(1000).notNull(),
  buyerFeeCents: int("buyerFeeCents").default(0).notNull(),
  buyerFeeRateBps: int("buyerFeeRateBps").default(0).notNull(),
  sellerNetCents: int("sellerNetCents").notNull(),
  commissionCollectionStatus: mysqlEnum("commissionCollectionStatus", ["pending", "collected", "waived"]).default("pending").notNull(),
  commissionCollectedAt: timestamp("commissionCollectedAt"),
  paymentMethod: mysqlEnum("paymentMethod", ["cash_on_delivery"]).default("cash_on_delivery").notNull(),
  status: mysqlEnum("status", ["received", "confirmed", "delivered", "cancelled"]).default("received").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const commissionSettings = mysqlTable("commissionSettings", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 80 }).notNull().unique(),
  sellerRateBps: int("sellerRateBps").notNull(),
  buyerRateBps: int("buyerRateBps").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  sellerId: int("sellerId").notNull(),
  productName: varchar("productName", { length: 180 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPriceCents: int("unitPriceCents").notNull(),
  lineTotalCents: int("lineTotalCents").notNull(),
});

export const serviceProfiles = mysqlTable("serviceProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 160 }).notNull(),
  bio: text("bio"),
  location: varchar("location", { length: 180 }),
  country: varchar("country", { length: 120 }),
  languages: varchar("languages", { length: 500 }),
  avatarUrl: text("avatarUrl"),
  status: mysqlEnum("status", ["draft", "active", "paused"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  providerUserId: int("providerUserId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 180 }),
  country: varchar("country", { length: 120 }),
  languages: varchar("languages", { length: 500 }),
  deliveryMode: mysqlEnum("deliveryMode", ["online", "local", "hybrid"]).default("online").notNull(),
  priceCents: int("priceCents").notNull(),
  imageUrl: text("imageUrl"),
  commissionRateBps: int("commissionRateBps").default(1000).notNull(),
  status: mysqlEnum("status", ["draft", "pending", "active", "paused", "archived"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const serviceRequests = mysqlTable("serviceRequests", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").notNull(),
  providerUserId: int("providerUserId").notNull(),
  buyerUserId: int("buyerUserId"),
  buyerName: varchar("buyerName", { length: 160 }).notNull(),
  buyerPhone: varchar("buyerPhone", { length: 40 }).notNull(),
  message: text("message"),
  agreedPriceCents: int("agreedPriceCents").notNull(),
  commissionCents: int("commissionCents").notNull(),
  commissionRateBps: int("commissionRateBps").notNull(),
  status: mysqlEnum("status", ["received", "contacted", "accepted", "completed", "cancelled"]).default("received").notNull(),
  commissionCollectionStatus: mysqlEnum("commissionCollectionStatus", ["pending", "collected", "waived"]).default("pending").notNull(),
  commissionCollectedAt: timestamp("commissionCollectedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Seller = typeof sellers.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type CommissionSetting = typeof commissionSettings.$inferSelect;
export type ServiceProfile = typeof serviceProfiles.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
