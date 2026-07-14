import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Visibility } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeedService } from "./feed.service";

const user = { id: "user-1", firstName: "Ada", lastName: "Lovelace" };
const other = { id: "user-2", firstName: "Grace", lastName: "Hopper" };

function prismaMock() {
  return {
    post: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    comment: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    postLike: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    commentLike: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe("FeedService", () => {
  let prisma: ReturnType<typeof prismaMock>;
  let service: FeedService;

  beforeEach(() => {
    prisma = prismaMock();
    service = new FeedService(
      prisma as never,
      { get: vi.fn().mockReturnValue("ddluuftiq") } as never,
    );
  });

  it("requests only public or own posts, newest first, with cursor pagination", async () => {
    prisma.post.findMany.mockResolvedValue([]);
    await service.list(user.id, "cursor-1");
    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [{ visibility: Visibility.PUBLIC }, { authorId: user.id }],
        },
        cursor: { id: "cursor-1" },
        skip: 1,
        take: 11,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
    );
  });

  it("returns liker identities and the current user's like state", async () => {
    prisma.post.findMany.mockResolvedValue([
      {
        id: "post-1",
        author: user,
        likes: [{ user }, { user: other }],
        _count: { likes: 2, comments: 1 },
        comments: [
          {
            id: "comment-1",
            author: other,
            likes: [{ user }],
            _count: { likes: 1, replies: 0 },
            replies: [],
          },
        ],
      },
    ]);
    prisma.postLike.findMany.mockResolvedValue([{ postId: "post-1" }]);
    prisma.commentLike.findMany.mockResolvedValue([{ commentId: "comment-1" }]);
    const page = await service.list(user.id);
    expect(page.items[0].likes).toEqual([user, other]);
    expect(page.items[0].likedByMe).toBe(true);
    expect(page.items[0].comments[0].likedByMe).toBe(true);
  });

  it("prevents another user from liking a private post", async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: "post-1",
      authorId: other.id,
      visibility: Visibility.PRIVATE,
    });
    await expect(
      service.togglePostLike(user.id, "post-1"),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.postLike.create).not.toHaveBeenCalled();
  });

  it("rejects replies beneath another reply", async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: "post-1",
      authorId: other.id,
      visibility: Visibility.PUBLIC,
    });
    prisma.comment.findUnique.mockResolvedValue({
      id: "reply-1",
      postId: "post-1",
      parentId: "comment-1",
    });
    await expect(
      service.comment(user.id, "post-1", {
        body: "nested",
        parentId: "reply-1",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it("toggles an existing post like off", async () => {
    prisma.post.findUnique.mockResolvedValue({
      id: "post-1",
      authorId: other.id,
      visibility: Visibility.PUBLIC,
    });
    prisma.postLike.findUnique.mockResolvedValue({
      userId: user.id,
      postId: "post-1",
    });
    await expect(service.togglePostLike(user.id, "post-1")).resolves.toEqual({
      liked: false,
    });
    expect(prisma.postLike.delete).toHaveBeenCalledWith({
      where: { userId_postId: { userId: user.id, postId: "post-1" } },
    });
  });

  it("rejects image URLs outside the configured Cloudinary account", async () => {
    await expect(
      service.create(user.id, {
        text: "post",
        visibility: Visibility.PUBLIC,
        imageUrl: "https://evil.example/image.png",
      }),
    ).rejects.toThrow("configured Cloudinary account");
    expect(prisma.post.create).not.toHaveBeenCalled();
  });

  it("bounds nested interaction previews in the main feed query", async () => {
    prisma.post.findMany.mockResolvedValue([]);
    await service.list(user.id);
    const query = prisma.post.findMany.mock.calls[0][0];
    expect(query.include.likes.take).toBe(3);
    expect(query.include.comments.take).toBe(3);
    expect(query.include.comments.include.replies.take).toBe(2);
  });

  it("presents the current user's reply-like state independently", async () => {
    prisma.post.findMany.mockResolvedValue([
      {
        id: "post-1",
        author: other,
        likes: [],
        _count: { likes: 0, comments: 1 },
        comments: [
          {
            id: "comment-1",
            author: other,
            likes: [],
            _count: { likes: 0, replies: 1 },
            replies: [
              {
                id: "reply-1",
                author: other,
                likes: [{ user }],
                _count: { likes: 1, replies: 0 },
                replies: [],
              },
            ],
          },
        ],
      },
    ]);
    prisma.commentLike.findMany.mockResolvedValue([{ commentId: "reply-1" }]);
    const page = await service.list(user.id);
    expect(page.items[0].comments[0].likedByMe).toBe(false);
    expect(page.items[0].comments[0].replies[0]).toMatchObject({
      id: "reply-1",
      likedByMe: true,
      likeCount: 1,
    });
  });
});
