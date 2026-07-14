export type Person = { id: string; firstName: string; lastName: string };
export type User = Person & { email: string };
export type Comment = {
  id: string;
  body: string;
  author: Person;
  likes: Person[];
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
  replies: Comment[];
  createdAt: string;
};
export type Post = {
  id: string;
  text: string;
  imageUrl?: string;
  visibility: "PUBLIC" | "PRIVATE";
  author: Person;
  likes: Person[];
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  comments: Comment[];
  createdAt: string;
};
