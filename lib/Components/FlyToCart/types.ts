import type React from 'react';

/** A single in-flight animation request. */
export interface FlyToCartFlight {
  /** Unique id for this flight, used as the React key. */
  id: string;
  /** Element the flight animates from. */
  source: Element;
  /** Element the flight animates to. */
  destination: Element;
  /** Whether the flying node should match the source element's size. */
  useSourceSize: boolean;
  /** Optional content to render inside the flying node (e.g. a cloned image). */
  content?: React.ReactNode;
}

/** Options accepted by the `fly` trigger function returned from `useFlyToCart`. */
export interface FlyToCartOptions {
  /** Element the flight animates to. */
  destination: Element;
  /** Whether the flying node should match the source element's size. Defaults to `true`. */
  useSourceSize?: boolean;
  /** Optional content to render inside the flying node (e.g. a cloned image). */
  content?: React.ReactNode;
}

/** Return shape of the `useFlyToCart` hook. */
export interface UseFlyToCartResult {
  /** Triggers a new flight from `source` to `options.destination`. */
  fly: (source: Element, options: FlyToCartOptions) => void;
  /** Render this once, anywhere in the tree, to mount active flights via a portal. */
  FlyToCartLayer: () => React.ReactElement;
}

export interface FlyToCartItemProps {
  flight: FlyToCartFlight;
  onFinished: (id: string) => void;
}
