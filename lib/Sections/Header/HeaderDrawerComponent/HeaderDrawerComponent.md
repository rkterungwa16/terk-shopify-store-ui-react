The `HeaderDrawer` custom element is a controller for a mobile/off-canvas navigation drawer system built around native HTML `<details>` and `<summary>` elements.

It combines:

* native disclosure semantics (`details`)
* focus management
* animation lifecycle coordination
* submenu navigation
* accessibility state synchronization
* drawer reset orchestration

The component behaves like a hierarchical navigation state machine layered on top of native browser disclosure primitives.

---

# High-Level Responsibility

The custom element:

1. Opens the primary mobile menu drawer
2. Opens nested submenu drawers
3. Closes menus/submenus
4. Handles Escape key interactions
5. Manages focus trapping for accessibility
6. Synchronizes `aria-expanded`
7. Coordinates animation timing
8. Prevents unwanted accordion animations during initial mount/open
9. Cleans up animated stacking contexts
10. Resets nested disclosure state after closing

---

# Component Declaration

```js
class HeaderDrawer extends Component
```

The class extends a custom base `Component` abstraction imported from:

```js
import { Component } from '@theme/component';
```

This likely provides:

* ref binding
* lifecycle normalization
* utility methods
* DOM querying helpers

This is not native `HTMLElement` directly, but probably wraps it.

---

# Imported Utilities

---

## Focus Utilities

```js
import { trapFocus, removeTrapFocus } from '@theme/focus';
```

These are accessibility helpers.

### `trapFocus`

Restricts keyboard focus inside the drawer.

Prevents:

* tabbing outside modal drawer
* keyboard escape into background UI

### `removeTrapFocus`

Restores normal document focus flow after drawer closes.

---

## Animation Utilities

```js
import {
  onAnimationEnd,
  removeWillChangeOnAnimationEnd
} from '@theme/utilities';
```

### `onAnimationEnd`

A helper abstraction around:

* `animationend`
* `transitionend`

Allows:

* waiting for UI animations to complete
* safely sequencing DOM operations afterward

### `removeWillChangeOnAnimationEnd`

Removes CSS `will-change` after animation completion.

This prevents:

* unnecessary compositor layers
* stacking context issues
* submenu z-index problems
* memory/performance overhead

---

# JSDoc Type Definition

```js
/**
 * @typedef {object} Refs
 * @property {HTMLDetailsElement} details
 * @property {HTMLDivElement} menuDrawer
 */
```

This defines required DOM references.

---

# Required Refs

```js
requiredRefs = ['details', 'menuDrawer'];
```

The base `Component` likely auto-populates:

```js
this.refs.details
this.refs.menuDrawer
```

from DOM attributes such as:

```html
<details ref="details">
<div ref="menuDrawer">
```

or equivalent data-ref mapping.

---

# Lifecycle: connectedCallback

```js
connectedCallback() {
  super.connectedCallback();

  this.addEventListener('keyup', this.#onKeyUp);
  this.#setupAnimatedElementListeners();
}
```

Runs when the custom element is attached to the DOM.

---

## `super.connectedCallback()`

Invokes base component initialization.

Likely:

* binds refs
* initializes observers
* hydrates behavior

---

## Escape Key Listener

```js
this.addEventListener('keyup', this.#onKeyUp);
```

Attaches keyboard handling to the drawer root.

Purpose:

* allow Escape-to-close behavior

---

## Animation Listener Setup

```js
this.#setupAnimatedElementListeners();
```

Initializes cleanup listeners for animated elements.

---

# Lifecycle: disconnectedCallback

```js
disconnectedCallback() {
  super.disconnectedCallback();
  this.removeEventListener('keyup', this.#onKeyUp);
}
```

Runs when element is removed from DOM.

Prevents:

* dangling listeners
* memory leaks

---

# Escape Key Handler

```js
#onKeyUp = (event) => {
  if (event.key !== 'Escape') return;

  this.#close(this.#getDetailsElement(event));
};
```

---

## Behavior

Only reacts to:

```js
Escape
```

Then:

1. Finds nearest relevant `<details>`
2. Closes it

This enables:

* submenu-level Escape closing
* root drawer Escape closing

depending on event origin.

---

# Open State Getter

```js
get isOpen() {
  return this.refs.details.hasAttribute('open');
}
```

Uses native `<details open>` state.

Important:

* no duplicated JS state
* browser remains source-of-truth

---

# Locating the Relevant Details Element

```js
#getDetailsElement(event)
```

---

## Purpose

Determines which disclosure context should be operated on.

This is critical because:

* drawer contains nested `<details>`
* submenu operations should target nearest disclosure ancestor

---

## Logic

```js
if (!(event?.target instanceof Element))
```

Fallback:

* root drawer details

Otherwise:

```js
event.target.closest('details')
```

