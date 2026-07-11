import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MutableRefObject,
  type RefObject,
} from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { MENU } from "../data";

/* ============================================================
   MOBILE DRAWER
   ============================================================ */
interface HeaderDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function HeaderDrawer({ open, onClose }: HeaderDrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const onKeyUp = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keyup", onKeyUp);
    document.documentElement.setAttribute("scroll-lock", "");
    return () => {
      document.removeEventListener("keyup", onKeyUp);
      document.documentElement.removeAttribute("scroll-lock");
    };
  }, [open, onClose]);

  return (
    <>
      <div className="drawer-overlay" data-open={open} onClick={onClose} />
      <div className={`menu-drawer${open ? " menu-open" : ""}`} ref={panelRef}>
        <div className="menu-drawer__header">
          <span className="header__logo">Foundry &amp; Field</span>
          <button
            className="menu-drawer__close"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <ul className="menu-drawer__list">
          {MENU.map((link) =>
            link.links ? (
              <li key={link.title} className="menu-drawer__list-item">
                <details className="menu-drawer__disclosure">
                  <summary>
                    <span>{link.title}</span>
                    <span className="caret">▾</span>
                  </summary>
                  <div className="menu-drawer__submenu">
                    {link.links.map((column) => (
                      <div key={column.heading}>
                        <p className="mega-menu__column-title">
                          {column.heading}
                        </p>
                        {column.items.map((item) => (
                          <a
                            key={item.title}
                            className="mega-menu__link"
                            href={item.url}
                          >
                            {item.title}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </details>
              </li>
            ) : (
              <li key={link.title} className="menu-drawer__list-item">
                <a className="menu-drawer__link" href={link.url}>
                  {link.title}
                </a>
              </li>
            ),
          )}
        </ul>
      </div>
    </>
  );
}
