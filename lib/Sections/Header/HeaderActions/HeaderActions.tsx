import React, {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

/* -----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export type HeaderActionsDisplayStyle = "icon" | "text";

export interface FontConfig {
  family: string;
  fallbackFamilies?: string;
  weight?: number | string;
}

export interface HeaderActionsSectionSettings {
  actionsFont?: "body" | "subheading" | "accent" | "heading";
  drawerColorScheme?: string;
  popoverColorScheme?: string;
  autoOpenCartDrawer?: boolean;
}

export interface ThemeTypography {
  heading: FontConfig;
  body: FontConfig;
  subheading: FontConfig;
  accent: FontConfig;
}

export interface CartItem {
  id: string | number;
  title: string;
  quantity: number;
  price?: string;
  image?: string;
}

export interface HeaderActionsProps {
  displayStyle?: HeaderActionsDisplayStyle;

  customerAccountsEnabled?: boolean;
  customerLoggedIn?: boolean;

  customerAccountMenu?: string;

  cartType?: "drawer" | "page";
  currentTemplate?: string;

  cartItems?: CartItem[];

  section?: {
    id?: string;
    settings?: HeaderActionsSectionSettings;
  };

  typography?: ThemeTypography;

  translations?: {
    cartTitle?: string;
    accountTitle?: string;
    closeDialog?: string;
    cartAccessibilityLabel?: string;
    yourCartIsEmpty?: string;
  };

  renderCartProducts?: (items: CartItem[]) => ReactNode;
  renderCartSummary?: (items: CartItem[]) => ReactNode;

  cartUrl?: string;

  className?: string;
}

/* -----------------------------------------------------------------------------
 * Utilities
 * -------------------------------------------------------------------------- */

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const getCartCount = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0);

const getFontObject = (
  actionsFont: HeaderActionsSectionSettings["actionsFont"],
  typography?: ThemeTypography,
): FontConfig | undefined => {
  if (!typography) return undefined;

  switch (actionsFont) {
    case "body":
      return typography.body;

    case "subheading":
      return typography.subheading;

    case "accent":
      return typography.accent;

    default:
      return typography.heading;
  }
};

/* -----------------------------------------------------------------------------
 * Icons
 * -------------------------------------------------------------------------- */

const CartIconSvg = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 4H5L7 16H18L21 7H8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
};

const AccountIconSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="17"
      viewBox="0 0 15 17"
      fill="none"
      className="account-button__icon"
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M10.375 3.813a3.063 3.063 0 1 1-6.125 0 3.063 3.063 0 0 1 6.125 0ZM7.313 9.5c-3.667 0-6.24 2.691-6.563 6.125h13.125C13.552 12.191 10.979 9.5 7.312 9.5Z"
      />
    </svg>
  );
};

const CloseIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 5L15 15M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

/* -----------------------------------------------------------------------------
 * Cart Bubble
 * -------------------------------------------------------------------------- */

interface CartBubbleProps {
  count: number;
  limit?: number;
}

const CartBubble = ({ count, limit = 100 }: CartBubbleProps) => {
  const visibleCount =
    count > limit ? `${limit}+` : count > 0 ? String(count) : "";

  return (
    <span
      className={cx("cart-bubble", count > 0 && "cart-bubble--has-items")}
      aria-hidden="true"
    >
      <span className="cart-bubble__background" />

      <span className="cart-bubble__text">
        <span className="cart-bubble__text-count">{visibleCount}</span>
      </span>
    </span>
  );
};

/* -----------------------------------------------------------------------------
 * Cart Icon
 * -------------------------------------------------------------------------- */

interface CartIconProps {
  displayStyle: HeaderActionsDisplayStyle;
  count: number;
  cartTitle: string;
}

const CartIcon = ({ displayStyle, count, cartTitle }: CartIconProps) => {
  return (
    <span
      className={cx(
        "header-actions__cart-icon",
        displayStyle === "text" && "header-actions__cart-icon--text",
        count > 0 && "header-actions__cart-icon--has-cart",
      )}
      data-testid="cart-icon"
    >
      <span
        className={cx(displayStyle === "icon" ? "hidden" : "mobile:hidden")}
      >
        {cartTitle}
      </span>

      <span
        className={cx(
          "svg-wrapper",
          displayStyle !== "icon" && "desktop:hidden",
        )}
        aria-hidden="true"
      >
        <CartIconSvg />
      </span>

      <CartBubble count={count} limit={100} />
    </span>
  );
};

