import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Visibility } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeedService } from "./feed.service";

const user = { id: "user-1", firstName: "Ada", lastName: "Lovelace" };
const other = { id: "user-2", firstName: "Grace", lastName: "Hopper" };

function prismaMock() {
  return {
    post: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    comment: { findUnique: vi.fn(), create: vi.fn() },
    postLike: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
    commentLike: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
  };
}

describe("FeedService", () => {
  let prisma: ReturnType<typeof prismaMock>;
  let service: FeedService;

  beforeEach(() => {
    prisma = prismaMock();
    service = new FeedService(prisma as never);
  });

  it("requests only public or own posts, newest first, with cursor pagination", async () => {
    prisma.post.findMany.mockResolvedValue([]);
    await service.list(user.id, "cursor-1");
    expect(prisma.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { OR: [{ visibility: Visibility.PUBLIC }, { authorId: user.id }] },
      cursor: { id: "cursor-1" }, skip: 1, take: 11,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }));
  });

  it("returns liker identities and the current user's like state", async () => {
    prisma.post.findMany.mockResolvedValue([{
      id: "post-1", author: user, likes: [{ user }, { user: other }],
      comments: [{ id: "comment-1", author: other, likes: [{ user }], replies: [] }],
    }]);
    const page = await service.list(user.id);
    expect(page.items[0].likes).toEqual([user, other]);
    expect(page.items[0].likedByMe).toBe(true);
    expect(page.items[0].comments[0].likedByMe).toBe(true);
  });

  it("prevents another user from liking a private post", async () => {
    prisma.post.findUnique.mockResolvedValue({ id: "post-1", authorId: other.id, visibility: Visibility.PRIVATE });
    await expect(service.togglePostLike(user.id, "post-1")).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.postLike.create).not.toHaveBeenCalled();
  });

  it("rejects replies beneath another reply", async () => {
    prisma.post.findUnique.mockResolvedValue({ id: "post-1", authorId: other.id, visibility: Visibility.PUBLIC });
    prisma.comment.findUnique.mockResolvedValue({ id: "reply-1", postId: "post-1", parentId: "comment-1" });
    await expect(service.comment(user.id, "post-1", { body: "nested", parentId: "reply-1" }))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it("toggles an existing post like off", async () => {
    prisma.post.findUnique.mockResolvedValue({ id: "post-1", authorId: other.id, visibility: Visibility.PUBLIC });
    prisma.postLike.findUnique.mockResolvedValue({ userId: user.id, postId: "post-1" });
    await expect(service.togglePostLike(user.id, "post-1")).resolves.toEqual({ liked: false });
    expect(prisma.postLike.delete).toHaveBeenCalledWith({ where: { userId_postId: { userId: user.id, postId: "post-1" } } });
  });
});
