import { useState, useMemo } from "react";
import DesignImage from './DesignImage';
import { youMightLike, friends } from "../data/feed";
import { SearchIcon, OnlineDotIcon } from "./icons";

export default function RightSidebar() {
  const [followState, setFollowState] = useState<'followed' | 'ignored' | null>(null);
  const [query, setQuery] = useState("");

  const filteredFriends = useMemo(
    () => friends.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="_layout_right_sidebar_wrap">
      <div className="_layout_right_sidebar_inner">
        <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_right_inner_area_info_content _mar_b24">
            <h4 className="_right_inner_area_info_content_title _title5">You Might Like</h4>
            <span className="_right_inner_area_info_content_txt">
              <a className="_right_inner_area_info_content_txt_link" href="#0">
                See All
              </a>
            </span>
          </div>
          <hr className="_underline" />
          <div className="_right_inner_area_info_ppl">
            <div className="_right_inner_area_info_box">
              <div className="_right_inner_area_info_box_image">
                <a href="#0">
                  <DesignImage src={youMightLike.image} alt="Image" className="_ppl_img" />
                </a>
              </div>
              <div className="_right_inner_area_info_box_txt">
                <a href="#0">
                  <h4 className="_right_inner_area_info_box_title">{youMightLike.name}</h4>
                </a>
                <p className="_right_inner_area_info_box_para">{youMightLike.title}</p>
              </div>
            </div>
            <div className="_right_info_btn_grp">
              <button
                type="button"
                className="_right_info_btn_link"
                onClick={() => setFollowState("ignored")}
              >
                {followState === "ignored" ? "Ignored" : "Ignore"}
              </button>
              <button
                type="button"
                className={
                  "_right_info_btn_link" + (followState === "followed" ? " _right_info_btn_link_active" : "")
                }
                onClick={() => setFollowState("followed")}
              >
                {followState === "followed" ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="_layout_right_sidebar_inner">
        <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_feed_top_fixed">
            <div className="_feed_right_inner_area_card_content _mar_b24">
              <h4 className="_feed_right_inner_area_card_content_title _title5">Your Friends</h4>
              <span className="_feed_right_inner_area_card_content_txt">
                <a className="_feed_right_inner_area_card_content_txt_link" href="#0">
                  See All
                </a>
              </span>
            </div>
            <form className="_feed_right_inner_area_card_form" onSubmit={(e) => e.preventDefault()}>
              <span className="_feed_right_inner_area_card_form_svg">
                <SearchIcon />
              </span>
              <input
                className="form-control me-2 _feed_right_inner_area_card_form_inpt"
                type="search"
                placeholder="input search text"
                aria-label="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          </div>
          <div className="_feed_bottom_fixed">
            {filteredFriends.map((friend) => (
              <div
                className={
                  "_feed_right_inner_area_card_ppl" +
                  (friend.status === "time" ? " _feed_right_inner_area_card_ppl_inactive" : "")
                }
                key={friend.id}
              >
                <div className="_feed_right_inner_area_card_ppl_box">
                  <div className="_feed_right_inner_area_card_ppl_image">
                    <a href="#0">
                      <DesignImage src={friend.image} alt="" className="_box_ppl_img" />
                    </a>
                  </div>
                  <div className="_feed_right_inner_area_card_ppl_txt">
                    <a href="#0">
                      <h4 className="_feed_right_inner_area_card_ppl_title">{friend.name}</h4>
                    </a>
                    <p className="_feed_right_inner_area_card_ppl_para">{friend.title}</p>
                  </div>
                </div>
                <div className="_feed_right_inner_area_card_ppl_side">
                  {friend.status === "time" ? <span>{friend.time}</span> : <OnlineDotIcon />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