/* -----------------------------------------------------------------------------
 * Focus Trap
 * -------------------------------------------------------------------------- */

const FOCUSABLE_SELECTOR = `
  a[href],
  button:not([disabled]),
  textarea:not([disabled]),
  input:not([disabled]),
  select:not([disabled]),
  [tabindex]:not([tabindex="-1"])
`;

const useFocusTrap = (
  active: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  onEscape: () => void,
) => {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
        return;
      }

      if (event.key !== "Tab") return;

      if (!first || !last) return;

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

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, containerRef, onEscape]);
};

/* -----------------------------------------------------------------------------
 * Cart Drawer
 * -------------------------------------------------------------------------- */

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;

  items: CartItem[];

  displayStyle: HeaderActionsDisplayStyle;

  drawerColorScheme?: string;

  cartTitle: string;
  closeDialog: string;
  yourCartIsEmpty: string;
  cartAccessibilityLabel: string;

  renderCartProducts?: (items: CartItem[]) => ReactNode;
  renderCartSummary?: (items: CartItem[]) => ReactNode;
}

const CartDrawer = ({
  open,
  onClose,
  items,
  drawerColorScheme,
  cartTitle,
  closeDialog,
  yourCartIsEmpty,
  cartAccessibilityLabel,
  renderCartProducts,
  renderCartSummary,
}: CartDrawerProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const headingId = useId();

  const cartCount = getCartCount(items);

  const isEmpty = items.length === 0;

  useFocusTrap(open, dialogRef, onClose);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="cart-drawer__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={cx(
          "cart-drawer__dialog",
          `color-${drawerColorScheme ?? "scheme-1"}`,
          isEmpty && "cart-drawer--empty",
        )}
        data-testid="cart-drawer-dialog"
      >
        <div className="cart-drawer__inner">
          <div className="cart-drawer__header">
            {!isEmpty && (
              <h2 className="cart-drawer__heading h4" id={headingId}>
                {cartTitle}

                <CartBubble count={cartCount} />
              </h2>
            )}

            <button
              type="button"
              onClick={onClose}
              className="button close-button cart-drawer__close-button button-unstyled"
              aria-label={closeDialog}
            >
              <span className="svg-wrapper">
                <CloseIcon />
              </span>
            </button>
          </div>

          <div
            className="cart-drawer__content"
            aria-label={cartAccessibilityLabel}
          >
            {isEmpty ? (
              <Fragment>
                <h2
                  className="cart-drawer__heading h4 cart-drawer__heading--empty"
                  id={headingId}
                >
                  {yourCartIsEmpty}
                </h2>

                <div className="cart-drawer__items">
                  {renderCartProducts?.([]) ?? (
                    <div className="cart-drawer__empty-state">
                      Your cart is currently empty.
                    </div>
                  )}
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div className="cart-drawer__items">
                  {renderCartProducts?.(items) ?? (
                    <DefaultCartProducts items={items} />
                  )}
                </div>

                <div className="cart-drawer__summary">
                  {renderCartSummary?.(items) ?? (
                    <DefaultCartSummary items={items} />
                  )}
                </div>
              </Fragment>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* -----------------------------------------------------------------------------
 * Default Cart Rendering
 * -------------------------------------------------------------------------- */

const DefaultCartProducts = ({ items }: { items: CartItem[] }) => {
  return (
    <div className="cart-products">
      {items.map((item) => (
        <div key={item.id} className="cart-items__table-row">
          <div>{item.title}</div>

          <div>Qty: {item.quantity}</div>

          {item.price && <div>{item.price}</div>}
        </div>
      ))}
    </div>
  );
};

const DefaultCartSummary = ({ items }: { items: CartItem[] }) => {
  const count = getCartCount(items);

  return (
    <div className="cart-summary">
      <div className="cart__summary-totals">
        <strong>{count}</strong> item(s) in cart
      </div>

      <button className="button">Checkout</button>
    </div>
  );
};

/* -----------------------------------------------------------------------------
 * Main Component
 * -------------------------------------------------------------------------- */

export const HeaderActions = ({
  displayStyle = "icon",

  customerAccountsEnabled = true,
  customerLoggedIn = false,

  customerAccountMenu,

  cartType = "drawer",
  currentTemplate,

  cartItems = [],

  section,
  typography,

  translations,

  renderCartProducts,
  renderCartSummary,

  cartUrl = "/cart",

  className,
}: HeaderActionsProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const liveRegionRef = useRef<HTMLSpanElement | null>(null);

  const cartCount = getCartCount(cartItems);

  const cartIsDrawer = cartType === "drawer" && currentTemplate !== "cart";

  const t = {
    cartTitle: translations?.cartTitle ?? "Cart",
    accountTitle: translations?.accountTitle ?? "Account",
    closeDialog: translations?.closeDialog ?? "Close dialog",
    cartAccessibilityLabel: translations?.cartAccessibilityLabel ?? "Cart",
    yourCartIsEmpty: translations?.yourCartIsEmpty ?? "Your cart is empty",
  };

  const accountActionStyle = useMemo(() => {
    if (displayStyle !== "text" || !section?.settings || !typography) {
      return undefined;
    }

    const fontObject = getFontObject(section.settings.actionsFont, typography);

    if (!fontObject) return undefined;

    const fontFamily = [fontObject.family, fontObject.fallbackFamilies]
      .filter(Boolean)
      .join(", ");

    return {
      "--header-actions-font-family": fontFamily,
      "--header-actions-font-weight": String(fontObject.weight ?? 400),
    } as React.CSSProperties;
  }, [displayStyle, section, typography]);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);

    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = "Cart drawer opened";
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);

    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = "Cart drawer closed";
    }
  }, []);

  return (
    <div
      className={cx(
        "header-actions",
        displayStyle === "text" && "header-actions--text",
        className,
      )}
    >
      {customerAccountsEnabled && (
        <div
          className={cx(
            "account-button",
            "header-actions__action",
            displayStyle === "text" && "account-button--text",
          )}
        >
          <button
            type="button"
            className="button-unstyled"
            style={accountActionStyle}
            data-account-menu={customerAccountMenu}
            aria-label={t.accountTitle}
          >
            {customerLoggedIn ? (
              <div className="account-button__fallback" />
            ) : (
              <>
                <span
                  className={cx(
                    "account-button__text",
                    "header-actions__text-style",
                    displayStyle === "icon" ? "hidden" : "mobile:hidden",
                  )}
                >
                  {t.accountTitle}
                </span>

                <span
                  className={cx(displayStyle !== "icon" && "desktop:hidden")}
                  aria-hidden="true"
                >
                  <AccountIconSvg />
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {cartIsDrawer ? (
        <>
          <button
            type="button"
            className={cx(
              "header-actions__action",
              "button-unstyled",
              displayStyle === "text" && "header-actions__text-style",
            )}
            onClick={openDrawer}
            aria-haspopup="dialog"
            aria-label={t.cartAccessibilityLabel}
            data-testid="cart-drawer-trigger"
          >
            <CartIcon
              displayStyle={displayStyle}
              count={cartCount}
              cartTitle={t.cartTitle}
            />
          </button>

          <CartDrawer
            open={drawerOpen}
            onClose={closeDrawer}
            items={cartItems}
            displayStyle={displayStyle}
            drawerColorScheme={section?.settings?.drawerColorScheme}
            cartTitle={t.cartTitle}
            closeDialog={t.closeDialog}
            yourCartIsEmpty={t.yourCartIsEmpty}
            cartAccessibilityLabel={t.cartAccessibilityLabel}
            renderCartProducts={renderCartProducts}
            renderCartSummary={renderCartSummary}
          />
        </>
      ) : (
        <a
          href={cartUrl}
          className={cx(
            "header-actions__action",
            "action__cart",
            displayStyle === "text" && "header-actions__text-style",
          )}
          aria-label={t.cartAccessibilityLabel}
        >
          <CartIcon
            displayStyle={displayStyle}
            count={cartCount}
            cartTitle={t.cartTitle}
          />
        </a>
      )}

      <span
        ref={liveRegionRef}
        className="visually-hidden"
        role="status"
        data-testid="cart-count-live-region"
      />
    </div>
  );
};

export default HeaderActions;