Finds nearest submenu/root disclosure.

---

# Toggle

```js
toggle() {
  return this.isOpen ? this.close() : this.open();
}
```

Simple state inversion wrapper.

---

# Open Flow

```js
open(target, event)
```

This is the core drawer-opening orchestration.

---

# Step 1: Resolve Target Details

```js
const details = this.#getDetailsElement(event);
```

Determines:

* root drawer
* submenu drawer

---

# Step 2: Locate Summary

```js
const summary = details.querySelector('summary');
```

Needed because:

* `<summary>` controls disclosure semantics
* accessibility state must synchronize

---

# Step 3: Accessibility State

```js
summary.setAttribute('aria-expanded', 'true');
```

Keeps screen readers synchronized.

Native `<details>` alone is insufficient for robust accessibility support.

---

# Step 4: Prevent Initial Accordion Animations

```js
this.preventInitialAccordionAnimations(details);
```

Important UX optimization.

Without this:

* nested accordions animate during initial drawer open
* causes visual noise/jank

More on this later.

---

# Step 5: requestAnimationFrame

```js
requestAnimationFrame(() => {
```

Defers mutations to next frame.

Purpose:

* ensure browser commits previous layout
* avoid transition skipping
* guarantee animation triggers correctly

---

# Step 6: Open Class

```js
details.classList.add('menu-open');
```

Primary visual open-state class.

Likely triggers:

* translate animations
* opacity transitions
* pointer-events
* visibility

---

# Step 7: Submenu Tracking

```js
if (target) {
  this.refs.menuDrawer.classList.add(
    'menu-drawer--has-submenu-opened'
  );
}
```

Signals:

* submenu active
* root drawer styling changes

Possible uses:

* hide root menu
* shift panels
* alter transforms

---

# Step 8: Animation Synchronization

```js
const drawer = details.querySelector(
  '.menu-drawer, .menu-drawer__submenu'
);
```

Targets actual animated region.

---

# Step 9: Wait for Animation Completion

```js
onAnimationEnd(drawer || details, () => trapFocus(details))
```

Critical sequencing.

Focus trapping waits until:

* drawer fully visible
* animation complete

Avoids:

* focus jumping into hidden UI
* scroll glitches
* screen reader inconsistencies

---

# Back Navigation

```js
back(event) {
  this.#close(this.#getDetailsElement(event));
}
```

Closes nearest submenu.

This behaves like:

* submenu back button
* hierarchical navigation return

---

# Root Close

```js
close() {
  this.#close(this.refs.details);
}
```

Forces root drawer closure.

---

# Core Close Orchestration

```js
#close(details)
```

Most complex method.

Handles:

* submenu close
* root drawer close
* focus restoration
* nested disclosure reset

---

# Step 1: Locate Summary

```js
const summary = details.querySelector('summary');
```

Needed for ARIA synchronization.

---

# Step 2: Accessibility Update

```js
summary.setAttribute('aria-expanded', 'false');
```

Updates screen reader state.

---

# Step 3: Remove Open Class

```js
details.classList.remove('menu-open');
```

Triggers closing animations.

---

# Step 4: Reset Submenu State

```js
this.refs.menuDrawer.classList.remove(
  'menu-drawer--has-submenu-opened'
);
```

Removes submenu-active styling.

---

# Step 5: Select Animated Drawer

```js
const drawer = details.querySelector(
  '.menu-drawer, .menu-drawer__submenu'
);
```

Again:

* targets animation container only

---

# Important Firefox Optimization

Comment:

```js
// Wait for the .menu-drawer element's transition,
// not the entire details subtree
```

This is highly intentional.

If waiting on entire subtree:

* child accordions
* cards
* lazy animations

could delay close completion indefinitely.

Especially problematic in Firefox.

Using:

```js
{subtree: false}
```

limits listener scope.

---

# Step 6: Post-Animation Cleanup

```js
onAnimationEnd(..., () => {
```

Runs after drawer animation completes.

---

# Step 7: Reset Details

```js
reset(details);
```

Completely restores disclosure state.

---

# Step 8: Root vs Submenu Branching

```js
if (details === this.refs.details)
```

Critical distinction.

---

# Root Drawer Close Path

```js
removeTrapFocus();
```

Releases keyboard lock.

---

## Nested Details Cleanup

```js
const openDetails =
  this.querySelectorAll(
    'details[open]:not(accordion-custom > details)'
  );
```

Finds all lingering open disclosures.

---

## Reset Each

```js
openDetails.forEach(reset);
```

Ensures:

* all submenus collapse
* drawer reopens cleanly later

---

# Submenu Close Path

```js
trapFocus(this.refs.details);
```

When submenu closes:

* focus remains trapped inside root drawer
* accessibility continuity preserved

---

# Animation Listener Setup

```js
#setupAnimatedElementListeners()
```

---

# Purpose

