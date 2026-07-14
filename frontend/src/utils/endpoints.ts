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
    list: (cursor?: string) => cursor ? `/feed?cursor=${encodeURIComponent(cursor)}` : "/feed",
    create: "/feed",
    likePost: (postId: string) => `/feed/${postId}/like`,
    comments: (postId: string) => `/feed/${postId}/comments`,
    likeComment: (commentId: string) => `/feed/comments/${commentId}/like`,
  },
} as const;
