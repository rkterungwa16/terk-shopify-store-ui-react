# HeaderMenu Custom Element — Detailed Breakdown

## 1. Overview

This file defines a **custom Web Component (`<header-menu>`)** responsible for managing a complex, stateful navigation system in a Shopify-style header.

It handles:

* Mega menu activation/deactivation
* Overflow menu behavior
* Pointer tracking and hover safety logic
* Dynamic submenu height calculation
* Mutation-observer-based hydration detection
* Accessibility state (`aria-expanded`)
* CSS variable-driven layout updates
* Performance optimizations (debounce, RAF, preloading)

It extends a base `Component` class from `@theme/component`, which provides:

* `refs` system
* lifecycle hooks (`connectedCallback`, `disconnectedCallback`)
* state management pattern

---

## 2. Class Definition

```js
class HeaderMenu extends Component
```

This custom element is registered as:

```js
customElements.define('header-menu', HeaderMenu);
```

Meaning it can be used in HTML as:

```html
<header-menu></header-menu>
```

---

## 3. Required Refs System

```js
requiredRefs = ['overflowMenu'];
```

This enforces that the component must resolve a reference called:

* `overflowMenu`

If missing, the component likely fails or becomes inert.

---

## 4. Private State Management

### 4.1 Active Menu State

```js
#state = {
  activeItem: null,
};
```

Tracks currently open/active menu item.

Equivalent to React state:

```js
const [activeItem, setActiveItem] = useState(null);
```

---

### 4.2 Pointer Tracking State

```js
#lastPointer = { x: 0, y: 0 };
#pointerIdleTimer;
```

Used to:

* detect hover movement
* stabilize hover transitions
* implement “safety box” UX

---

### 4.3 Mutation Observer

```js
#submenuMutationObserver = null;
```

Watches submenu DOM changes after activation.

Used to detect:

* lazy hydration
* async injected content
* delayed rendering

---

## 5. Lifecycle Hooks

### 5.1 connectedCallback()

Runs when element is mounted.

```js
onDocumentLoaded(this.#preloadImages);
window.addEventListener('resize', this.#resizeListener);
this.overflowMenu?.addEventListener('pointerleave', this.#overflowSubmenuListener);
```

### Responsibilities:

* Preload images after DOM ready
* Attach resize listener (debounced)
* Watch overflow menu hover exit

---

### 5.2 disconnectedCallback()

Cleanup phase.

Removes:

* resize listeners
* pointermove listeners
* overflow listeners
* active pointer tracking
* mutation observers

Prevents memory leaks and stale handlers.

---

## 6. Resize Handling

```js
#resizeListener = debounce(() => {
  setHeaderMenuStyle();
}, 100);
```

### Behavior:

* Debounced at 100ms
* Recalculates layout variables

### Purpose:

Keeps mega menu layout responsive without excessive recalculation.

---

## 7. Overflow Menu Accessor

```js
get overflowMenu()
```

Resolves shadow DOM node:

```js
this.refs.overflowMenu?.shadowRoot?.querySelector('[part="overflow"]')
```

### Meaning:

* `overflowMenu` is a Web Component
* Uses Shadow DOM
* Exposes internal parts via `part="overflow"`

---

## 8. Hover State Detection

```js
get overflowListHovered()
```

Checks:

```js
matches(':hover')
```

Used to prevent accidental menu close when user is interacting with overflow submenu.

---

## 9. Core Interaction Flow

# 9.1 activate(event)

Primary entry point for opening menus.

Triggered by:

* pointerenter
* focus

---

### Step 1 — Dispatch Event

```js
this.dispatchEvent(new MegaMenuHoverEvent());
```

Notifies global system that menu interaction occurred.

---

### Step 2 — Identify Menu Item

```js
let item = findMenuItem(event.target);
```

Finds nearest menu item anchor.

---

### Step 3 — Prevent Duplicate Activation

```js
if (!item || item == this.#state.activeItem) return;
```

Avoids redundant reflows.

---

### Step 4 — Overflow Mode Detection

```js
const isDefaultSlot = event.target.slot === '';
```

Determines whether interaction is:

* primary menu
* overflow menu

---

### Step 5 — Update Active State

```js
this.#state.activeItem = item;
item.ariaExpanded = 'true';
```

