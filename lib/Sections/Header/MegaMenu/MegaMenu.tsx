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
import { MENU } from "../data";
import { ActiveMenuKey, CSSPropertiesWithVars, Menu } from "../types";

/* ============================================================
   MEGA MENU (desktop)
   ============================================================ */
interface MegaMenuProps {
  headerRef: RefObject<HTMLElement | null>;
}

export function MegaMenu({ headerRef }: MegaMenuProps) {
  const [activeIndex, setActiveIndex] = useState<ActiveMenuKey>(null);
  const [overflowCount, setOverflowCount] = useState<number>(0);
  const listRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const submenuRefs = useRef<Array<HTMLDivElement | null>>([]);
  const deactivateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visibleCount = MENU.length - overflowCount;

  /* --- Recompute overflow whenever the row is resized --- */
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const recompute = (): void => {
      const items = itemRefs.current.filter(
        (item): item is HTMLLIElement => item !== null,
      );
      if (!items.length) return;

      // Measure every item at full visibility first.
      items.forEach((item) => {
        item.style.visibility = "hidden";
        item.style.position = "static";
        item.hidden = false;
      });
      const widths = items.map((item) => item.getBoundingClientRect().width);
      items.forEach((item) => (item.style.visibility = ""));

      const available = list.getBoundingClientRect().width;
      const moreWidth = 90; // reserved width for the "More" trigger
      let used = 0;
      let firstOverflowIndex = items.length;

      for (let i = 0; i < items.length; i++) {
        used += widths[i];
        const needsReserve = i < items.length - 1;
        if (used > available - (needsReserve ? moreWidth : 0)) {
          firstOverflowIndex = i;
          break;
        }
      }

      setOverflowCount(items.length - firstOverflowIndex);
    };

    recompute();
    const observer = new ResizeObserver(() => recompute());
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  /* --- Push --submenu-height / --full-open-header-height onto the header --- */
  const applySubmenuVars = useCallback(
    (index: ActiveMenuKey): void => {
      const header = headerRef.current;
      if (!header) return;
      const submenu =
        typeof index === "number" ? submenuRefs.current[index] : null;
      const height = submenu ? submenu.scrollHeight : 0;
      header.style.setProperty("--submenu-height", `${height}px`);
      header.style.setProperty(
        "--full-open-header-height",
        `${height + header.offsetHeight}px`,
      );
    },
    [headerRef],
  );

  const activate = useCallback(
    (index: ActiveMenuKey): void => {
      if (deactivateTimer.current) {
        clearTimeout(deactivateTimer.current);
        deactivateTimer.current = null;
      }
      setActiveIndex(index);
      applySubmenuVars(index);
    },
    [applySubmenuVars],
  );

  const scheduleDeactivate = useCallback(
    (index: ActiveMenuKey): void => {
      deactivateTimer.current = setTimeout(() => {
        setActiveIndex((current) => {
          if (current !== index) return current;
          applySubmenuVars(null);
          return null;
        });
      }, 60);
    },
    [applySubmenuVars],
  );

  useEffect(
    () => () => {
      if (deactivateTimer.current) clearTimeout(deactivateTimer.current);
    },
    [],
  );

  const overflowItems: Menu = overflowCount > 0 ? MENU.slice(visibleCount) : [];

  return (
    <nav className="menu-list" aria-label="Main navigation">
      <ul className="menu-list__list" ref={listRef}>
        {MENU.map((link, index) => {
          const hidden = index >= visibleCount;
          return (
            <li
              key={link.title}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="menu-list__list-item"
              hidden={hidden}
              onPointerEnter={() => activate(index)}
              onPointerLeave={() => scheduleDeactivate(index)}
            >
              <a
                href={link.url}
                className="menu-list__link"
                aria-haspopup={link.links ? "true" : undefined}
                aria-expanded={link.links ? activeIndex === index : undefined}
                onFocus={() => activate(index)}
                onBlur={(event: FocusEvent<HTMLAnchorElement>) => {
                  const parent = event.currentTarget.parentElement;
                  if (!parent?.contains(event.relatedTarget as Node | null)) {
                    scheduleDeactivate(index);
                  }
                }}
              >
                {link.title}
              </a>

              {link.links && (
                <div
                  className="menu-list__submenu"
                  ref={(el) => {
                    submenuRefs.current[index] = el;
                  }}
                  style={
                    {
                      "--submenu-opacity": activeIndex === index ? 1 : 0,
                    } as CSSPropertiesWithVars
                  }
                >
                  <div className="menu-list__submenu-inner">
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
                </div>
              )}
            </li>
          );
        })}

        {overflowItems.length > 0 && (
          <li
            className="menu-list__list-item"
            data-overflow-item="true"
            onPointerEnter={() => activate("more")}
            onPointerLeave={() => scheduleDeactivate("more")}
          >
            <button
              type="button"
              className="menu-list__link button-unstyled"
              aria-haspopup="true"
              aria-expanded={activeIndex === "more"}
              onFocus={() => activate("more")}
            >
              More
            </button>
            <div
              className="menu-list__submenu"
              style={
                {
                  "--submenu-opacity": activeIndex === "more" ? 1 : 0,
                } as CSSPropertiesWithVars
              }
            >
              <div className="menu-list__submenu-inner menu-list__submenu-inner--flat">
                {overflowItems.map((link) => (
                  <a
                    key={link.title}
                    className="mega-menu__link"
                    href={link.url}
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          </li>
        )}
      </ul>
    </nav>
  );
}
