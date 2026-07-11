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
import { CartUpdateEvent } from "../types";

/* ============================================================
   HEADER ACTIONS — cart indicator + live region
   ============================================================ */
export function HeaderActions() {
  const [cartCount, setCartCount] = useState<number>(0);
  const [liveMessage, setLiveMessage] = useState<string>("");

  useEffect(() => {
    const onCartUpdate = (event: Event): void => {
      const detail = (event as CartUpdateEvent).detail;
      if (detail?.item_count === undefined) return;
      setCartCount(detail.item_count);
      setLiveMessage(`Cart items: ${detail.item_count}`);
    };
    document.addEventListener("cart:update", onCartUpdate);
    return () => document.removeEventListener("cart:update", onCartUpdate);
  }, []);

  return (
    <div className="header-actions">
      <button className="header-actions__cart" aria-label="Cart">
        <ShoppingCart size={18} />
        <span className="header-actions__cart-label">Cart</span>
        <span className="header-actions__count">{cartCount}</span>
      </button>
      <div className="visually-hidden" role="status" aria-live="polite">
        {liveMessage}
      </div>
    </div>
  );
}
