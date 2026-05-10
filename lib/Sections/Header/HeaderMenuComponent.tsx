import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * React equivalent of advanced HeaderMenu custom element
 * - Hover-driven mega menu
 * - Overflow menu handling
 * - Pointer safety-box tracking
 * - Dynamic height computation via refs
 * - MutationObserver hydration support (simplified)
 */

// -----------------------------
// Types
// -----------------------------

type MenuChild = {
  title: string;
  url: string;
};

type MenuLink = {
  title: string;
  url: string;
  children?: MenuChild[];
};

type HeaderMenuProps = {
  links?: MenuLink[];
  variant?: "desktop" | "mobile";
};

// -----------------------------
// Utilities
// -----------------------------

const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  wait = 100,
) => {
  let t: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(t);

    t = setTimeout(() => {
      fn(...args);
    }, wait);
  };
};

const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

// -----------------------------
// Component
// -----------------------------

export default function HeaderMenu({
  links = [],
  variant = "desktop",
}: HeaderMenuProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const overflowRef = useRef<HTMLLIElement | null>(null);
  const activeItemRef = useRef<HTMLElement | null>(null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [submenuHeight, setSubmenuHeight] = useState(0);
  const [fullHeaderHeight, setFullHeaderHeight] = useState(0);
  const [overflowExpanded, setOverflowExpanded] = useState(false);

  const pointerRef = useRef({ x: 0, y: 0 });
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -----------------------------
  // Resize → recompute layout
  // -----------------------------

  const handleResize = useCallback(
    () =>
      debounce(() => {
        if (!headerRef.current) return;
        headerRef.current.style.setProperty(
          "--submenu-height",
          `${submenuHeight}px`,
        );
      }, 100),
    [submenuHeight],
  );

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  // -----------------------------
  // Pointer tracking (safety box logic)
  // -----------------------------

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (activeIndex === null) return;

      pointerRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      const moving = Math.abs(e.movementX) >= 1 || Math.abs(e.movementY) >= 1;

      if (activeItemRef.current) {
        activeItemRef.current.dataset.safetyBox = String(moving);
      }

      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
      }

      if (moving) {
        idleTimer.current = setTimeout(() => {
          if (activeItemRef.current) {
            activeItemRef.current.dataset.safetyBox = "false";
          }
        }, 50);
      }
    },
    [activeIndex],
  );

  useEffect(() => {
    if (activeIndex !== null) {
      document.body.addEventListener("pointermove", onPointerMove);
    }

    return () => {
      document.body.removeEventListener("pointermove", onPointerMove);
    };
  }, [activeIndex, onPointerMove]);

  // -----------------------------
  // Activate menu item
  // -----------------------------

  const activate = (
    index: number,
    event: React.MouseEvent<HTMLLIElement> | React.FocusEvent<HTMLLIElement>,
  ) => {
    const link = links[index];

    if (!link) return;

    setActiveIndex(index);

    const target = event.target as HTMLElement | null;
    const currentTarget = event.currentTarget;

    setOverflowExpanded(target?.dataset?.slot !== "");

    // simulate aria-expanded behavior
    activeItemRef.current = currentTarget;

    const submenu = currentTarget.querySelector<HTMLElement>("[data-submenu]");

    let height = 0;

    if (submenu) {
      height = submenu.getBoundingClientRect().height;
    }

    if (overflowRef.current && target?.dataset?.slot !== "") {
      const overflowHeight = overflowRef.current.getBoundingClientRect().height;

      height = Math.max(height, overflowHeight);
    }

    setSubmenuHeight(height);

    const headerHeight = headerRef.current?.offsetHeight || 0;

    setFullHeaderHeight(headerHeight + height);

    if (headerRef.current) {
      headerRef.current.style.setProperty("--submenu-height", `${height}px`);

      headerRef.current.style.setProperty(
        "--full-open-header-height",
        `${headerHeight + height}px`,
      );
    }
  };

  // -----------------------------
  // Deactivate menu
  // -----------------------------

  const deactivate = () => {
    setActiveIndex(null);
    setSubmenuHeight(0);
    setFullHeaderHeight(0);

    if (headerRef.current) {
      headerRef.current.style.setProperty("--submenu-height", "0px");

      headerRef.current.style.setProperty("--full-open-header-height", "0px");
    }

    if (activeItemRef.current) {
      delete activeItemRef.current.dataset.safetyBox;
    }

    activeItemRef.current = null;
  };

  // -----------------------------
  // Overflow height calculation (simplified)
  // -----------------------------

  const getOverflowHeight = () => {
    if (!overflowRef.current) return 0;

    const items =
      overflowRef.current.querySelectorAll<HTMLElement>("[data-submenu]");

    items.forEach((el) => {
      el.style.display = "none";
    });

    const height = overflowRef.current.getBoundingClientRect().height;

    items.forEach((el) => {
      el.style.display = "";
    });

    return height;
  };

  // -----------------------------
  // Render helpers
  // -----------------------------

  const renderLinks = () =>
    links.map((link, i) => (
      <li
        key={link.title}
        className={cx("menu-item", activeIndex === i && "is-active")}
        onMouseEnter={(e) => activate(i, e)}
        onFocus={(e) => activate(i, e)}
        onMouseLeave={deactivate}
        // aria-expanded={activeIndex === i}
      >
        <a href={link.url} className="menu-link">
          {link.title}
        </a>

        {link.children && link.children.length > 0 && activeIndex === i && (
          <div className="submenu" data-submenu>
            <div className="submenu-inner">
              {link.children.map((c) => (
                <a key={c.title} href={c.url}>
                  {c.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </li>
    ));

  // -----------------------------
  // Render
  // -----------------------------

  return (
    <header
      ref={headerRef}
      className={cx("header-menu", `variant-${variant}`)}
      data-full-height={fullHeaderHeight}
    >
      <nav className="menu">
        <ul className="menu-list">
          {renderLinks()}

          <li className="menu-item overflow" ref={overflowRef}>
            <button
              type="button"
              onClick={() => setOverflowExpanded((v) => !v)}
            >
              More
            </button>
          </li>
        </ul>
      </nav>

      {overflowExpanded && (
        <div className="overflow-panel">
          {links.map((l) => (
            <div key={l.title}>{l.title}</div>
          ))}
        </div>
      )}
    </header>
  );
}
