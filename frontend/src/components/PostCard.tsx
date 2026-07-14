import { useState } from "react";
import DesignImage from './DesignImage';
import {
  DotsIcon,
  HahaIcon,
  CommentIcon,
  ShareIcon,
  SmileIcon,
  ImageAttachIcon,
  ThumbsUpIcon,
  HeartIcon,
} from "./icons";
import { postDropdownLinks } from "../data/feed";
import { designUser } from "../data/feed";
import type { FormEvent } from 'react';
import type { ViewPost } from '../types/feed';

interface Props {
  post: ViewPost;
  onLikeToggle: (id: string) => Promise<void>;
  onAddComment: (postId: string, text: string, parentId?: string) => Promise<void>;
  onLikeComment: (id: string) => Promise<void>;
  eager?: boolean;
}
export default function PostCard({ post, onLikeToggle, onAddComment, onLikeComment, eager = false }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [commentBoxOpen, setCommentBoxOpen] = useState(false);
  const [previousCommentsShown, setPreviousCommentsShown] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [postLikersOpen, setPostLikersOpen] = useState(false);
  const [commentLikersOpen, setCommentLikersOpen] = useState<string | null>(null);

  function submitComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = commentDraft.trim();
    if (!trimmed) return;
    onAddComment(post.id, trimmed);
    setCommentDraft("");
  }

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <DesignImage src={post.authorAvatar} alt="" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{post.author}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {post.timeAgo} . <a href="#0">{post.visibility}</a>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown">
              <button
                type="button"
                className="_feed_timeline_post_dropdown_link"
                onClick={() => setDropdownOpen((v) => !v)}
              >
                <DotsIcon />
              </button>
            </div>
            {dropdownOpen && (
              <div className="_feed_timeline_dropdown _timeline_dropdown" style={{ display: "block" }}>
                <ul className="_feed_timeline_dropdown_list">
                  {postDropdownLinks.map((link) => (
                    <li className="_feed_timeline_dropdown_item" key={link.id}>
                      <a href="#0" className="_feed_timeline_dropdown_link">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <h4 className="_feed_inner_timeline_post_title">{post.title}</h4>
        {post.image && <div className="_feed_inner_timeline_image">
          <DesignImage src={post.image} alt="" className="_time_img" loading={eager ? 'eager' : 'lazy'} />
        </div>}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image">
          {post.reactionAvatars.map((src, i) => (
            <DesignImage
              key={i}
              src={src}
              alt="Image"
              className={i === 0 ? "_react_img1" : i > 2 ? "_react_img _rect_img_mbl_none" : "_react_img"}
            />
          ))}
          {post.reactionExtra > 0 && (
            <button
              type="button"
              className="_feed_inner_timeline_total_reacts_para"
              title={`Liked by ${post.likerNames.join(", ")}`}
              aria-expanded={postLikersOpen}
              onClick={() => setPostLikersOpen((open) => !open)}
            >
              {post.reactionExtra}
            </button>
          )}
          {postLikersOpen && <span className="_liker_names">Liked by {post.likerNames.join(", ")}</span>}
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <a href="#0" onClick={(e) => e.preventDefault()}>
              <span>{post.comments.length}</span> Comment
            </a>
          </p>
          <p className="_feed_inner_timeline_total_reacts_para2">
            <span>{post.shareCount}</span> Share
          </p>
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction">
        <button
          className={"_feed_inner_timeline_reaction_emoji _feed_reaction" + (post.liked ? " _feed_reaction_active" : "")}
          onClick={() => onLikeToggle(post.id)}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <HahaIcon />
              {post.liked ? post.likeLabel : "Like"}
            </span>
          </span>
        </button>
        <button className="_feed_inner_timeline_reaction_comment _feed_reaction" onClick={() => setCommentBoxOpen((v) => !v)}>
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <CommentIcon />
              Comment
            </span>
          </span>
        </button>
        <button className="_feed_inner_timeline_reaction_share _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <ShareIcon />
              Share
            </span>
          </span>
        </button>
      </div>

      {commentBoxOpen && (
        <div className="_feed_inner_timeline_cooment_area">
          <div className="_feed_inner_comment_box">
            <form className="_feed_inner_comment_box_form" onSubmit={submitComment}>
              <div className="_feed_inner_comment_box_content">
                <div className="_feed_inner_comment_box_content_image">
                  <DesignImage src={designUser.avatar} alt="" className="_comment_img" />
                </div>
                <div className="_feed_inner_comment_box_content_txt">
                  <textarea
                    className="form-control _comment_textarea"
                    placeholder="Write a comment"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                  />
                </div>
              </div>
              <div className="_feed_inner_comment_box_icon">
                <button type="button" className="_feed_inner_comment_box_icon_btn">
                  <SmileIcon />
                </button>
                <button type="submit" className="_feed_inner_comment_box_icon_btn">
                  <ImageAttachIcon />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="_timline_comment_main">
        {post.previousCommentCount > 0 && (
          <div className="_previous_comment">
            <button
              type="button"
              className="_previous_comment_txt"
              onClick={() => setPreviousCommentsShown((v) => !v)}
            >
              {previousCommentsShown ? "Hide previous comments" : `View ${post.previousCommentCount} previous comments`}
            </button>
          </div>
        )}
        {post.comments.map((comment) => (
          <div className="_comment_main" key={comment.id}>
            <div className="_comment_image">
              <a href="#0" className="_comment_image_link">
                <DesignImage src={comment.avatar} alt="" className="_comment_img1" />
              </a>
            </div>
            <div className="_comment_area">
              <div className="_comment_details">
                <div className="_comment_details_top">
                  <div className="_comment_name">
                    <a href="#0">
                      <h4 className="_comment_name_title">{comment.name}</h4>
                    </a>
                  </div>
                </div>
                <div className="_comment_status">
                  <p className="_comment_status_text">
                    <span>{comment.text}</span>
                  </p>
                </div>
                <div className="_total_reactions">
                  <div className="_total_react">
                    <span className="_reaction_like">
                      <ThumbsUpIcon />
                    </span>
                    <span className="_reaction_heart">
                      <HeartIcon />
                    </span>
                  </div>
                  {comment.likes > 0 && (
                    <button
                      type="button"
                      className="_total"
                      title={`Liked by ${comment.likerNames.join(", ")}`}
                      aria-expanded={commentLikersOpen === comment.id}
                      onClick={() => setCommentLikersOpen((id) => id === comment.id ? null : comment.id)}
                    >
                      {comment.likes}
                    </button>
                  )}
                  {commentLikersOpen === comment.id && <span className="_liker_names">Liked by {comment.likerNames.join(", ")}</span>}
                </div>
                <div className="_comment_reply">
                  <div className="_comment_reply_num">
                    <ul className="_comment_reply_list">
                      <li>
                        <span role="button" tabIndex={0} onClick={() => onLikeComment(comment.id)}>{comment.liked ? "Unlike." : "Like."}</span>
                      </li>
                      <li>
                        <span role="button" tabIndex={0} onClick={() => { const text=window.prompt("Write a reply"); if(text?.trim()) onAddComment(post.id,text.trim(),comment.parentId || comment.id) }}>Reply.</span>
                      </li>
                      <li>
                        <span>Share</span>
                      </li>
                      <li>
                        <span className="_time_link">.{comment.time}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
