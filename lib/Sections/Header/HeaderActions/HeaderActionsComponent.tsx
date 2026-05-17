import React, { useEffect, useRef, useCallback } from "react";

/**
 * Equivalent of:
 * document.addEventListener(ThemeEvents.cartUpdate, ...)
 */
export const ThemeEvents = {
  cartUpdate: "cart:update",
} as const;

/**
 * Example translation object.
 * Replace with your i18n solution or context.
 */
export const Theme = {
  translations: {
    cart_count: "Cart count",
  },
};

type CartUpdateDetail = {
  resource?: {
    item_count?: number;
  };
};

/**
 * React version of the Shopify Liquid custom element:
 * <header-actions>
 *
 * Responsibilities:
 * - Subscribes to global cart update events
 * - Updates an aria-live region for screen readers
 * - Cleans up listeners on unmount
 */
export interface HeaderActionsProps {
  className?: string;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({ className }) => {
  /**
   * Equivalent to:
   * this.refs.liveRegion
   */
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  /**
   * Equivalent to:
   * #onCartUpdate = (event) => {}
   */
  const handleCartUpdate = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<CartUpdateDetail>;

    const cartCount = customEvent.detail?.resource?.item_count;

    if (cartCount === undefined) return;

    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `${Theme.translations.cart_count}: ${cartCount}`;
    }
  }, []);

  /**
   * Equivalent to:
   * connectedCallback / disconnectedCallback
   */
  useEffect(() => {
    document.addEventListener(
      ThemeEvents.cartUpdate,
      handleCartUpdate as EventListener,
    );

    return () => {
      document.removeEventListener(
        ThemeEvents.cartUpdate,
        handleCartUpdate as EventListener,
      );
    };
  }, [handleCartUpdate]);

  return (
    <div className={className}>
      {/* Other header action UI can go here */}

      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
};

export default HeaderActions;
