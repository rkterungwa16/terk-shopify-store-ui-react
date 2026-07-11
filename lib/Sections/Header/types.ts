import {
  type CSSProperties,
  type FocusEvent,
  type MutableRefObject,
  type RefObject,
} from "react";

export interface MenuItem {
  title: string;
  url: string;
}

export interface MenuColumn {
  heading: string;
  items: MenuItem[];
}

export interface MenuLink {
  title: string;
  url: string;
  links?: MenuColumn[];
}

export type Menu = MenuLink[];

/* ============================================================
   SHARED TYPES
   ============================================================ */

/** Scroll direction as tracked by `useStickyScroll`. */
export type ScrollDirection = "none" | "up" | "down";

/** Sticky behavior mode, mirroring the vanilla build's `sticky` attribute. */
export type StickyMode = "scroll-up" | "always" | "none";

/** Identifies which mega-menu trigger is active: a MENU index, the synthesized "more" item, or none. */
export type ActiveMenuKey = number | "more" | null;

/** Shape of the `cart:update` custom event's `detail` payload. */
export interface CartUpdateDetail {
  item_count: number;
}

/** Narrowed CustomEvent type for the `cart:update` DOM event. */
export type CartUpdateEvent = CustomEvent<CartUpdateDetail>;

/** CSS custom properties aren't part of React's CSSProperties type by default. */
export interface CSSPropertiesWithVars extends CSSProperties {
  [key: `--${string}`]: string | number | undefined;
}

export interface StickyScrollState {
  scrollDirection: ScrollDirection;
  stickyActive: boolean;
}
