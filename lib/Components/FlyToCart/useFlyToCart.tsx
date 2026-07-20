"use client";

import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { FlyToCartItem } from "./FlyToCartItem";
import type {
  FlyToCartFlight,
  FlyToCartOptions,
  UseFlyToCartResult,
} from "./types";

let flightId = 0;

/**
 * Owns fly-to-cart animation state at the component root and returns:
 * - `fly`: call this from an add-to-cart handler to start a new flight
 * - `FlyToCartLayer`: render this once (e.g. near the root layout) to
 *   mount active flights via a portal into `document.body`
 *
 * Multiple flights can be in-flight simultaneously; each is tracked
 * independently and removed from state once its animation finishes.
 */
export function useFlyToCart(): UseFlyToCartResult {
  const [flights, setFlights] = useState<FlyToCartFlight[]>([]);

  const fly = useCallback((source: Element, options: FlyToCartOptions) => {
    const id = `fly-to-cart-${++flightId}`;
    setFlights((current) => [
      ...current,
      {
        id,
        source,
        destination: options.destination,
        useSourceSize: options.useSourceSize ?? true,
        content: options.content,
      },
    ]);
  }, []);

  const handleFinished = useCallback((id: string) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
  }, []);

  const FlyToCartLayer = useCallback(() => {
    if (flights.length === 0 || typeof document === "undefined") {
      return <></>;
    }

    return createPortal(
      <>
        {flights.map((flight) => (
          <FlyToCartItem
            key={flight.id}
            flight={flight}
            onFinished={handleFinished}
          />
        ))}
      </>,
      document.body,
    );
  }, [flights, handleFinished]);

  return { fly, FlyToCartLayer };
}
