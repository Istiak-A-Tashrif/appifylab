import { desktopStories, mobileStories } from "../data/feed";
import DesignImage from './DesignImage';
import { PlusIcon } from "./icons";

export default function Stories() {
  return (
    <>
      {/* For Desktop */}
      <div className="_feed_inner_ppl_card _mar_b16">
        <div className="_feed_inner_story_arrow">
          <button type="button" className="_feed_inner_story_arrow_btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
              <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
            </svg>
          </button>
        </div>
        <div className="row">
          {desktopStories.map((s) => (
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col" key={s.id}>
              {s.isSelf ? (
                <div className="_feed_inner_profile_story _b_radious6">
                  <div className="_feed_inner_profile_story_image">
                    <DesignImage src={s.image} alt="Image" className="_profile_story_img" loading="eager" />
                    <div className="_feed_inner_story_txt">
                      <div className="_feed_inner_story_btn">
                        <button className="_feed_inner_story_btn_link">
                          <PlusIcon />
                        </button>
                      </div>
                      <p className="_feed_inner_story_para">{s.name}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="_feed_inner_public_story _b_radious6">
                  <div className="_feed_inner_public_story_image">
                    <DesignImage src={s.image} alt="Image" className="_public_story_img" loading="eager" />
                    <div className="_feed_inner_pulic_story_txt">
                      <p className="_feed_inner_pulic_story_para">{s.name}</p>
                    </div>
                    {s.mini && <div className="_feed_inner_public_mini">
                      <DesignImage src={s.mini} alt="Image" className="_public_mini_img" />
                    </div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* For Mobile */}
      <div className="_feed_inner_ppl_card_mobile _mar_b16">
        <div className="_feed_inner_ppl_card_area">
          <ul className="_feed_inner_ppl_card_area_list">
            {mobileStories.map((s) => (
              <li className="_feed_inner_ppl_card_area_item" key={s.id}>
                <a href="#0" className="_feed_inner_ppl_card_area_link">
                  {s.state === "self" && (
                    <div className="_feed_inner_ppl_card_area_story">
                      <DesignImage src={s.image} alt="Image" className="_card_story_img" />
                      <div className="_feed_inner_ppl_btn">
                        <button className="_feed_inner_ppl_btn_link" type="button">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
                            <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M6 2.5v7M2.5 6h7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  {s.state === "active" && (
                    <div className="_feed_inner_ppl_card_area_story_active">
                      <DesignImage src={s.image} alt="Image" className="_card_story_img1" />
                    </div>
                  )}
                  {s.state === "inactive" && (
                    <div className="_feed_inner_ppl_card_area_story_inactive">
                      <DesignImage src={s.image} alt="Image" className="_card_story_img1" />
                    </div>
                  )}
                  <p className="_feed_inner_ppl_card_area_link_txt">{s.name}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