Targets:

```js
.menu-drawer__animated-element
```

---

# Why?

Animated elements often use:

```css
will-change: transform;
```

This:

* creates compositor layers
* improves animation performance

But leaving it permanently:

* wastes memory
* creates stacking contexts
* breaks z-index layering

---

# Listener Registration

```js
element.addEventListener(
  'animationend',
  removeWillChangeOnAnimationEnd
);
```

Auto-cleans after animation.

---

# Prevent Initial Accordion Animations

```js
preventInitialAccordionAnimations(details)
```

One of the more subtle UX optimizations.

---

# Problem Being Solved

When drawer initially opens:

* nested accordions may animate unintentionally
* caused by DOM/layout changes

This creates:

* flickering
* expanding transitions
* visual instability

---

# Solution

Temporarily disable accordion animations.

---

# Step 1: Locate Accordion Content

```js
const content =
  details.querySelectorAll(
    'accordion-custom .details-content'
  );
```

---

# Step 2: Disable Animation

```js
element.classList.add(
  'details-content--no-animation'
);
```

Likely CSS:

```css
.details-content--no-animation {
  transition: none !important;
  animation: none !important;
}
```

---

# Step 3: Re-enable Later

```js
setTimeout(..., 100)
```

After initial render stabilizes:

* animations restored

This preserves:

* user-triggered accordion animations
* while preventing mount-time animations

---

# Custom Element Registration

```js
if (!customElements.get('header-drawer')) {
  customElements.define(
    'header-drawer',
    HeaderDrawer
  );
}
```

Prevents duplicate registration errors.

Important in:

* HMR/dev environments
* partial hydration
* script reinjection

---

# Reset Helper

```js
function reset(element)
```

Utility for restoring original disclosure state.

---

# What It Resets

---

## Remove Visual Open State

```js
element.classList.remove('menu-open');
```

---

## Remove Native Open Attribute

```js
element.removeAttribute('open');
```

Collapses disclosure.

---

## Reset Accessibility State

```js
element.querySelector('summary')
  ?.setAttribute('aria-expanded', 'false');
```

Synchronizes ARIA.

---

# Architectural Characteristics

---

# 1. Native Disclosure Driven

Uses:

* `<details>`
* `<summary>`

instead of fully synthetic state.

Benefits:

* accessibility
* browser semantics
* reduced JS complexity

---

# 2. Animation-Aware State Management

State transitions synchronized with:

* animation lifecycle
* transition completion

Not immediate mutations.

---

# 3. Hierarchical Navigation Model

Supports:

* nested submenu stacks
* localized close behavior
* recursive disclosure state

---

# 4. Accessibility-First Design

Implements:

* focus trapping
* Escape handling
* aria-expanded synchronization

---

# 5. CSS-Driven Visual State

JS primarily:

* toggles classes
* coordinates timing

CSS owns:

* layout
* animation
* transforms

---

# 6. Browser Quirk Mitigation

Contains explicit handling for:

* Firefox animation subtree issues
* stacking contexts
* initial transition glitches

---

# Conceptual State Machine

The component effectively behaves like:

```text
CLOSED
  ↓ open()
OPENING
  ↓ animation complete
OPEN
  ↓ submenu open
SUBMENU_OPEN
  ↓ back()
OPEN
  ↓ close()
CLOSING
  ↓ animation complete
CLOSED
```

With nested disclosure recursion layered underneath.

A focus trap cleanup ensures that keyboard navigation properly resets to the background once an overlay (such as a modal or popover) closes. Proper cleanup requires removing event listeners and returning focus to the element that triggered the modal, preventing lost focus or trapped tabbing.

1. The Component Unmount (React) In React, when using the widely popular focus-trap library via the focus-trap-react package, cleanup is handled automatically by simply unmounting the component.

```tsx
import React, { useState } from 'react';
import FocusTrap from 'focus-trap-react';

const MyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      {isOpen && (
        <FocusTrap>
          <div className="modal">
            <p>Here is some text</p>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </FocusTrap>
      )}
    </>
  );
};

```

2. Manual Cleanup (Vanilla JavaScript)If you are using the core focus-trap library directly without a framework wrapper, you must manually trigger the .deactivate() method when closing the overlay to clean up event listeners.

```js
import { createFocusTrap } from 'focus-trap';

const trap = createFocusTrap('#modal-element');

// Activate the trap when the modal opens
trap.activate();

// Deactivate and cleanup when the modal closes
trap.deactivate();

```

3. DOM Removal IssuesIf a currently-focused element is destroyed or removed from the DOM while the focus trap is still active, focus can jump unexpectedly. To safely remove elements and clean up your trap:First, shift focus to a stable element using HTMLElement.focus().Then, remove the element or unmount the component.For an in-depth visual guide on why cleanup functions are critical and how they operate behind the scenes in JavaScript:
