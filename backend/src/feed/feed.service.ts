import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Visibility } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCommentDto, CreatePostDto } from "./feed.dto";

const person = { id: true, firstName: true, lastName: true } as const;
const likes = {
  orderBy: { createdAt: "asc" as const },
  select: { user: { select: person } },
};
@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}
  async list(userId: string, cursor?: string) {
    const records = await this.prisma.post.findMany({
      where: { OR: [{ visibility: Visibility.PUBLIC }, { authorId: userId }] },
      take: 11,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        author: { select: person },
        likes,
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: person },
            likes,
            replies: {
              orderBy: { createdAt: "asc" },
              include: { author: { select: person }, likes },
            },
          },
        },
      },
    });
    const nextCursor = records.length > 10 ? records.pop()!.id : null;
    return { items: records.map((p) => this.present(p, userId)), nextCursor };
  }
  async create(userId: string, dto: CreatePostDto) {
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
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });
    if (!comment) throw new NotFoundException("Comment not found");
    if (
      comment.post.visibility === Visibility.PRIVATE &&
      comment.post.authorId !== userId
    )
      throw new ForbiddenException();
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
  private present(post: any, userId: string) {
    const mapComment = (c: any): any => ({
      ...c,
      likes: c.likes.map((x: any) => x.user),
      likedByMe: c.likes.some((x: any) => x.user.id === userId),
      replies: c.replies?.map(mapComment) ?? [],
    });
    return {
      ...post,
      likes: post.likes.map((x: any) => x.user),
      likedByMe: post.likes.some((x: any) => x.user.id === userId),
      comments: post.comments.map(mapComment),
    };
  }
}
