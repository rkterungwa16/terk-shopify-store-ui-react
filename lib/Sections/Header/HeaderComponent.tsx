import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type StickyMode = "always" | "scroll-up" | "none";

interface HeaderComponentProps {
  sticky?: StickyMode;
  transparent?: boolean;
  themeColor?: string;

  children?: React.ReactNode;

  className?: string;

  /**
   * Triggered when menu overflow changes
   */
  onOverflowMinimum?: (minimumReached: boolean) => void;
}

type StickyState = "inactive" | "active" | "idle";
type ScrollDirection = "up" | "down" | "none";

/**
 * Stub utilities
 * Replace with your actual implementations
 */
const changeMetaThemeColor = (color: string) => {
  const meta = document.querySelector('meta[name="theme-color"]');

  if (meta) {
    meta.setAttribute("content", color);
  }
};

const setHeaderMenuStyle = () => {
  // Your implementation
};

/**
 * React implementation of Shopify HeaderComponent custom element
 */
export function HeaderComponent({
  sticky = "none",
  transparent = false,
  themeColor,
  children,
  className,
}: HeaderComponentProps) {
  const headerRef = useRef<HTMLElement | null>(null);

  /**
   * Internal refs matching original private fields
   */
  const menuDrawerHiddenWidthRef = useRef<number | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const offscreenRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const scrollRafIdRef = useRef<number | null>(null);

  /**
   * Visual states formerly handled through dataset
   */
  const [stickyState, setStickyState] = useState<StickyState>("inactive");

  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection>("none");

  /**
   * Update menu visibility
   */
  const updateMenuVisibility = useCallback((hideMenu: boolean) => {
    if (hideMenu) {
      menuDrawerHiddenWidthRef.current = window.innerWidth;
    } else {
      menuDrawerHiddenWidthRef.current = null;
    }

    setHeaderMenuStyle();
  }, []);

  /**
   * Observe sticky positioning
   */
  const observeStickyPosition = useCallback(
    (alwaysSticky = true) => {
      if (!headerRef.current || intersectionObserverRef.current) {
        return;
      }

      const config: IntersectionObserverInit = {
        threshold: alwaysSticky ? 1 : 0,
      };

      intersectionObserverRef.current = new IntersectionObserver(([entry]) => {
        if (!entry) return;

        const { isIntersecting } = entry;

        if (alwaysSticky) {
          setStickyState(isIntersecting ? "inactive" : "active");

          if (themeColor) {
            changeMetaThemeColor(themeColor);
          }
        } else {
          offscreenRef.current = !isIntersecting || stickyState === "active";
        }
      }, config);

      intersectionObserverRef.current.observe(headerRef.current);
    },
    [stickyState, themeColor],
  );

  /**
   * Scroll state updates
   */
  const updateScrollState = useCallback(() => {
    if (!headerRef.current) return;

    if (!offscreenRef.current && sticky !== "always") {
      return;
    }

    const scrollTop = document.scrollingElement?.scrollTop ?? 0;

    const headerTop = headerRef.current.getBoundingClientRect().top;

    const isScrollingUp = scrollTop < lastScrollTopRef.current;

    const isAtTop = headerTop >= 0;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    /**
     * ALWAYS STICKY
     */
    if (sticky === "always") {
      if (isAtTop) {
        setScrollDirection("none");
      } else if (isScrollingUp) {
        setScrollDirection("up");
      } else {
        setScrollDirection("down");
      }

      lastScrollTopRef.current = scrollTop;
      return;
    }

    /**
     * SCROLL-UP STICKY
     */
    if (isScrollingUp) {
      if (isAtTop) {
        offscreenRef.current = false;

        setStickyState("inactive");
        setScrollDirection("none");
      } else {
        setStickyState("active");
        setScrollDirection("up");
      }
    } else if (stickyState === "active") {
      setScrollDirection("none");
      setStickyState("idle");
    } else {
      setScrollDirection("none");
      setStickyState("idle");
    }

    lastScrollTopRef.current = scrollTop;
  }, [sticky, stickyState]);

  /**
   * RAF throttled scroll handler
   */
  const handleWindowScroll = useCallback(() => {
    if (scrollRafIdRef.current !== null) {
      return;
    }

    scrollRafIdRef.current = requestAnimationFrame(() => {
      scrollRafIdRef.current = null;

      updateScrollState();
    });
  }, [updateScrollState]);

  /**
   * Header height observer
   */
  useLayoutEffect(() => {
    if (!headerRef.current) return;

    resizeObserverRef.current = new ResizeObserver(([entry]) => {
      if (!entry || !entry.borderBoxSize?.[0]) {
        return;
      }

      const roundedHeaderHeight = Math.round(entry.borderBoxSize[0].blockSize);

      document.body.style.setProperty(
        "--header-height",
        `${roundedHeaderHeight}px`,
      );

      /**
       * Re-enable full menu if viewport expands
       */
      if (
        menuDrawerHiddenWidthRef.current &&
        window.innerWidth > menuDrawerHiddenWidthRef.current
      ) {
        updateMenuVisibility(false);
      }
    });

    resizeObserverRef.current.observe(headerRef.current);

    return () => {
      resizeObserverRef.current?.disconnect();

      document.body.style.setProperty("--header-height", "0px");
    };
  }, [updateMenuVisibility]);

  /**
   * Sticky observers + scroll listeners
   */
  useEffect(() => {
    if (sticky === "none") return;

    observeStickyPosition(sticky === "always");

    if (sticky === "scroll-up" || sticky === "always") {
      document.addEventListener("scroll", handleWindowScroll, {
        passive: true,
      });
    }

    return () => {
      intersectionObserverRef.current?.disconnect();

      document.removeEventListener("scroll", handleWindowScroll);

      if (scrollRafIdRef.current !== null) {
        cancelAnimationFrame(scrollRafIdRef.current);

        scrollRafIdRef.current = null;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [sticky, observeStickyPosition, handleWindowScroll]);

  /**
   * Mirror dataset API from custom element
   */
  const dataAttributes = {
    "data-sticky-state": stickyState,
    "data-scroll-direction": scrollDirection,
    ...(themeColor && {
      "data-theme-color": themeColor,
    }),
    ...(transparent && {
      "data-transparent": "true",
    }),
  };

  return (
    <header ref={headerRef} className={className} {...dataAttributes}>
      {children}
    </header>
  );
}

/**
 * Optional helper hook for overflowMinimum behavior
 */
export function useHeaderOverflow(
  onChange?: (minimumReached: boolean) => void,
) {
  return useCallback(
    (minimumReached: boolean) => {
      onChange?.(minimumReached);
    },
    [onChange],
  );
}
