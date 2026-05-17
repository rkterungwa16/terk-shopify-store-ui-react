import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -----------------------------------------------------------------------------------------------*/

/**
 * Wait for animation or transition completion on an element.
 */
function onAnimationEnd(
  element: Element | null,
  callback: () => void,
  options?: { subtree?: boolean },
) {
  if (!element) {
    callback();
    return;
  }

  const subtree = options?.subtree ?? true;

  let resolved = false;

  const done = () => {
    if (resolved) return;

    resolved = true;

    element.removeEventListener("animationend", handleEnd);
    element.removeEventListener("transitionend", handleEnd);

    callback();
  };

  const handleEnd = (event: Event) => {
    if (!subtree && event.target !== element) return;
    done();
  };

  element.addEventListener("animationend", handleEnd);
  element.addEventListener("transitionend", handleEnd);

  /**
   * Fallback in case no animation/transition exists.
   */
  requestAnimationFrame(() => {
    const computed = window.getComputedStyle(element as HTMLElement);

    const animationDuration = parseFloat(computed.animationDuration || "0");
    const transitionDuration = parseFloat(computed.transitionDuration || "0");

    if (animationDuration === 0 && transitionDuration === 0) {
      done();
    }
  });
}

/**
 * Removes will-change after animation completes.
 */
function removeWillChangeOnAnimationEnd(event: AnimationEvent) {
  const target = event.currentTarget;

  if (target instanceof HTMLElement) {
    target.style.removeProperty("will-change");
  }
}

/**
 * Basic focus trap implementation.
 */
let previousFocusedElement: HTMLElement | null = null;

function trapFocus(container: HTMLElement) {
  previousFocusedElement = document.activeElement as HTMLElement;

  const focusable = getFocusableElements(container);

  if (focusable.length > 0) {
    focusable[0].focus();
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements(container);

    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  container.dataset.focusTrap = "true";

  container.addEventListener("keydown", handleKeydown);

  (container as any).__focusTrapCleanup = () => {
    container.removeEventListener("keydown", handleKeydown);
  };
}

function removeTrapFocus() {
  const trapped = document.querySelector<HTMLElement>(
    '[data-focus-trap="true"]',
  );

  if (trapped) {
    trapped.removeAttribute("data-focus-trap");

    const cleanup = (trapped as HTMLElement).__focusTrapCleanup;

    if (cleanup) cleanup();
  }

  previousFocusedElement?.focus?.();
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        "a[href]",
        "button:not([disabled])",
        "textarea:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(","),
    ),
  ).filter((el) => !el.hasAttribute("disabled"));
}

function resetDetails(element: HTMLDetailsElement) {
  element.classList.remove("menu-open");
  element.removeAttribute("open");

  const summary = element.querySelector("summary");

  if (summary) {
    summary.setAttribute("aria-expanded", "false");
  }
}

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

type HeaderDrawerProps = {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
};

type HeaderDrawerContextValue = {
  isOpen: boolean;
  open: (target?: string, event?: Event | React.SyntheticEvent) => void;
  close: () => void;
  back: (event?: Event | React.SyntheticEvent) => void;
  toggle: () => void;
};

type DrawerTriggerProps = {
  children: ReactNode;
  className?: string;
};

type DrawerPanelProps = {
  children: ReactNode;
  className?: string;
};

type DrawerBackButtonProps = {
  children: ReactNode;
  className?: string;
};

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

const HeaderDrawerContext =
  React.createContext<HeaderDrawerContextValue | null>(null);

function useHeaderDrawer() {
  const context = React.useContext(HeaderDrawerContext);

  if (!context) {
    throw new Error(
      "HeaderDrawer compound components must be used within HeaderDrawer",
    );
  }

  return context;
}

/* -------------------------------------------------------------------------------------------------
 * Component
 * -----------------------------------------------------------------------------------------------*/

