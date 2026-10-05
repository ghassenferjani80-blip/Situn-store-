import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, unique } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: text("passwordHash"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  accountType: mysqlEnum("accountType", ["customer", "seller", "service_provider", "employer", "freelancer"]).default("customer").notNull(),
  country: varchar("country", { length: 120 }),
  city: varchar("city", { length: 120 }),
  preferredLanguage: varchar("preferredLanguage", { length: 12 }).default("en"),
  preferredCurrency: varchar("preferredCurrency", { length: 8 }).default("EUR"),
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

export const marketplaceTaxonomies = mysqlTable("marketplaceTaxonomies", {
  id: int("id").autoincrement().primaryKey(),
  kind: mysqlEnum("kind", ["category", "country"]).notNull(),
  value: varchar("value", { length: 120 }).notNull(),
  labelAr: varchar("labelAr", { length: 160 }).notNull(),
  labelFr: varchar("labelFr", { length: 160 }).notNull(),
  labelEn: varchar("labelEn", { length: 160 }).notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ kindValueUnique: unique("marketplaceTaxonomies_kind_value_unique").on(table.kind, table.value) }));

export const marketplacePosts = mysqlTable("marketplacePosts", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  postType: mysqlEnum("postType", ["product", "service", "job", "online_work", "real_estate", "vehicle", "classified"]).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("imageUrl"),
  country: varchar("country", { length: 120 }),
  city: varchar("city", { length: 120 }),
  language: varchar("language", { length: 12 }).default("en").notNull(),
  currency: varchar("currency", { length: 8 }).default("EUR").notNull(),
  priceCents: int("priceCents"),
  remote: mysqlEnum("remote", ["yes", "no", "hybrid"]).default("no").notNull(),
  status: mysqlEnum("status", ["draft", "pending", "active", "paused", "rejected", "archived"]).default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const postInquiries = mysqlTable("postInquiries", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  ownerId: int("ownerId").notNull(),
  requesterUserId: int("requesterUserId"),
  requesterName: varchar("requesterName", { length: 160 }).notNull(),
  requesterContact: varchar("requesterContact", { length: 160 }).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["new", "contacted", "closed", "cancelled"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contentReports = mysqlTable("contentReports", {
  id: int("id").autoincrement().primaryKey(),
  reporterUserId: int("reporterUserId"),
  postId: int("postId"),
  reportedUserId: int("reportedUserId"),
  reason: varchar("reason", { length: 120 }).notNull(),
  details: text("details"),
  status: mysqlEnum("status", ["open", "reviewing", "resolved", "dismissed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const servicePayments = mysqlTable("servicePayments", {
  id: int("id").autoincrement().primaryKey(),
  serviceRequestId: int("serviceRequestId").notNull(),
  amountReceivedCents: int("amountReceivedCents").notNull(),
  commissionCents: int("commissionCents").notNull(),
  providerPayoutCents: int("providerPayoutCents").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "bank_transfer", "other"]).default("bank_transfer").notNull(),
  status: mysqlEnum("status", ["pending", "received", "provider_paid", "settled", "cancelled"]).default("pending").notNull(),
  ownerNote: text("ownerNote"),
  receivedAt: timestamp("receivedAt"),
  providerPaidAt: timestamp("providerPaidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ requestUnique: unique("servicePayments_request_unique").on(table.serviceRequestId) }));

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

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  buyerUserId: int("buyerUserId").notNull(),
  ownerUserId: int("ownerUserId").notNull(),
  postId: int("postId"),
  serviceId: int("serviceId"),
  status: mysqlEnum("status", ["open", "closed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderUserId: int("senderUserId").notNull(),
  body: text("body").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type MarketplacePost = typeof marketplacePosts.$inferSelect;
export type MarketplaceTaxonomy = typeof marketplaceTaxonomies.$inferSelect;
export type PostInquiry = typeof postInquiries.$inferSelect;
export type ContentReport = typeof contentReports.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Seller = typeof sellers.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type CommissionSetting = typeof commissionSettings.$inferSelect;
export type ServiceProfile = typeof serviceProfiles.$inferSelect;
export type Service = typeof services.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type ServicePayment = typeof servicePayments.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
