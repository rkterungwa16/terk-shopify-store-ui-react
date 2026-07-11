"use client";

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
import { useHeaderHeightVar } from "./hooks/useHeaderHeightVar";
import { HeaderActions } from "./HeaderActions/HActions";
import { HeaderDrawer } from "./HeaderDrawerComponent/HDrawer";
import { useStickyScroll } from "./hooks/useStickyScroll";
import { MobileNavBar } from "./MobileNavBar/MobileNavBar";
import { MegaMenu } from "./MegaMenu/MegaMenu";
import { StickyMode } from "./types";

import "./header.css";

export interface HeaderProps {
  /**
   * Sticky behavior mode.
   * - `"scroll-up"` — hides on scroll-down, reveals on scroll-up (default)
   * - `"always"` / `"none"` — reserved for parity with the vanilla build;
   *   no dedicated CSS state ships for these yet.
   */
  sticky?: StickyMode;
}

export default function HeaderContainer({ sticky = "scroll-up" }: HeaderProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const { scrollDirection, stickyActive } = useStickyScroll(
    sticky === "scroll-up",
  );
  useHeaderHeightVar(headerRef as MutableRefObject<HTMLElement | null>);

  return (
    <>
      <header
        ref={headerRef}
        className="header-component"
        data-sticky={sticky}
        data-scroll-direction={scrollDirection}
        data-sticky-state={stickyActive ? "active" : "inactive"}
      >
        <div className="header__row">
          <button
            className="header__drawer-toggle"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="header__logo">Foundry &amp; Field</div>

          <div className="header__desktop-nav">
            <MegaMenu headerRef={headerRef} />
          </div>

          <HeaderActions />
        </div>

        <MobileNavBar />
      </header>

      <HeaderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
