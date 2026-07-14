import { ThemeMoonIcon, ThemeSunIcon } from "./icons";

export default function ThemeSwitch({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <div className="_layout_mode_swithing_btn">
      <button type="button" className="_layout_swithing_btn_link" onClick={onToggle}>
        <div className="_layout_swithing_btn">
          <div
            className="_layout_swithing_btn_round"
            style={{ transform: dark ? "translateX(100%)" : "translateX(0)" }}
          />
        </div>
        <div className="_layout_change_btn_ic1">
          <ThemeMoonIcon />
        </div>
        <div className="_layout_change_btn_ic2">
          <ThemeSunIcon />
        </div>
      </button>
    </div>
  );
}
