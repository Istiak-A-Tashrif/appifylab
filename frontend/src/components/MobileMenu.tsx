import { LogoutIcon, SearchIcon } from "./icons";
import DesignImage from './DesignImage';

export default function MobileMenu({ onLogout }: { onLogout: () => Promise<void> }) {
  return (
    <div className="_header_mobile_menu">
      <div className="_header_mobile_menu_wrap">
        <div className="container">
          <div className="_header_mobile_menu">
            <div className="row">
              <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                <div className="_header_mobile_menu_top_inner">
                  <div className="_header_mobile_menu_logo">
                    <a href="#0" className="_mobile_logo_link">
                      <DesignImage src="/assets/images/logo.svg" alt="Image" className="_nav_logo" />
                    </a>
                  </div>
                  <div className="_header_mobile_menu_right">
                    <form className="_header_form_grp" onSubmit={(e) => e.preventDefault()}>
                      <a href="#0" className="_header_mobile_search">
                        <SearchIcon />
                      </a>
                    </form>
                    <button type="button" className="_header_logout_button" onClick={onLogout} aria-label="Logout"><LogoutIcon /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
