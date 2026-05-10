# React `HeaderComponent` — Detailed Architectural Breakdown

## Overview

This component is a React implementation of a Shopify-style dynamic header system originally written as a Custom Element (`<header-component>`).

It manages:

- Sticky header behavior
- Scroll direction tracking
- Dynamic header sizing
- Intersection-based visibility detection
- Responsive menu state handling
- Global CSS variable synchronization
- Theme-color updates
- Performance-optimized scroll handling

The component is essentially a **stateful viewport-aware layout controller**.

---

# High-Level Responsibilities

The component performs **6 major responsibilities**:

| Responsibility | Purpose |
|---|---|
| Header Height Synchronization | Keeps CSS layout variables updated |
| Sticky Header Logic | Handles persistent/floating headers |
| Scroll Direction Tracking | Detects up/down scrolling |
| Viewport Intersection Tracking | Detects when header leaves viewport |
| Responsive Menu Handling | Switches between menu/drawer modes |
| Cleanup & Lifecycle Management | Prevents memory leaks |

---

# Component Signature

```tsx
export function HeaderComponent({
  sticky = 'none',
  transparent = false,
  themeColor,
  children,
  className,
}: HeaderComponentProps)
```

---

# Props Breakdown

## `sticky`

```ts
type StickyMode = 'always' | 'scroll-up' | 'none';
```

Controls sticky behavior mode.

### Modes

| Mode | Behavior |
|---|---|
| `none` | No sticky behavior |
| `always` | Header always sticks |
| `scroll-up` | Header appears when scrolling upward |

---

## `transparent`

```tsx
transparent?: boolean;
```

Adds:

```html
data-transparent="true"
```

Typically used for:

- hero overlays
- transparent navigation bars
- layered layouts

---

## `themeColor`

```tsx
themeColor?: string;
```

Used to dynamically update:

```html
<meta name="theme-color">
```

This affects:

- mobile browser chrome color
- Android status bar color
- PWA UI coloring

---

## `children`

Header content.

Example:

```tsx
<Logo />
<Navigation />
<Search />
```

---

## `className`

Standard CSS class injection.

---

# Internal Architecture

# 1. DOM Reference System

```tsx
const headerRef = useRef<HTMLElement | null>(null);
```

This replaces:

```js
this
```

from the custom element implementation.

Purpose:

- access DOM measurements
- attach observers
- read bounding boxes
- observe resizing

---

# 2. Internal Mutable Refs

These replace private class fields (`#field`).

## Menu Drawer Width Memory

```tsx
const menuDrawerHiddenWidthRef = useRef<number | null>(null);
```

Tracks:

> "At what viewport width did we switch to drawer mode?"

Used for responsive recovery.

Example:

| Window Width | State |
|---|---|
| 700px | Drawer visible |
| 1300px | Restore desktop menu |

---

## Intersection Observer Ref

```tsx
const intersectionObserverRef =
  useRef<IntersectionObserver | null>(null);
```

Stores the observer instance.

Used for:

- sticky detection
- viewport visibility tracking

---

## Resize Observer Ref

```tsx
const resizeObserverRef =
  useRef<ResizeObserver | null>(null);
```

Tracks dynamic header height changes.

---

## Offscreen Tracking

```tsx
const offscreenRef = useRef(false);
```

Represents:

```txt
Has the header left the viewport?
```

Critical for:

- sticky activation
- floating header transitions

---

## Last Scroll Position

```tsx
const lastScrollTopRef = useRef(0);
```

Used for:

```txt
Scroll direction detection
```

---

## Timeout Ref

```tsx
const timeoutRef = useRef<number | null>(null);
```

Reserved for transition delays/animations.

(Current implementation barely uses it.)

---

## RAF ID Ref

```tsx
const scrollRafIdRef = useRef<number | null>(null);
```

Used for:

```txt
requestAnimationFrame throttling
```

Prevents excessive scroll calculations.

---

# 3. Visual State System

## Sticky State

```tsx
const [stickyState, setStickyState] =
  useState<StickyState>('inactive');
```

Possible values:

| Value | Meaning |
|---|---|
| `inactive` | Header behaving normally |
| `active` | Sticky mode visible |
| `idle` | Sticky system active but stationary |

---

## Scroll Direction

```tsx
const [scrollDirection, setScrollDirection] =
  useState<ScrollDirection>('none');
```

