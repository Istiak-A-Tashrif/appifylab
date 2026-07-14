export const ENDPOINTS = {
  auth: {
    csrf: "/auth/csrf-token",
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
  feed: {
    list: (cursor?: string) =>
      cursor ? `/feed?cursor=${encodeURIComponent(cursor)}` : "/feed",
    create: "/feed",
    likePost: (postId: string) => `/feed/${postId}/like`,
    comments: (postId: string) => `/feed/${postId}/comments`,
    commentsPage: (postId: string, cursor?: string) =>
      cursor
        ? `/feed/${postId}/comments?cursor=${encodeURIComponent(cursor)}`
        : `/feed/${postId}/comments`,
    postLikers: (postId: string, cursor?: string) =>
      cursor
        ? `/feed/${postId}/likes?cursor=${encodeURIComponent(cursor)}`
        : `/feed/${postId}/likes`,
    commentLikers: (commentId: string, cursor?: string) =>
      cursor
        ? `/feed/comments/${commentId}/likes?cursor=${encodeURIComponent(cursor)}`
        : `/feed/comments/${commentId}/likes`,
    replies: (commentId: string, cursor?: string) =>
      cursor
        ? `/feed/comments/${commentId}/replies?cursor=${encodeURIComponent(cursor)}`
        : `/feed/comments/${commentId}/replies`,
    likeComment: (commentId: string) => `/feed/comments/${commentId}/like`,
  },
} as const;
