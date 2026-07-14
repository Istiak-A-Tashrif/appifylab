import { useState } from "react";
import DesignImage from './DesignImage';
import { explore, suggestedPeople, events } from "../data/feed";

const EXPLORE_ICON_PATHS: Record<string, string> = {
  Learning:
    "M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm0 1.395a8.605 8.605 0 100 17.21 8.605 8.605 0 000-17.21zm-1.233 4.65l.104.01c.188.028.443.113.668.203 1.026.398 3.033 1.746 3.8 2.563l.223.239.08.092a1.16 1.16 0 01.025 1.405c-.04.053-.086.105-.19.215l-.269.28c-.812.794-2.57 1.971-3.569 2.391-.277.117-.675.25-.865.253a1.167 1.167 0 01-1.07-.629c-.053-.104-.12-.353-.171-.586l-.051-.262c-.093-.57-.143-1.437-.142-2.347l.001-.288c.01-.858.063-1.64.157-2.147.037-.207.12-.563.167-.678.104-.25.291-.45.523-.575a1.15 1.15 0 01.58-.14z",
  Insights:
    "M14.96 2c3.101 0 5.159 2.417 5.159 5.893v8.214c0 3.476-2.058 5.893-5.16 5.893H6.989c-3.101 0-5.159-2.417-5.159-5.893V7.893C1.83 4.42 3.892 2 6.988 2h7.972z",
  "Find friends":
    "M9.032 14.456l.297.002c4.404.041 6.907 1.03 6.907 3.678 0 2.586-2.383 3.573-6.615 3.654l-.589.005c-4.588 0-7.203-.972-7.203-3.68 0-2.704 2.604-3.659 7.203-3.659zM9.031 2c2.698 0 4.864 2.369 4.864 5.319 0 2.95-2.166 5.318-4.864 5.318-2.697 0-4.863-2.369-4.863-5.318C4.17 4.368 6.335 2 9.032 2z",
  Bookmarks:
    "M13.704 2c2.8 0 4.585 1.435 4.585 4.258V20.33c0 .443-.157.867-.436 1.18-.279.313-.658.489-1.063.489a1.456 1.456 0 01-.708-.203l-5.132-3.134-5.112 3.14c-.615.36-1.361.194-1.829-.405l-.09-.126-.085-.155a1.913 1.913 0 01-.176-.786V6.434C3.658 3.5 5.404 2 8.243 2h5.46z",
  Gaming:
    "M7.625 2c.315-.015.642.306.645.69.003.309.234.558.515.558h.928c1.317 0 2.402 1.169 2.419 2.616v.24h2.604c2.911-.026 5.255 2.337 5.377 5.414.005.12.006.245.004.368v4.31c.062 3.108-2.21 5.704-5.064 5.773-.117.003-.228 0-.34-.005a199.325 199.325 0 01-7.516 0c-2.816.132-5.238-2.292-5.363-5.411a6.262 6.262 0 01-.004-.371V11.87c-.03-1.497.48-2.931 1.438-4.024.956-1.094 2.245-1.714 3.629-1.746a3.28 3.28 0 01.342.005l3.617-.001v-.231c-.008-.676-.522-1.23-1.147-1.23h-.93c-.973 0-1.774-.866-1.785-1.937-.003-.386.28-.701.631-.705z",
  Settings:
    "M12.616 2c.71 0 1.388.28 1.882.779.495.498.762 1.17.74 1.799l.009.147c.017.146.065.286.144.416.152.255.402.44.695.514.292.074.602.032.896-.137l.164-.082c1.23-.567 2.705-.117 3.387 1.043l.613 1.043c.017.027.03.056.043.085l.057.111a2.537 2.537 0 01-.884 3.204l-.257.159a1.102 1.102 0 00-.33.356 1.093 1.093 0 00-.117.847c.078.287.27.53.56.695l.166.105c.505.346.869.855 1.028 1.439.18.659.083 1.36-.272 1.957l-.66 1.077-.1.152c-.774 1.092-2.279 1.425-3.427.776l-.136-.069a1.19 1.19 0 00-.435-.1 1.128 1.128 0 00-1.143 1.154l-.008.171C15.12 20.971 13.985 22 12.616 22h-1.235c-1.449 0-2.623-1.15-2.622-2.525",
};

