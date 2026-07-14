import type { Post, User } from "./index";

export type Visibility = "PUBLIC" | "PRIVATE";
export interface CreatePostInput {
  text: string;
  visibility: Visibility;
  imageUrl?: string;
}
export interface FeedResponse {
  items: Post[];
  nextCursor: string | null;
}
export interface ViewComment {
  id: string;
  name: string;
  avatar: string;
  text: string;
  likes: number;
  likerNames: string[];
  replyCount: number;
  time: string;
  liked: boolean;
  parentId: string | null;
}
export interface ViewPost {
  id: string;
  author: string;
  authorAvatar: string;
  timeAgo: string;
  visibility: string;
  title: string;
  image?: string;
  reactionAvatars: string[];
  reactionExtra: number;
  likerNames: string[];
  shareCount: number;
  liked: boolean;
  likeLabel: string;
  commentCount: number;
  previousCommentCount: number;
  comments: ViewComment[];
}
export interface FeedAppProps {
  user: User;
}