export function HeaderDrawer({
  children,
  className,
  defaultOpen = false,
}: HeaderDrawerProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const menuDrawerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(defaultOpen);

  /**
   * Setup animated element listeners
   */
  useEffect(() => {
    const root = detailsRef.current;

    if (!root) return;

    const animatedElements = root.querySelectorAll(
      ".menu-drawer__animated-element",
    );

    animatedElements.forEach((element) => {
      element.addEventListener(
        "animationend",
        removeWillChangeOnAnimationEnd as EventListener,
      );
    });

    return () => {
      animatedElements.forEach((element) => {
        element.removeEventListener(
          "animationend",
          removeWillChangeOnAnimationEnd as EventListener,
        );
      });
    };
  }, []);

  /**
   * Escape key handler
   */
  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      const details = getDetailsElement(event, detailsRef.current);

      closeDetails(details);
    };

    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const preventInitialAccordionAnimations = useCallback(
    (details: HTMLDetailsElement) => {
      const content = details.querySelectorAll(
        "accordion-custom .details-content",
      );

      content.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.classList.add("details-content--no-animation");
        }
      });

      setTimeout(() => {
        content.forEach((element) => {
          if (element instanceof HTMLElement) {
            element.classList.remove("details-content--no-animation");
          }
        });
      }, 100);
    },
    [],
  );

  const open = useCallback(
    (target?: string, event?: Event | React.SyntheticEvent) => {
      const root = detailsRef.current;

      if (!root) return;

      const details = getDetailsElement(event, root);

      const summary = details.querySelector("summary");

      if (!summary) return;

      details.setAttribute("open", "");

      summary.setAttribute("aria-expanded", "true");

      preventInitialAccordionAnimations(details);

      requestAnimationFrame(() => {
        details.classList.add("menu-open");

        if (target) {
          menuDrawerRef.current?.classList.add(
            "menu-drawer--has-submenu-opened",
          );
        }

        const drawer = details.querySelector(
          ".menu-drawer, .menu-drawer__submenu",
        );

        onAnimationEnd(
          drawer || details,
          () => {
            trapFocus(details);
          },
          { subtree: false },
        );
      });

      setIsOpen(true);
    },
    [preventInitialAccordionAnimations],
  );

  const closeDetails = (details: HTMLDetailsElement) => {
    const root = detailsRef.current;

    if (!root) return;

    const summary = details.querySelector("summary");

    if (!summary) return;

    summary.setAttribute("aria-expanded", "false");

    details.classList.remove("menu-open");

    menuDrawerRef.current?.classList.remove("menu-drawer--has-submenu-opened");

    const drawer = details.querySelector(".menu-drawer, .menu-drawer__submenu");

    onAnimationEnd(
      drawer || details,
      () => {
        resetDetails(details);

        if (details === root) {
          removeTrapFocus();

          const openDetails = root.querySelectorAll<HTMLDetailsElement>(
            "details[open]:not(accordion-custom > details)",
          );

          openDetails.forEach(resetDetails);
        } else {
          trapFocus(root);
        }

        setIsOpen(false);
      },
      { subtree: false },
    );
  };

  const close = useCallback(() => {
    if (!detailsRef.current) return;

    closeDetails(detailsRef.current);
  }, [closeDetails]);

  const back = useCallback(
    (event?: Event | React.SyntheticEvent) => {
      const root = detailsRef.current;

      if (!root) return;

      const details = getDetailsElement(event ?? event, root);

      closeDetails(details);
    },
    [closeDetails],
  );

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [close, isOpen, open]);

  const contextValue = useMemo<HeaderDrawerContextValue>(
    () => ({
      isOpen,
      open,
      close,
      back,
      toggle,
    }),
    [isOpen, open, close, back, toggle],
  );

  return (
    <HeaderDrawerContext.Provider value={contextValue}>
      <details ref={detailsRef} open={defaultOpen} className={className}>
        <summary
          aria-expanded={isOpen}
          onClick={(event) => {
            event.preventDefault();
            toggle();
          }}
        >
          Menu
        </summary>

        <div ref={menuDrawerRef} className="menu-drawer">
          {children}
        </div>
      </details>
    </HeaderDrawerContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Compound Components
 * -----------------------------------------------------------------------------------------------*/

HeaderDrawer.Trigger = function HeaderDrawerTrigger({
  children,
  className,
}: DrawerTriggerProps) {
  const { toggle } = useHeaderDrawer();

  return (
    <button type="button" className={className} onClick={() => toggle()}>
      {children}
    </button>
  );
};

HeaderDrawer.Panel = function HeaderDrawerPanel({
  children,
  className,
}: DrawerPanelProps) {
  return <div className={className}>{children}</div>;
};

HeaderDrawer.BackButton = function HeaderDrawerBackButton({
  children,
  className,
}: DrawerBackButtonProps) {
  const { back } = useHeaderDrawer();

  return (
    <button
      type="button"
      className={className}
      onClick={(event) => back(event)}
    >
      {children}
    </button>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------------------------*/

function getDetailsElement(
  event: Event | React.SyntheticEvent | undefined,
  fallback: HTMLDetailsElement | null,
): HTMLDetailsElement {
  const target = event && "target" in event ? event.target : undefined;

  if (!(target instanceof Element)) {
    return fallback as HTMLDetailsElement;
  }

  return (
    (target.closest("details") as HTMLDetailsElement | null) ??
    (fallback as HTMLDetailsElement)
  );
}

/* -------------------------------------------------------------------------------------------------
 * Example Usage
 * -----------------------------------------------------------------------------------------------*/

<HeaderDrawer className="header-drawer">
  <HeaderDrawer.Panel className="menu-drawer__content">
    <nav>
      <ul>
        <li>
          <a href="/collections/all">Shop</a>
        </li>

        <li>
          <details>
            <summary>Collections</summary>

            <div className="menu-drawer__submenu">
              <HeaderDrawer.BackButton>Back</HeaderDrawer.BackButton>

              <ul>
                <li>
                  <a href="/collections/shirts">Shirts</a>
                </li>

                <li>
                  <a href="/collections/jackets">Jackets</a>
                </li>
              </ul>
            </div>
          </details>
        </li>
      </ul>
    </nav>
  </HeaderDrawer.Panel>
</HeaderDrawer>;