Possible values:

| Value | Meaning |
|---|---|
| `up` | User scrolling upward |
| `down` | User scrolling downward |
| `none` | No meaningful direction |

---

# 4. Menu Visibility Controller

## Function

```tsx
const updateMenuVisibility = useCallback(
  (hideMenu: boolean) => {}
)
```

## Purpose

Controls whether:

- desktop navigation menu is shown
- mobile drawer menu is shown

## Logic

### If hiding menu:

```tsx
menuDrawerHiddenWidthRef.current =
  window.innerWidth;
```

Meaning:

> Remember viewport width where collapse happened.

### If restoring menu:

```tsx
menuDrawerHiddenWidthRef.current = null;
```

## Then:

```tsx
setHeaderMenuStyle();
```

Triggers global styling updates.

Likely responsible for:

- CSS class updates
- layout recalculation
- drawer visibility

---

# 5. Sticky Position Observer

## Function

```tsx
observeStickyPosition(alwaysSticky)
```

# Core Purpose

Uses:

```tsx
IntersectionObserver
```

to determine whether header is:

- inside viewport
- outside viewport

# Observer Configuration

```tsx
threshold: alwaysSticky ? 1 : 0
```

## `threshold: 1`

Means:

```txt
Observer triggers only when fully visible
```

Used for:

```txt
always sticky mode
```

## `threshold: 0`

Means:

```txt
Observer triggers when any visibility changes
```

Used for:

```txt
scroll-up sticky mode
```

# Observer Callback

```tsx
([entry]) => {}
```

Receives visibility state.

# Always Sticky Mode Logic

```tsx
setStickyState(
  isIntersecting ? 'inactive' : 'active'
);
```

## Meaning

| State | Interpretation |
|---|---|
| Header fully visible | normal |
| Header scrolled away | sticky active |

# Theme Color Sync

```tsx
changeMetaThemeColor(themeColor);
```

Updates browser chrome color dynamically.

Especially important for:

- PWAs
- mobile Safari
- Android Chrome

# Scroll-Up Sticky Logic

```tsx
offscreenRef.current =
  !isIntersecting || stickyState === 'active';
```

Tracks whether floating behavior should activate.

---

# 6. Scroll State Machine

# Core Function

```tsx
updateScrollState()
```

This is the heart of sticky behavior.

# Step 1 — Exit Early

```tsx
if (!offscreenRef.current &&
    sticky !== 'always')
{
  return;
}
```

Optimization:

Avoid expensive calculations until necessary.

# Step 2 — Read Scroll Metrics

```tsx
const scrollTop =
  document.scrollingElement?.scrollTop ?? 0;
```

Gets current vertical scroll.

## Header Position

```tsx
const headerTop =
  headerRef.current.getBoundingClientRect().top;
```

Measures actual viewport-relative position.

# Step 3 — Determine Scroll Direction

```tsx
const isScrollingUp =
  scrollTop < lastScrollTopRef.current;
```

# Step 4 — Detect Top State

```tsx
const isAtTop = headerTop >= 0;
```

Means:

```txt
Header returned to natural layout position
```

# Always Sticky Mode

## Logic

```tsx
if (isAtTop)
```

No floating state.

## Scrolling Up

```tsx
setScrollDirection('up');
```

## Scrolling Down

```tsx
setScrollDirection('down');
```

# Scroll-Up Sticky Mode

# User Scrolling Up

```tsx
if (isScrollingUp)
```

## Returned To Top

```tsx
setStickyState('inactive');
```

Sticky behavior disabled.

## Not At Top

```tsx
setStickyState('active');
```

Show floating header.

# User Scrolling Down

```tsx
setStickyState('idle');
```

Header transitions toward hidden state.

# Final Step

```tsx
lastScrollTopRef.current = scrollTop;
```

Persist current position for next comparison.

---

# 7. RAF Scroll Throttling

# Function

```tsx
handleWindowScroll()
```

# Problem Being Solved

Native scroll events fire excessively.

Potentially:

```txt
60–120+ times per second
```

Without throttling:

- layout thrashing
- reflow storms
- FPS drops

# Solution

```tsx
requestAnimationFrame()
```

Only runs updates once per render frame.

# Guard

```tsx
if (scrollRafIdRef.current !== null)
```

Prevents stacking RAF calls.

# Execution Flow