Also updates:

* previous item → `ariaExpanded = false`

---

## 10. Submenu Resolution

```js
let submenu = findSubmenu(item);
```

If not found:

```js
submenu = this.overflowMenu;
```

Ensures overflow menus behave like submenus.

---

## 11. Mutation Observation System

Used to detect dynamically injected submenu content.

### Key behavior:

* observes childList + subtree
* waits for DOM updates
* recalculates submenu height
* uses double `requestAnimationFrame`

### Why double RAF?

Ensures layout is fully committed before measurement.

---

## 12. Dynamic Height Calculation

### Base:

```js
submenu.offsetHeight
```

### Overflow adjustment:

If overflow menu is active:

```js
Math.max(overflowHeight, overflowListHeight)
```

Ensures full content visibility.

---

## 13. CSS Variable System

The component heavily controls layout via CSS variables:

| Variable                    | Purpose                |
| --------------------------- | ---------------------- |
| `--submenu-height`          | dropdown height        |
| `--submenu-opacity`         | visibility animation   |
| `--full-open-header-height` | total header expansion |
| `--box-height`              | hover safety region    |

---

## 14. Pointer Tracking System

### 14.1 onPointerMove

Tracks cursor movement:

* stores coordinates
* detects movement delta
* toggles `data-safety-box`

---

### 14.2 Safety Box Mechanism

```js
dataset.safetyBox = "true/false"
```

Used to:

* expand hover hit area
* prevent flicker between menu + submenu

---

### 14.3 Idle Timer

After 50ms inactivity:

* resets safety box
* reconciles pointer target

---

## 15. Safari Hit-Test Fix

```js
#reconcilePointerTarget()
```

Safari bug workaround:

* recalculates element under pointer
* triggers synthetic `pointerenter`

Ensures hover consistency after DOM updates.

---

## 16. Pointer Tracking Lifecycle

### startPointerTracking()

* attaches pointermove listener
* computes hover geometry
* sets CSS boundary box height

### stopPointerTracking()

* removes pointermove
* clears timers
* removes dataset flags

---

## 17. Deactivation Flow

### Public:

```js
deactivate(event)
```

### Internal:

```js
#deactivate()
```

---

### Conditions preventing deactivation:

* moving within menu
* moving into overflow
* hovering submenu

---

### On full deactivation:

* resets CSS variables
* clears active item
* hides submenu
* resets aria state

---

## 18. Overflow Height Calculation Hack

```js
#getOverflowListLinksHeight()
```

### Technique:

1. temporarily hides submenus
2. measures container height
3. restores visibility

### Purpose:

Accurate height calculation without layout interference.

---

## 19. Header Height Expansion Logic

```js
#setFullOpenHeaderHeight()
```

Computes:

```text
full height = header height + submenu height
```

Handles special overlap mode:

* top row only height used

---

## 20. Image Preloading Optimization

```js
#preloadImages()
```

Removes:

```html
loading="lazy"
```

So images load immediately after DOM readiness.

---

## 21. Mutation Observer Cleanup

```js
#cleanupMutationObserver()
```

Prevents:

* memory leaks
* duplicate observers
* stale DOM watchers

---

## 22. Helper Functions

### findMenuItem()

Resolves correct clickable menu item.

Handles special case:

```js
slot="more"
```

Redirects to overflow slot item.

---

### findSubmenu()

Finds submenu relative to menu item:

```js
parentElement.querySelector('[ref="submenu[]"]')
```

---

## 23. Architectural Summary

This component implements a **highly optimized navigation engine** with:

### Interaction Layer

* pointer tracking
* hover stabilization
* synthetic event correction

### Layout Layer

* dynamic height calculation
* CSS variable-driven geometry

### Performance Layer

* debounce resize
* RAF batching
* mutation observation cleanup

### UX Layer

* safety box hover protection
* overflow menu merging
* smooth submenu transitions

### Compatibility Layer

* Safari pointer reconciliation fix
* shadow DOM access

---

## 24. Design Philosophy

This is not a simple menu controller.

It is a **stateful interaction engine for responsive mega navigation**, optimized for:

* low flicker hover UX
* layout stability under async hydration
* cross-browser pointer correctness
* CSS-driven animation orchestration
