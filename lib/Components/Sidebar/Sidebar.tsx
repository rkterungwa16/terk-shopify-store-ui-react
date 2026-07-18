/* ============================================================
   Sidebar
   Owns all interaction state; children stay presentational and
   controlled entirely through props.
   ============================================================ */

import { Zap, MoreHorizontal, ArrowRight } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  JSX,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { NAV_ITEMS, BOTS } from "./constants";
import { SubItem, FlyoutItem } from "./MenuItem";
import { NavButton } from "./NavButton";
import { UseTooltipReturn } from "./types";

interface SidebarProps {
  tooltipApi: UseTooltipReturn;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
}

export function Sidebar({
  tooltipApi,
  expanded,
  setExpanded: setExpandedProp,
  isMobile,
}: SidebarProps): JSX.Element {
  const [submenuOpen, setSubmenuOpen] = useState<boolean>(false);
  const [flyoutOpen, setFlyoutOpen] = useState<boolean>(false);
  const [activeRoute, setActiveRoute] = useState<string>("insights");
  const [activeBot, setActiveBot] = useState<string>("gpt");

  const { show: showTooltip, hide: hideTooltip } = tooltipApi;

  const sidebarRef = useRef<HTMLElement | null>(null);
  const collapseToggleRef = useRef<HTMLButtonElement | null>(null);
  const botsToggleRef = useRef<HTMLButtonElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.classList.toggle("no-scroll", expanded && isMobile);
    return () => document.body.classList.remove("no-scroll");
  }, [expanded, isMobile]);

  const setExpanded = useCallback(
    (next: boolean) => {
      setExpandedProp(next);
      hideTooltip();
      if (next) {
        setFlyoutOpen(false);
        if (isMobile) {
          requestAnimationFrame(() => {
            sidebarRef.current
              ?.querySelector<HTMLElement>("button, [href]")
              ?.focus();
          });
        }
      } else {
        setSubmenuOpen(false);
      }
    },
    [isMobile, hideTooltip, setExpandedProp],
  );

  const handleCollapseToggle = (): void => {
    const wasExpanded = expanded;
    setExpanded(!wasExpanded);
    if (wasExpanded) collapseToggleRef.current?.focus();
  };

  const handleBotsToggleClick = (): void => {
    if (expanded) {
      setSubmenuOpen((open) => !open);
      return;
    }
    setFlyoutOpen((open) => {
      const next = !open;
      hideTooltip();
      if (next) {
        requestAnimationFrame(() =>
          flyoutRef.current
            ?.querySelector<HTMLButtonElement>("button")
            ?.focus(),
        );
      }
      return next;
    });
  };

  const closeFlyout = useCallback(() => setFlyoutOpen(false), []);

  // Close the flyout on any click outside the sidebar
  useEffect(() => {
    function onDocClick(e: MouseEvent): void {
      if (!sidebarRef.current?.contains(e.target as Node)) closeFlyout();
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [closeFlyout]);

  // Escape closes whichever layer is currently open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key !== "Escape") return;
      if (flyoutOpen) {
        setFlyoutOpen(false);
        botsToggleRef.current?.focus();
        return;
      }
      if (isMobile && expanded) {
        setExpanded(false);
        collapseToggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [flyoutOpen, isMobile, expanded, setExpanded]);

  // Simple focus trap while the mobile drawer is open
  useEffect(() => {
    const node = sidebarRef.current;
    if (!node) return undefined;
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key !== "Tab" || !isMobile || !expanded) return;
      const focusables = Array.from(
        node!.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    node.addEventListener("keydown", onKeyDown);
    return () => node.removeEventListener("keydown", onKeyDown);
  }, [isMobile, expanded]);

  const handleNavClick = (id: string): void => {
    setActiveRoute(id);
    if (isMobile && id !== "bots") setExpanded(false);
  };

  const handleBotSelect = (id: string, fromFlyout: boolean): void => {
    setActiveBot(id);
    if (fromFlyout) {
      setFlyoutOpen(false);
      botsToggleRef.current?.focus();
    } else if (isMobile) {
      setExpanded(false);
    }
  };

  const tooltipHandlers = (label: string) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (expanded || flyoutOpen) return;
      showTooltip(e.currentTarget, label);
    },
    onMouseLeave: hideTooltip,
    onFocus: (e: React.FocusEvent<HTMLButtonElement>) => {
      if (expanded) return;
      showTooltip(e.currentTarget, label);
    },
    onBlur: hideTooltip,
  });

  return (
    <aside
      className={`sidebar${expanded ? " expanded" : ""}`}
      id="sidebar"
      ref={sidebarRef as React.RefObject<HTMLElement>}
      aria-label="Sidebar navigation"
    >
      <div className="brand-row">
        <div className="brand" aria-hidden="true">
          <Zap size={20} color="#fff" fill="#fff" />
        </div>
        <button className="more-btn" aria-label="More options">
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>
      </div>

      <nav id="nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isBots = item.id === "bots";
          const handlers = tooltipHandlers(item.label);
          return (
            <div key={item.id}>
              <NavButton
                item={item}
                isActive={activeRoute === item.id}
                isCollapsedTrigger={isBots ? flyoutOpen : false}
                submenuOpen={isBots ? submenuOpen : false}
                buttonRef={
                  isBots
                    ? (botsToggleRef as React.RefObject<HTMLButtonElement>)
                    : undefined
                }
                onClick={() =>
                  isBots ? handleBotsToggleClick() : handleNavClick(item.id)
                }
                {...handlers}
              />
              {isBots && (
                <div
                  className="submenu"
                  id="botsSubmenu"
                  role="group"
                  aria-label="Chat bots"
                  aria-hidden={!submenuOpen}
                >
                  <div className="submenu-inner">
                    {BOTS.map((bot) => (
                      <SubItem
                        key={bot.id}
                        bot={bot}
                        isActive={activeBot === bot.id}
                        tabIndex={submenuOpen ? 0 : -1}
                        onClick={() => handleBotSelect(bot.id, false)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button
        type="button"
        className="footer-toggle"
        id="collapseToggle"
        ref={collapseToggleRef}
        data-tooltip={expanded ? "Collapse sidebar" : "Expand sidebar"}
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={expanded}
        aria-controls="sidebar"
        onClick={handleCollapseToggle}
        {...tooltipHandlers(expanded ? "Collapse sidebar" : "Expand sidebar")}
      >
        <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
      </button>

      <div
        className={`flyout${flyoutOpen ? " open" : ""}`}
        id="botsFlyout"
        ref={flyoutRef}
        role="group"
        aria-label="Chat bot options"
        aria-hidden={!flyoutOpen}
        style={{ top: 110 }}
      >
        {BOTS.map((bot) => (
          <FlyoutItem
            key={bot.id}
            bot={bot}
            isActive={activeBot === bot.id}
            tabIndex={flyoutOpen ? 0 : -1}
            onClick={() => handleBotSelect(bot.id, true)}
          />
        ))}
      </div>
    </aside>
  );
}