function ExploreIcon({ label }: { label: string }) {
  const path = EXPLORE_ICON_PATHS[label];
  if (!path) return null;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 22 24">
      <path fill="#666" d={path} />
    </svg>
  );
}

export default function LeftSidebar() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [going, setGoing] = useState<Record<string, boolean>>({});

  return (
    <div className="_layout_left_sidebar_wrap">
      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
          <ul className="_left_inner_area_explore_list">
            {explore.map((item) => (
              <li className={`_left_inner_area_explore_item${item.badge ? " _explore_item" : ""}`} key={item.id}>
                <a href={item.href} className="_left_inner_area_explore_link">
                  <ExploreIcon label={item.label} />
                  {item.label}
                </a>
                {item.badge && <span className="_left_inner_area_explore_link_txt">{item.badge}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_area_suggest_content _mar_b24">
            <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
            <span className="_left_inner_area_suggest_content_txt">
              <a className="_left_inner_area_suggest_content_txt_link" href="#0">
                See All
              </a>
            </span>
          </div>
          {suggestedPeople.map((person) => (
            <div className="_left_inner_area_suggest_info" key={person.id}>
              <div className="_left_inner_area_suggest_info_box">
                <div className="_left_inner_area_suggest_info_image">
                  <a href="#0">
                    <DesignImage src={person.image} alt="Image" className="_info_img" />
                  </a>
                </div>
                <div className="_left_inner_area_suggest_info_txt">
                  <a href="#0">
                    <h4 className="_left_inner_area_suggest_info_title">{person.name}</h4>
                  </a>
                  <p className="_left_inner_area_suggest_info_para">{person.title}</p>
                </div>
              </div>
              <div className="_left_inner_area_suggest_info_link">
                <a
                  href="#0"
                  className="_info_link"
                  onClick={(e) => {
                    e.preventDefault();
                    setConnected((c) => ({ ...c, [person.id]: !c[person.id] }));
                  }}
                >
                  {connected[person.id] ? "Connected" : "Connect"}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="_layout_left_sidebar_inner">
        <div className="_left_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_event_content">
            <h4 className="_left_inner_event_title _title5">Events</h4>
            <a href="#0" className="_left_inner_event_link">
              See all
            </a>
          </div>
          {events.map((ev) => (
            <a className="_left_inner_event_card_link" href="#0" key={ev.id}>
              <div className="_left_inner_event_card">
                <div className="_left_inner_event_card_iamge">
                  <DesignImage src={ev.image} alt="Image" className="_card_img" />
                </div>
                <div className="_left_inner_event_card_content">
                  <div className="_left_inner_card_date">
                    <p className="_left_inner_card_date_para">{ev.day}</p>
                    <p className="_left_inner_card_date_para1">{ev.month}</p>
                  </div>
                  <div className="_left_inner_card_txt">
                    <h4 className="_left_inner_event_card_title">{ev.title}</h4>
                  </div>
                </div>
                <hr className="_underline" />
                <div className="_left_inner_event_bottom">
                  <p className="_left_iner_event_bottom">{ev.going + (going[ev.id] ? 1 : 0)} People Going</p>
                  <button
                    type="button"
                    className="_left_iner_event_bottom_link"
                    style={{ background: "none", border: "none" }}
                    onClick={(e) => {
                      e.preventDefault();
                      setGoing((g) => ({ ...g, [ev.id]: !g[ev.id] }));
                    }}
                  >
                    {going[ev.id] ? "Going ✓" : "Going"}
                  </button>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
