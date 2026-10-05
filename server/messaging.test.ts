import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  getMarketplacePost: vi.fn(),
  getServiceById: vi.fn(),
  countUnreadMessagesForUser: vi.fn().mockResolvedValue(2),
  getOrCreateConversation: vi.fn().mockResolvedValue({ id: 44, buyerUserId: 2, ownerUserId: 8, postId: 17, serviceId: null, status: "open", createdAt: new Date(), updatedAt: new Date() }),
  listConversationsForUser: vi.fn().mockResolvedValue([]),
  listMessagesForUser: vi.fn().mockResolvedValue([]),
  createConversationMessage: vi.fn().mockResolvedValue({ success: true, messageId: 55 }),
  markConversationRead: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, ...mocks };
});

function context(userId: number | null): TrpcContext {
  return { user: userId === null ? null : { id: userId, openId: `user-${userId}`, name: `User ${userId}`, email: `user${userId}@example.com`, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("direct messaging and negotiation", () => {
  it("requires authentication to open a conversation", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.marketplace.conversations()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("opens a post conversation for the authenticated buyer", async () => {
    mocks.getMarketplacePost.mockResolvedValueOnce({ id: 17, ownerId: 8, status: "active", title: "Service SITUN" });
    const caller = appRouter.createCaller(context(2));
    await expect(caller.marketplace.startPostConversation({ postId: 17 })).resolves.toMatchObject({ id: 44 });
    expect(mocks.getOrCreateConversation).toHaveBeenCalledWith({ buyerUserId: 2, ownerUserId: 8, postId: 17 });
  });

  it("prevents the owner from opening a conversation with themselves", async () => {
    mocks.getMarketplacePost.mockResolvedValueOnce({ id: 17, ownerId: 8, status: "active", title: "My listing" });
    const caller = appRouter.createCaller(context(8));
    await expect(caller.marketplace.startPostConversation({ postId: 17 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("allows only authenticated participants to send messages", async () => {
    const caller = appRouter.createCaller(context(2));
    await expect(caller.marketplace.sendMessage({ conversationId: 44, body: "هل يمكن التفاوض على التفاصيل؟" })).resolves.toMatchObject({ messageId: 55 });
    expect(mocks.createConversationMessage).toHaveBeenCalledWith(44, 2, "هل يمكن التفاوض على التفاصيل؟");
  });

  it("rejects a message when the database denies participant access", async () => {
    mocks.createConversationMessage.mockResolvedValueOnce(null);
    const caller = appRouter.createCaller(context(99));
    await expect(caller.marketplace.sendMessage({ conversationId: 44, body: "رسالة غير مصرح بها" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects reading a conversation when the database denies access", async () => {
    mocks.listMessagesForUser.mockResolvedValueOnce(null);
    const caller = appRouter.createCaller(context(99));
    await expect(caller.marketplace.conversationMessages({ conversationId: 44 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns the unread count privately for each authenticated participant", async () => {
    const buyer = appRouter.createCaller(context(2));
    const owner = appRouter.createCaller(context(8));
    await expect(buyer.marketplace.unreadMessageCount()).resolves.toBe(2);
    await expect(owner.marketplace.unreadMessageCount()).resolves.toBe(2);
    expect(mocks.countUnreadMessagesForUser).toHaveBeenNthCalledWith(1, 2);
    expect(mocks.countUnreadMessagesForUser).toHaveBeenNthCalledWith(2, 8);
  });
});
