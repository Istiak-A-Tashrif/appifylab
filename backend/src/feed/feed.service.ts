import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Visibility } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCommentDto, CreatePostDto } from "./feed.dto";

const person = { id: true, firstName: true, lastName: true } as const;
const likes = {
  take: 3,
  orderBy: { createdAt: "asc" as const },
  select: { user: { select: person } },
};
const commentInclude = {
  author: { select: person },
  likes,
  _count: { select: { likes: true, replies: true } },
  replies: {
    take: 2,
    orderBy: { createdAt: "asc" as const },
    include: { author: { select: person }, likes, _count: { select: { likes: true, replies: true } } },
  },
} as const;
@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}
  async list(userId: string, cursor?: string) {
    const records = await this.prisma.post.findMany({
      where: { OR: [{ visibility: Visibility.PUBLIC }, { authorId: userId }] },
      take: 11,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        author: { select: person },
        likes,
        _count: { select: { likes: true, comments: { where: { parentId: null } } } },
        comments: {
          where: { parentId: null },
          take: 3,
          orderBy: { createdAt: "asc" },
          include: commentInclude,
        },
      },
    });
    const nextCursor = records.length > 10 ? records.pop()!.id : null;
    const postIds = records.map((post) => post.id);
    const commentIds = records.flatMap((post) => post.comments.flatMap((comment) => [comment.id, ...comment.replies.map((reply) => reply.id)]));
    const [myPostLikes, myCommentLikes] = await Promise.all([
      this.prisma.postLike.findMany({ where: { userId, postId: { in: postIds } }, select: { postId: true } }),
      this.prisma.commentLike.findMany({ where: { userId, commentId: { in: commentIds } }, select: { commentId: true } }),
    ]);
    const likedPosts = new Set(myPostLikes.map((like) => like.postId));
    const likedComments = new Set(myCommentLikes.map((like) => like.commentId));
    return { items: records.map((post) => this.present(post, likedPosts, likedComments)), nextCursor };
  }

  async listComments(userId: string, postId: string, cursor?: string) {
    await this.visiblePost(postId, userId);
    const records = await this.prisma.comment.findMany({
      where: { postId, parentId: null }, take: 11,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: "asc" }, { id: "asc" }], include: commentInclude,
    });
    const nextCursor = records.length > 10 ? records.pop()!.id : null;
    const ids = records.flatMap((comment) => [comment.id, ...comment.replies.map((reply) => reply.id)]);
    const mine = await this.prisma.commentLike.findMany({ where: { userId, commentId: { in: ids } }, select: { commentId: true } });
    const liked = new Set(mine.map((like) => like.commentId));
    return { items: records.map((comment) => this.presentComment(comment, liked)), nextCursor };
  }

  async listPostLikers(userId: string, postId: string, cursor?: string) {
    await this.visiblePost(postId, userId);
    const records = await this.prisma.postLike.findMany({
      where: { postId }, take: 21,
      ...(cursor ? { cursor: { userId_postId: { userId: cursor, postId } }, skip: 1 } : {}),
      orderBy: [{ createdAt: "desc" }, { userId: "asc" }], include: { user: { select: person } },
    });
    const nextCursor = records.length > 20 ? records.pop()!.userId : null;
    return { items: records.map((like) => like.user), nextCursor };
  }

  async listReplies(userId: string, commentId: string, cursor?: string) {
    const parent = await this.visibleComment(commentId, userId);
    if (parent.parentId) throw new NotFoundException("Parent comment not found");
    const records = await this.prisma.comment.findMany({
      where: { parentId: commentId }, take: 11,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: "asc" }, { id: "asc" }], include: commentInclude,
    });
    const nextCursor = records.length > 10 ? records.pop()!.id : null;
    const mine = await this.prisma.commentLike.findMany({ where: { userId, commentId: { in: records.map((reply) => reply.id) } }, select: { commentId: true } });
    const liked = new Set(mine.map((like) => like.commentId));
    return { items: records.map((reply) => this.presentComment(reply, liked)), nextCursor };
  }

  async listCommentLikers(userId: string, commentId: string, cursor?: string) {
    const comment = await this.visibleComment(commentId, userId);
    const records = await this.prisma.commentLike.findMany({
      where: { commentId: comment.id }, take: 21,
      ...(cursor ? { cursor: { userId_commentId: { userId: cursor, commentId } }, skip: 1 } : {}),
      orderBy: [{ createdAt: "desc" }, { userId: "asc" }], include: { user: { select: person } },
    });
    const nextCursor = records.length > 20 ? records.pop()!.userId : null;
    return { items: records.map((like) => like.user), nextCursor };
  }
  async create(userId: string, dto: CreatePostDto) {
    if (dto.imageUrl) this.validateImageUrl(dto.imageUrl);
    return this.prisma.post.create({
      data: {
        authorId: userId,
        text: dto.text.trim(),
        visibility: dto.visibility,
        imageUrl: dto.imageUrl,
      },
      include: { author: { select: person } },
    });
  }
  private validateImageUrl(value: string) {
    const cloudName = this.config.get("CLOUDINARY_CLOUD_NAME", "ddluuftiq");
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || !url.pathname.startsWith(`/${cloudName}/image/upload/`) || !url.pathname.includes("/appify-feed/"))
      throw new BadRequestException("Image must come from the configured Cloudinary account");
  }
  async comment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.visiblePost(postId, userId);
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent || parent.postId !== post.id || parent.parentId)
        throw new NotFoundException("Parent comment not found");
    }
    return this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        body: dto.body.trim(),
        parentId: dto.parentId,
      },
      include: { author: { select: person } },
    });
  }
  async togglePostLike(userId: string, postId: string) {
    await this.visiblePost(postId, userId);
    const key = { userId_postId: { userId, postId } };
    const existing = await this.prisma.postLike.findUnique({ where: key });
    if (existing) await this.prisma.postLike.delete({ where: key });
    else await this.prisma.postLike.create({ data: { userId, postId } });
    return { liked: !existing };
  }
  async toggleCommentLike(userId: string, commentId: string) {
    await this.visibleComment(commentId, userId);
    const key = { userId_commentId: { userId, commentId } };
    const existing = await this.prisma.commentLike.findUnique({ where: key });
    if (existing) await this.prisma.commentLike.delete({ where: key });
    else await this.prisma.commentLike.create({ data: { userId, commentId } });
    return { liked: !existing };
  }
  private async visiblePost(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException("Post not found");
    if (post.visibility === Visibility.PRIVATE && post.authorId !== userId)
      throw new ForbiddenException();
    return post;
  }
  private async visibleComment(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id }, include: { post: true } });
    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.post.visibility === Visibility.PRIVATE && comment.post.authorId !== userId) throw new ForbiddenException();
    return comment;
  }
  private presentComment(comment: any, likedComments: Set<string>): any {
    return {
      ...comment, likeCount: comment._count.likes, replyCount: comment._count.replies,
      likes: comment.likes.map((like: any) => like.user), likedByMe: likedComments.has(comment.id),
      replies: comment.replies?.map((reply: any) => this.presentComment(reply, likedComments)) ?? [],
    };
  }
  private present(post: any, likedPosts: Set<string>, likedComments: Set<string>) {
    return {
      ...post, likeCount: post._count.likes, commentCount: post._count.comments,
      likes: post.likes.map((x: any) => x.user),
      likedByMe: likedPosts.has(post.id),
      comments: post.comments.map((comment: any) => this.presentComment(comment, likedComments)),
    };
  }
}
