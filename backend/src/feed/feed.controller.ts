import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { CreateCommentDto, CreatePostDto } from "./feed.dto";
import { FeedService } from "./feed.service";

type CurrentRequest = Request & { user: { id: string } };
@UseGuards(AuthGuard("jwt"))
@Controller("feed")
export class FeedController {
  constructor(private feed: FeedService) {}
  @Get() list(@Req() req: CurrentRequest, @Query("cursor") cursor?: string) {
    return this.feed.list(req.user.id, cursor);
  }
  @Post() create(@Req() req: CurrentRequest, @Body() dto: CreatePostDto) {
    return this.feed.create(req.user.id, dto);
  }
  @Post(":id/comments") comment(
    @Req() req: CurrentRequest,
    @Param("id") id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.feed.comment(req.user.id, id, dto);
  }
  @Get(":id/comments") comments(
    @Req() req: CurrentRequest,
    @Param("id") id: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.feed.listComments(req.user.id, id, cursor);
  }
  @Get(":id/likes") postLikers(
    @Req() req: CurrentRequest,
    @Param("id") id: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.feed.listPostLikers(req.user.id, id, cursor);
  }
  @Get("comments/:id/likes") commentLikers(
    @Req() req: CurrentRequest,
    @Param("id") id: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.feed.listCommentLikers(req.user.id, id, cursor);
  }
  @Get("comments/:id/replies") replies(
    @Req() req: CurrentRequest,
    @Param("id") id: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.feed.listReplies(req.user.id, id, cursor);
  }
  @Post(":id/like") likePost(
    @Req() req: CurrentRequest,
    @Param("id") id: string,
  ) {
    return this.feed.togglePostLike(req.user.id, id);
  }
  @Post("comments/:id/like") likeComment(
    @Req() req: CurrentRequest,
    @Param("id") id: string,
  ) {
    return this.feed.toggleCommentLike(req.user.id, id);
  }
}
