import { useState, useRef, useEffect } from "react";
import DesignImage from './DesignImage';
import {
  SearchIcon,
  HomeIcon,
  FriendsIcon,
  BellIcon,
  ChatIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DotsIcon,
  SettingsIcon,
  HelpIcon,
  LogoutIcon,
} from "./icons";
import { designUser, notificationList, profileDropdownLinks } from "../data/feed";
import type { User } from '../types';

interface Props { user: User; onLogout: () => Promise<void> }
export default function Header({ user, onLogout }: Props) {
  const displayUser = user ? { name: `${user.firstName} ${user.lastName}`, avatar: designUser.avatar } : designUser;
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifTab, setNotifTab] = useState("all");
  const notifRef = useRef<HTMLLIElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside — mirrors typical Bootstrap dropdown UX
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
      <div className="container _custom_container">
        <div className="_logo_wrap">
          <a className="navbar-brand" href="#0">
            <DesignImage src="/assets/images/logo.svg" alt="Image" className="_nav_logo" />
          </a>
        </div>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="_header_form ms-auto">
            <form className="_header_form_grp" onSubmit={(e) => e.preventDefault()}>
              <SearchIcon className="_header_form_svg" />
              <input className="form-control me-2 _inpt1" type="search" placeholder="input search text" aria-label="Search" />
            </form>
          </div>

          <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
            <li className="nav-item _header_nav_item">
              <a className="nav-link _header_nav_link_active _header_nav_link" aria-current="page" href="#0">
                <HomeIcon />
              </a>
            </li>
            <li className="nav-item _header_nav_item">
              <a className="nav-link _header_nav_link" href="#0">
                <FriendsIcon />
              </a>
            </li>
            <li className="nav-item _header_nav_item" ref={notifRef}>
              <span
                className="nav-link _header_nav_link _header_notify_btn"
                onClick={() => setNotifOpen((v) => !v)}
                style={{ cursor: "pointer" }}
              >
                <BellIcon />
                <span className="_counting">{notificationList.length}</span>
                {notifOpen && (
                  <div className="_notification_dropdown" style={{ display: "block" }}>
                    <div className="_notifications_content">
                      <h4 className="_notifications_content_title">Notifications</h4>
                      <div className="_notification_box_right">
                        <button type="button" className="_notification_box_right_link">
                          <DotsIcon />
                        </button>
                        <div className="_notifications_drop_right">
                          <ul className="_notification_list">
                            <li className="_notification_item">
                              <span className="_notification_link">Mark as all read</span>
                            </li>
                            <li className="_notification_item">
                              <span className="_notification_link">Notifivations seetings</span>
                            </li>
                            <li className="_notification_item">
                              <span className="_notification_link">Open Notifications</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="_notifications_drop_box">
                      <div className="_notifications_drop_btn_grp">
                        <button
                          className="_notifications_btn_link"
                          type="button"
                          onClick={() => setNotifTab("all")}
                        >
                          All
                        </button>
                        <button
                          className="_notifications_btn_link1"
                          type="button"
                          onClick={() => setNotifTab("unread")}
                        >
                          Unread
                        </button>
                      </div>
                      <div className="_notifications_all">
                        {notificationList.map((n) => (
                          <div className="_notification_box" key={n.id}>
                            <div className="_notification_image">
                              <DesignImage src={n.image} alt="Image" className="_notify_img" />
                            </div>
                            <div className="_notification_txt">
                              <p className="_notification_para">
                                {n.type === "friendPost" ? (
                                  <>
                                    <span className="_notify_txt_link">{n.name}</span> posted a link in your timeline.
                                  </>
                                ) : (
                                  <>
                                    An admin changed the name of the group{" "}
                                    <span className="_notify_txt_link">{n.oldName}</span> to{" "}
                                    <span className="_notify_txt_link">{n.newName}</span>
                                  </>
                                )}
                              </p>
                              <div className="_nitification_time">
                                <span>{n.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </span>
            </li>
            <li className="nav-item _header_nav_item">
              <a className="nav-link _header_nav_link" href="#0">
                <ChatIcon /> <span className="_counting">2</span>
              </a>
            </li>
          </ul>

          <div className="_header_nav_profile" ref={profileRef}>
            <div className="_header_nav_profile_image">
              <DesignImage src={displayUser.avatar} alt="Image" className="_nav_profile_img" />
            </div>
            <div className="_header_nav_dropdown">
              <p className="_header_nav_para">{displayUser.name}</p>
              <button
                className="_header_nav_dropdown_btn _dropdown_toggle"
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
              >
                <ChevronDownIcon />
              </button>
            </div>
            {profileOpen && (
              <div className="_nav_profile_dropdown _profile_dropdown" style={{ display: "block" }}>
                <div className="_nav_profile_dropdown_info">
                  <div className="_nav_profile_dropdown_image">
                    <DesignImage src={displayUser.avatar} alt="Image" className="_nav_drop_img" />
                  </div>
                  <div className="_nav_profile_dropdown_info_txt">
                    <h4 className="_nav_dropdown_title">{displayUser.name}</h4>
                    <a href="#0" className="_nav_drop_profile">
                      View Profile
                    </a>
                  </div>
                </div>
                <hr />
                <ul className="_nav_dropdown_list">
                  {profileDropdownLinks.map((link) => (
                    <li className="_nav_dropdown_list_item" key={link.id}>
                      <a href={link.href} className="_nav_dropdown_link" onClick={(event)=>{if(link.label==='Log Out'){event.preventDefault();onLogout()}}}>
                        <div className="_nav_drop_info">
                          <span>
                            {link.label === "Settings" && <SettingsIcon />}
                            {link.label === "Help & Support" && <HelpIcon />}
                            {link.label === "Log Out" && <LogoutIcon />}
                          </span>
                          {link.label}
                        </div>
                        <button type="button" className="_nav_drop_btn_link">
                          <ChevronRightIcon />
                        </button>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button type="button" className="_header_logout_button" onClick={onLogout}>
            <LogoutIcon /> <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
