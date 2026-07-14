"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import MobileMenu from "./MobileMenu";
import MobileBottomNav from "./MobileBottomNav";
import LeftSidebar from "./LeftSidebar";
import Stories from "./Stories";
import CreatePostBox from "./CreatePostBox";
import PostCard from "./PostCard";
import RightSidebar from "./RightSidebar";
import ThemeSwitch from "./ThemeSwitch";
import { api, imageUrl } from "../utils/api";
import type { Post } from '../types';
import type { CreatePostInput, FeedAppProps, FeedResponse, ViewPost } from '../types/feed';
const avatar = "/assets/images/post_img.png";
const relativeTime = (value: string) => {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};
const adapt = (p: Post): ViewPost => ({
  id: p.id,
  author: `${p.author.firstName} ${p.author.lastName}`,
  authorAvatar: avatar,
  timeAgo: relativeTime(p.createdAt),
  visibility: p.visibility === "PUBLIC" ? "Public" : "Private",
  title: p.text,
  image: imageUrl(p.imageUrl),
  reactionAvatars: p.likes
    .slice(0, 5)
    .map(() => "/assets/images/react_img1.png"),
  reactionExtra: p.likes.length,
  likerNames: p.likes.map((person) => `${person.firstName} ${person.lastName}`),
  shareCount: 0,
  liked: p.likedByMe,
  likeLabel: "Like",
  previousCommentCount: 0,
  comments: p.comments.flatMap((c) => [
    {
      id: c.id,
      name: `${c.author.firstName} ${c.author.lastName}`,
      avatar: "/assets/images/txt_img.png",
      text: c.body,
      likes: c.likes.length,
      likerNames: c.likes.map((person) => `${person.firstName} ${person.lastName}`),
      time: relativeTime(c.createdAt),
      liked: c.likedByMe,
      parentId: null,
    },
    ...c.replies.map((r) => ({
      id: r.id,
      name: `↳ ${r.author.firstName} ${r.author.lastName}`,
      avatar: "/assets/images/comment_img.png",
      text: r.body,
      likes: r.likes.length,
      likerNames: r.likes.map((person) => `${person.firstName} ${person.lastName}`),
      time: relativeTime(r.createdAt),
      liked: r.likedByMe,
      parentId: c.id,
    })),
  ]),
});
export default function App({ user }: FeedAppProps) {
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<ViewPost[]>([]),
    [nextCursor, setNextCursor] = useState<string | null>(null),
    [loadingMore, setLoadingMore] = useState(false),
    [dark, setDark] = useState(false),
    [error, setError] = useState("");
  const load = useCallback(
    () =>
      api<FeedResponse>("/feed")
        .then((x) => { setPosts(x.items.map(adapt)); setNextCursor(x.nextCursor); })
        .catch((e) => setError(e.message)),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);
  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const page = await api<FeedResponse>(`/feed?cursor=${encodeURIComponent(nextCursor)}`);
      setPosts((current) => [...current, ...page.items.map(adapt)]);
      setNextCursor(page.nextCursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, nextCursor]);
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !nextCursor) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) void loadMore(); },
      { rootMargin: "400px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, nextCursor]);
  async function create(data: CreatePostInput) {
    await api("/feed", { method: "POST", body: JSON.stringify(data) });
    await load();
  }
  async function like(id: string) {
    await api(`/feed/${id}/like`, { method: "POST" });
    await load();
  }
  async function comment(id: string, text: string, parentId?: string) {
    await api(`/feed/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: text, parentId }),
    });
    await load();
  }
  async function likeComment(id: string) {
    await api(`/feed/comments/${id}/like`, { method: "POST" });
    await load();
  }
  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }
  return (
    <div
      className={
        "_layout _layout_main_wrapper" + (dark ? " _dark_wrapper" : "")
      }
    >
      <ThemeSwitch dark={dark} onToggle={() => setDark((v) => !v)} />
      <div className="_main_layout">
        <Header user={user} onLogout={logout} />
        <MobileMenu onLogout={logout} />
        <MobileBottomNav />
        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <LeftSidebar />
              </div>
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <Stories />
                    <CreatePostBox onPost={create} />
                    {error && <p style={{ color: "#ff4d4f" }}>{error}</p>}
                    {posts.map((p, index) => (
                      <PostCard
                        key={p.id}
                        post={p}
                        onLikeToggle={like}
                        onAddComment={comment}
                        onLikeComment={likeComment}
                        eager={index === 0}
                      />
                    ))}
                    {nextCursor && (
                      <div
                        ref={loadMoreRef}
                        role="status"
                        aria-live="polite"
                        className="_mar_b24"
                        style={{ minHeight: 48, textAlign: "center", color: "#65676b" }}
                      >
                        {loadingMore ? "Loading more posts…" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
