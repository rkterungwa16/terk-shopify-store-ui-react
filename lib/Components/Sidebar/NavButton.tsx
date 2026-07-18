import { ChevronDown } from "lucide-react";
import { JSX } from "react";
import { NavItemData } from "./types";

interface NavButtonProps {
  item: NavItemData;
  isActive: boolean;
  isCollapsedTrigger: boolean;
  submenuOpen: boolean;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave: () => void;
  onFocus: (e: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

export function NavButton({
  item,
  isActive,
  isCollapsedTrigger,
  submenuOpen,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  buttonRef,
}: NavButtonProps): JSX.Element {
  const Icon = item.icon;
  const isBots = item.id === "bots";

  return (
    <>
      {item.dividerBefore && <div className="divider" role="separator" />}
      <button
        type="button"
        ref={buttonRef}
        className={`nav-item${isActive ? " active" : ""}${submenuOpen ? " submenu-open" : ""}`}
        data-tooltip={item.label}
        aria-label={item.label}
        aria-current={isActive && !isBots ? "page" : undefined}
        aria-haspopup={isBots ? "true" : undefined}
        aria-expanded={isBots ? submenuOpen || isCollapsedTrigger : undefined}
        aria-controls={isBots ? "botsSubmenu botsFlyout" : undefined}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <span className="icon" aria-hidden="true">
          <Icon size={20} strokeWidth={1.8} />
        </span>
        <span className="label">{item.label}</span>
        {isBots && (
          <span className="chevron" aria-hidden="true">
            <ChevronDown size={14} strokeWidth={2} />
          </span>
        )}
      </button>
    </>
  );
}