```txt
scroll event
  ↓
schedule RAF
  ↓
browser repaint
  ↓
updateScrollState()
```

Very performant.

---

# 8. Resize Observer System

# Purpose

Tracks dynamic header size changes.

# Why Needed

Headers can change size due to:

- responsive layout
- localization
- announcement bars
- search expansion
- drawer states

# Observer Callback

```tsx
([entry]) => {}
```

# Height Extraction

```tsx
entry.borderBoxSize[0].blockSize
```

Reads actual rendered block height.

# Height Rounding

```tsx
Math.round()
```

Prevents subpixel CSS churn.

# Global CSS Variable Sync

```tsx
document.body.style.setProperty(
  '--header-height',
  `${roundedHeaderHeight}px`
);
```

This enables other components to use:

```css
var(--header-height)
```

Examples:

```css
padding-top: var(--header-height);
```

# Responsive Menu Recovery

```tsx
if (
  menuDrawerHiddenWidthRef.current &&
  window.innerWidth >
    menuDrawerHiddenWidthRef.current
)
```

Meaning:

```txt
Viewport expanded beyond collapse point
```

Restore desktop menu.

---

# 9. Lifecycle Effects

# Layout Effect

```tsx
useLayoutEffect()
```

Used instead of `useEffect`.

Why?

Because layout measurements occur before paint.

Critical for:

- preventing flicker
- avoiding layout jumps

# Responsibilities

- initialize ResizeObserver
- observe header
- cleanup observer
- reset CSS variable

# Standard Effect

```tsx
useEffect()
```

Handles:

- scroll listeners
- intersection observers

# Conditional Activation

```tsx
if (sticky === 'none') return;
```

Avoids unnecessary systems.

# Passive Scroll Listener

```tsx
{ passive: true }
```

Optimization:

Tells browser:

```txt
This listener won't cancel scrolling
```

Improves scrolling performance.

# Cleanup Logic

## Disconnect Observer

```tsx
intersectionObserverRef.current?.disconnect();
```

## Remove Scroll Listener

```tsx
document.removeEventListener(...)
```

## Cancel RAF

```tsx
cancelAnimationFrame()
```

## Clear Timeout

```tsx
clearTimeout()
```

---

# 10. Dataset API Recreation

Original custom element used:

```js
this.dataset.stickyState
```

React equivalent:

```tsx
const dataAttributes = {
  'data-sticky-state': stickyState,
}
```

# Why Important

Allows CSS-driven state styling.

Example:

```css
[data-sticky-state="active"] {
  transform: translateY(0);
}
```

# Final Render Output

```tsx
<header
  ref={headerRef}
  className={className}
  {...dataAttributes}
>
  {children}
</header>
```

---

# Performance Characteristics

# Optimizations Used

| Optimization | Purpose |
|---|---|
| `requestAnimationFrame` | Scroll throttling |
| `ResizeObserver` | Avoid polling |
| `IntersectionObserver` | Avoid manual viewport math |
| Passive scroll listener | Faster scrolling |
| `useRef` mutable state | Avoid rerenders |
| Early exits | Skip unnecessary work |
| Rounded heights | Prevent reflow churn |

# CSS Integration Strategy

The component heavily relies on CSS state selectors.

Expected patterns:

```css
[data-scroll-direction="up"]
[data-sticky-state="active"]
[data-transparent="true"]
```

This architecture keeps:

- animation logic in CSS
- state logic in JS

A very scalable separation.

---

# Behavioral Timeline Example

# Example: `sticky="scroll-up"`

## Initial State

```txt
Header visible normally
stickyState = inactive
```

## User Scrolls Down

```txt
Header leaves viewport
offscreen = true
stickyState = idle
```

Header hides.

## User Scrolls Up

```txt
isScrollingUp = true
stickyState = active
scrollDirection = up
```

Floating sticky header appears.

## User Returns To Top

```txt
headerTop >= 0
stickyState = inactive
```

Header returns to natural flow.

---

# Architectural Pattern

This component follows a hybrid pattern:

| Pattern | Usage |
|---|---|
| Reactive UI | React state |
| Imperative DOM APIs | observers + measurements |
| CSS-driven visuals | dataset selectors |
| Event-loop scheduling | RAF throttling |

It is effectively:

```txt
A viewport-aware layout state machine
```

rather than a simple visual component.
