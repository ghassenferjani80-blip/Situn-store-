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
  sellerNetCents: int("sellerNetCents").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash_on_delivery"]).default("cash_on_delivery").notNull(),
  status: mysqlEnum("status", ["received", "confirmed", "delivered", "cancelled"]).default("received").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Seller = typeof sellers.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
