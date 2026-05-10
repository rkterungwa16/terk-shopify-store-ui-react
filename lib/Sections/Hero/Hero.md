# Shopify Hero Liquid Template — Detailed Architectural Breakdown

## Overview

This Hero section is a highly dynamic, media-driven Shopify section that supports:

* Multiple desktop media slots
* Multiple mobile media slots
* Image/video switching
* Art-directed responsive imagery
* Mobile fallback logic
* Media stacking
* Blurred reflection rendering
* Dynamic responsive sizing
* Overlay systems
* Flexible layout/content positioning
* Full section linking
* Dynamic CSS variable generation
* Placeholder rendering
* Shopify Theme Editor compatibility

Architecturally, this component behaves like a fully configurable rendering engine rather than a simple Hero banner.

---

# 1. Core Architecture

The section is divided into 5 major layers:

| Layer                | Responsibility                           |
| -------------------- | ---------------------------------------- |
| Liquid State Engine  | Computes media/layout/rendering state    |
| Media Capture System | Builds reusable media fragments          |
| Hero Markup Layer    | Renders DOM structure                    |
| Styling System       | Handles responsive layout/visual effects |
| Theme Schema         | Defines Theme Editor configuration       |

---

# 2. Initial Liquid State Initialization

The component begins by initializing a large number of state variables.

```liquid
assign media_count = 0
assign media_count_mobile = 0
assign fallback_to_desktop = false
```

These variables are effectively acting as runtime state.

This section is emulating what would normally be:

```ts
const state = {
  mediaCount: 0,
  mediaCountMobile: 0,
  fallbackToDesktop: false
}
```

inside React.

---

## 2.1 Media Type Tracking

```liquid
assign media_1 = 'none'
assign media_2 = 'none'
assign media_1_mobile = 'none'
assign media_2_mobile = 'none'
```

These track the resolved media type for each slot.

Possible values:

| Value | Meaning                |
| ----- | ---------------------- |
| image | Slot contains an image |
| video | Slot contains a video  |
| none  | Slot is empty          |

This prevents repeatedly checking Theme settings later.

---

## 2.2 Video-Only Flags

```liquid
assign has_only_video = false
assign has_only_video_mobile = false
```

These flags exist because:

* blurred reflections only work for images
* videos should not generate blurred reflections
* image-specific effects must be conditionally disabled

This avoids expensive or visually broken rendering.

---

# 3. Desktop Media Resolution System

This is one of the most important systems.

The component validates:

1. Whether media exists
2. Whether the selected media type matches
3. Whether the slot should count as active

Example:

```liquid
if section.settings.image_1 != blank and section.settings.media_type_1 == 'image'
```

This is extremely important.

---

## Why Double Validation Exists

In Shopify Theme Editor:

* hidden settings are NOT cleared
* changing media type does NOT remove old values

Example:

User workflow:

1. Upload image
2. Switch to video mode
3. Old image still exists in settings

Without this check:

* image and video could both render
* state becomes inconsistent
* layout breaks

So the component validates:

```liquid
media exists
AND
selected type matches
```

This is defensive rendering logic.

---

## Media Counting

```liquid
assign media_count = media_count | plus: 1
```

The component tracks how many active media slots exist.

Possible outcomes:

| Count | Meaning             |
| ----- | ------------------- |
| 0     | No media            |
| 1     | Single media layout |
| 2     | Split media layout  |

This later affects:

* grid layout
* responsive sizing
* blurred reflections
* aspect ratio handling
* mobile stacking

---

# 4. Mobile Media Resolution

```liquid
if section.settings.custom_mobile_media
```

The section supports separate mobile media.

This creates a dual-rendering architecture:

| Platform | Media Source                    |
| -------- | ------------------------------- |
| Desktop  | image_1 / image_2               |
| Mobile   | image_1_mobile / image_2_mobile |

This is true art direction.

Not just responsive resizing.

The merchant can completely change:

* crop
* composition
* asset type
* aspect ratio
* even image ↔ video

between desktop and mobile.

---

# 5. Video-Only Detection

```liquid
if media_count > 0 and media_1 != 'image' and media_2 != 'image'
```

This determines whether:

* all media are videos
* image-based effects should be disabled

If true:

```liquid
assign has_only_video = true
```

This affects:

* blurred reflections
* background effects
* image processing

---

# 6. Media Wrapper Class System

```liquid
assign media_wrapper_desktop_class = 'hero__media-wrapper hero__media-wrapper--desktop'
assign media_wrapper_mobile_class = 'hero__media-wrapper hero__media-wrapper--mobile'
```

The component uses CSS-controlled visibility.

Instead of conditionally rendering only one version.

This enables:

* desktop/mobile media coexistence
* CSS media query switching
* art-directed rendering
* progressive enhancement

---

## Mobile Fallback Logic

```liquid
if section.settings.custom_mobile_media == false or section.settings.custom_mobile_media == true and media_count_mobile == 0
```

If mobile media is unavailable:

Desktop media becomes visible on mobile.

This is graceful degradation.

Without this:

* mobile could render blank
* layout could collapse

---

# 7. Blurred Reflection Decision Engine

This is one of the most sophisticated parts.

```liquid
assign show_mobile_blurred_reflection = false
```

The component determines whether blurred reflections should appear.

Conditions checked:

| Condition               | Why                        |
| ----------------------- | -------------------------- |
| Reflection enabled      | Feature toggle             |
| Mobile media exists     | Must have valid source     |
| Not video-only          | Blur works only for images |
| Desktop fallback active | Use desktop image instead  |

---

## Reflection Rendering Logic

The component supports:

| Scenario            | Reflection Source |
| ------------------- | ----------------- |
| Custom mobile image | Mobile image      |
| No mobile media     | Desktop image     |
| Desktop-only setup  | Desktop image     |

This prevents:

* missing reflections
* invalid blur rendering
* video blur artifacts

---

# 8. Responsive Width Calculation

```liquid
if media_1 == 'image' and media_2 == 'image'
  assign media_width_desktop = '50vw'
else
  assign media_width_desktop = '100vw'
endif
```

This dynamically computes responsive image sizing.

---

## Why This Exists

If:

* two images render side-by-side
* each image only occupies half viewport width

then loading full-width image variants wastes bandwidth.

So:

| Layout       | Image Width |
| ------------ | ----------- |
| Single media | 100vw       |
| Two images   | 50vw        |

This directly improves:

* Lighthouse performance
* image payload size
* responsive optimization
* LCP

---

# 9. Mobile Fallback Resolution

```liquid
if section.settings.custom_mobile_media == false or media_count_mobile == 0 or media_count == 0
```

This activates desktop fallback.

Then:

```liquid
assign media_count_mobile = media_count
assign fallback_to_desktop = true
```

Meaning:

* mobile inherits desktop layout
* grid remains consistent
* rendering stays stable

---

# 10. Mobile Layout Width Logic

```liquid
elsif section.settings.stack_media_on_mobile or media_1_mobile != 'image' or media_2_mobile != 'image'
```

If:

* stacking enabled
* videos exist
* non-image combinations exist

then mobile media becomes:

```liquid
100vw
```

Otherwise:

```liquid
50vw
```

This controls responsive image generation.

---

# 11. Responsive Image Size System

```liquid
assign sizes = '(min-width: 750px) ' | append: media_width_desktop | append: ', ' | append: media_width_mobile
```

This generates the HTML `sizes` attribute.

Example output:

```html
sizes="(min-width: 750px) 50vw, 100vw"
```

This tells browsers:

| Screen  | Expected Width |
| ------- | -------------- |
| Desktop | 50vw           |
| Mobile  | 100vw          |

This is critical for:

* responsive image selection
* network optimization
* preventing oversized downloads

---

# 12. Fetch Priority Optimization

```liquid
if section.index == 1
  assign fetch_priority = 'high'
endif
```

The first Hero section is likely:

* above-the-fold
* LCP candidate

So the component boosts fetch priority.

Equivalent HTML:

```html
fetchpriority="high"
```

This improves:

* Largest Contentful Paint
* perceived loading speed
* Core Web Vitals

---

# 13. Media Capture Architecture

The component uses:

```liquid
{% capture media_slot_1 %}
```

This creates reusable template fragments.

Equivalent React concept:

```tsx
const mediaSlot1 = renderMediaSlot(...)
```

Benefits:

* reusable rendering
* isolated media logic
* cleaner final markup
* composability

---

# 14. Picture Element Art Direction

```liquid
<picture>
```

This is extremely important.

The component is NOT simply resizing images.

It supports:

* separate desktop image
* separate mobile image

using true browser-native art direction.

---

## Source Tag Logic

```liquid
<source media="(max-width: 749px)" srcset="...">
```

This means:

| Viewport | Asset Used     |
| -------- | -------------- |
| Mobile   | image_1_mobile |
| Desktop  | image_1        |

The browser selects the correct asset.

This is superior to:

* CSS background images
* JS viewport swapping
* hidden image techniques

because the browser optimizes loading itself.

---

# 15. Shopify Image Pipeline

```liquid
| image_url: width: 3840
```

This requests Shopify CDN resizing.

Shopify dynamically generates optimized image variants.

Then:

```liquid
| image_tag:
```

automatically generates:

* srcset
* width
* height
* lazy loading behavior
* decoding optimizations

This leverages Shopify's responsive image infrastructure.

---

# 16. Width Descriptor Generation

```liquid
widths: widths
```

Where:

```liquid
assign widths = '832, 1200, 1600, 1920, 2560, 3840'
```

Shopify generates multiple CDN image variants.

Equivalent output:

```html
srcset="... 832w, ... 1200w"
```

This enables responsive image negotiation.

---

# 17. Video Rendering System

```liquid
| video_tag:
```

Renders Shopify-hosted videos.

Configuration:

| Setting         | Purpose               |
| --------------- | --------------------- |
| autoplay        | Auto playback         |
| loop            | Infinite playback     |
| muted           | Required for autoplay |
| controls: false | Decorative media      |
| poster: nil     | No poster image       |

This creates cinematic background videos.

---

# 18. Mobile-Only Media Logic

```liquid
if media_1_mobile == 'image' and media_1 != 'image'
```

This handles cross-type art direction.

Example:

| Desktop | Mobile |
| ------- | ------ |
| Video   | Image  |

Instead of using `<picture>`, the component renders separate wrappers.

Because `<picture>` only works for images.

---

# 19. Placeholder System

```liquid
{{ 'hero-apparel-1' | placeholder_svg_tag: 'hero__media' }}
```

If no media exists:

* placeholder SVG renders
* layout remains stable
* theme preview stays usable

Critical for Theme Editor UX.

---

# 20. Blurred Reflection Rendering

```liquid
{% capture media_blurred %}
```

This builds a duplicate media layer.

The duplicate is later:

* blurred
* masked
* scaled
* partially transparent

This creates the glow/reflection effect.

---

# 21. Mobile Reflection Priority Logic

This section contains advanced prioritization.

When media stacking is enabled:

```liquid
if media_2_mobile == 'image'
```

The component prioritizes the bottom image.

Why?

Because:

* bottom image is more visually dominant
* reflection should represent visible terminal media

This is subtle UX design logic.

---

# 22. Root Hero Container

```liquid
<div id="Hero-{{ section.id }}">
```

The root container dynamically injects:

* unique IDs
* color scheme classes
* responsive modifiers
* mobile stacking classes

---

## Dynamic CSS Variables

The component injects runtime CSS variables.

Example:

```liquid
--hero-border-width: {{ section.settings.border_width }}px;
```

This creates a runtime styling system.

Equivalent React:

```tsx
style={{
  '--hero-border-width': `${borderWidth}px`
}}
```

---

# 23. Dynamic Height System

The Hero supports:

| Mode        | Behavior            |
| ----------- | ------------------- |
| auto        | Media-driven        |
| small       | Preset variable     |
| medium      | Preset variable     |
| large       | Preset variable     |
| full-screen | 100svh              |
| custom      | Arbitrary svh value |

---

## Why `svh` Is Used

```css
100svh
```

instead of:

```css
100vh
```

This avoids mobile browser viewport bugs.

Especially on:

* Safari iOS
* Chrome Android

This is a modern viewport strategy.

---

# 24. Shopify Visual Preview Mode

```liquid
if request.visual_preview_mode
```

Used by Shopify Theme Editor.

Adds:

```html
data-shopify-visual-preview
```

This allows preview-specific styling.

---

# 25. Blur Shadow Data Attribute

```liquid
data-blur-shadow="true"
```

Enables reflection-related CSS.

Instead of toggling classes.

This creates clean state-based styling.

---

# 26. Blurred Reflection Layer

```liquid
.hero__blurred-image
```

This layer:

* sits behind Hero
* uses transformed duplicate media
* creates glow illusion

Core techniques:

| Technique  | Purpose             |
| ---------- | ------------------- |
| blur()     | Soft reflection     |
| saturate() | Vibrancy boost      |
| mask-image | Gradient fade       |
| scale()    | Enlarged diffusion  |
| opacity    | Reflection subtlety |

---

# 27. Full-Width Media Architecture

```liquid
section--full-width
```

Media ALWAYS spans full width.

But:

```liquid
hero__content-wrapper
```

may be constrained.

This creates:

* edge-to-edge media
* centered readable content

Classic modern Hero architecture.

---

# 28. Full-Hero Link Layer

```liquid
<a class="hero__link"></a>
```

An invisible absolute-positioned link overlays the entire Hero.

Benefits:

* fully clickable banners
* preserved semantic link behavior
* accessible navigation

---

# 29. Media Grid System

```liquid
.hero__media-grid
```

The Hero media uses CSS Grid.

Desktop:

```css
grid-template-columns: repeat(var(--hero-media-count, 1), 1fr);
```

Meaning:

| Media Count | Layout        |
| ----------- | ------------- |
| 1           | Single column |
| 2           | Split columns |

---

# 30. Overlay Rendering

```liquid
render 'overlay'
```

Optional overlay layer.

Supports:

| Mode     | Behavior         |
| -------- | ---------------- |
| solid    | Single color     |
| gradient | Directional fade |

Used for:

* text readability
* cinematic effects
* contrast control

---

# 31. Content Wrapper System

```liquid
layout-panel-flex
```

The Hero content system is flexbox-based.

Supports:

| Feature            | Purpose              |
| ------------------ | -------------------- |
| row/column         | Layout direction     |
| mobile-column      | Responsive stacking  |
| alignment controls | Flexible positioning |
| width constraints  | Page/full width      |

---

# 32. Block Rendering

```liquid
{% content_for 'blocks' %}
```

This is Shopify's block rendering engine.

The Hero becomes a dynamic composition container.

Blocks may include:

* headings
* buttons
* groups
* logos
* marquees
* spacers

This makes the section CMS-driven.

---

# 33. CSS Architecture

The stylesheet is highly performance-oriented.

---

## Header Offset Logic

```css
body:has(> #header-group > .header-section > #header-component)
```

This dynamically offsets Hero height.

If a sticky header exists.

Uses modern:

```css
:has()
```

selector.

---

# 34. Absolute Media Layering

```css
.hero__media-grid {
  position: absolute;
  inset: 0;
}
```

Media becomes a background layer.

While content remains positioned above it.

This creates:

* overlayed text
* independent layout control
* cinematic composition

---

# 35. Auto Height Mode

```css
.hero--auto .hero__media {
  aspect-ratio: var(--hero-media-aspect-ratio);
}
```

When height is auto:

media determines Hero height.

This prevents layout collapse.

---

# 36. No-Block Auto Height Optimization

```css
.hero--no-blocks-auto-height
```

Special handling for:

* image-only Heroes
* no content blocks
* auto height

Without this:

absolute positioning would collapse layout height.

---

# 37. Media Visibility Switching

Desktop:

```css
.hero__media-wrapper--desktop {
  display: block;
}
```

Mobile:

```css
@media screen and (max-width: 749px)
```

Desktop wrappers become hidden.

Mobile wrappers become visible.

This powers art direction.

---

# 38. Mobile Stack Mode

```css
.hero--stack-mobile .hero__media-grid
```

Instead of columns:

mobile media becomes vertically stacked rows.

Rows computed dynamically:

```css
repeat(var(--hero-media-count-mobile, 1), calc(100% / var(--hero-media-count-mobile, 1)))
```

Meaning:

| Count | Rows      |
| ----- | --------- |
| 1     | 100%      |
| 2     | 50% + 50% |

---

# 39. Pointer Event Strategy

```css
pointer-events: none;
```

Applied to:

* media grid
* content wrapper

Then selectively restored.

Why?

The Hero may contain:

* overlay links
* buttons
* nested links
* interactive blocks

This avoids click conflicts.

---

# 40. Design Mode Exception

```css
.hero__content-wrapper--design-mode * {
  pointer-events: auto;
}
```

In Shopify Theme Editor:

all interactions must remain editable.

Otherwise editor interactions break.

---

# 41. Reflection Visual System

```css
.hero[data-blur-shadow='true']
```

Defines reusable effect variables.

Including:

| Variable    | Purpose               |
| ----------- | --------------------- |
| filter-blur | Blur strength         |
| scale       | Reflection diffusion  |
| mask-image  | Fade-out mask         |
| opacity     | Reflection visibility |

---

# 42. Reflection Rendering Mechanics

```css
transform: translateY(50%);
```

Moves reflection downward.

Combined with:

```css
blur(20px)
```

and:

```css
mask-image
```

Creates atmospheric glow.

---

# 43. Multi-Image Reflection Logic

```css
&:not(:only-child)
```

If two images exist:

reflection layer splits into halves.

Ensuring reflection mirrors actual layout.

---

# 44. Schema Architecture

The schema is enormous because this Hero is highly modular.

The schema powers:

* Theme Editor UI
* validation
* conditional controls
* defaults
* presets

---

# 45. Conditional Theme Editor Visibility

Example:

```json
"visible_if": "{{ section.settings.media_type_1 == 'image' }}"
```

This dynamically shows/hides controls.

The UI adapts based on current configuration.

---

# 46. Media Architecture Philosophy

The component is designed around:

## Progressive Enhancement

If mobile assets are absent:

* desktop assets still work

---

## Art Direction

Desktop/mobile media may differ completely.

---

## Performance Optimization

Responsive image sizes are dynamically calculated.

---

## CMS Flexibility

Everything is merchant-configurable.

---

## Graceful Degradation

Fallbacks prevent broken layouts.

---

# 47. React Architecture Equivalent

A modern React implementation would likely split into:

| Component             | Responsibility            |
| --------------------- | ------------------------- |
| Hero                  | Main orchestrator         |
| HeroMediaGrid         | Media layout              |
| HeroMediaSlot         | Single media renderer     |
| HeroImage             | Responsive image handling |
| HeroVideo             | Video rendering           |
| HeroBlurredReflection | Reflection layer          |
| HeroOverlay           | Overlay system            |
| HeroContent           | Content layout            |

---

# 48. Recommended React State Shape

```ts
interface HeroState {
  mediaCount: number
  mediaCountMobile: number
  fallbackToDesktop: boolean
  hasOnlyVideo: boolean
  hasOnlyVideoMobile: boolean
  showMobileBlurredReflection: boolean
}
```

---

# 49. Recommended React Media Model

```ts
interface HeroMedia {
  type: 'image' | 'video' | 'none'
  desktop?: MediaAsset
  mobile?: MediaAsset
}
```

---

# 50. Core Engineering Patterns Used

This Hero uses several advanced frontend engineering patterns.

| Pattern                      | Purpose                          |
| ---------------------------- | -------------------------------- |
| State derivation             | Compute rendering conditions     |
| Defensive rendering          | Prevent stale Theme Editor state |
| Art direction                | Separate mobile/desktop media    |
| Progressive enhancement      | Graceful fallback behavior       |
| Runtime CSS variables        | Dynamic styling                  |
| Responsive image negotiation | Performance optimization         |
| Layered composition          | Overlay architecture             |
| CMS-driven rendering         | Shopify block system             |
| Feature flags                | Conditional rendering            |
| Visual effect isolation      | Reflection layer                 |

---

# 51. Performance Characteristics

This Hero is heavily optimized.

Key optimizations:

| Optimization             | Benefit                     |
| ------------------------ | --------------------------- |
| Dynamic sizes attr       | Smaller downloads           |
| Responsive srcset        | Optimal image selection     |
| fetchpriority            | Better LCP                  |
| Conditional reflections  | Reduced rendering cost      |
| Video-only detection     | Prevent unnecessary effects |
| Art direction            | Better mobile assets        |
| CSS visibility switching | Reduced JS complexity       |
| Placeholder SVG          | Layout stability            |

---

# 52. Architectural Complexity Level

This is NOT a simple Hero component.

Complexity level:

| Area                     | Complexity |
| ------------------------ | ---------- |
| Media rendering          | High       |
| Responsive behavior      | High       |
| Theme Editor integration | High       |
| Styling system           | High       |
| Performance optimization | Advanced   |
| Art direction support    | Advanced   |

---

# 53. Overall Design Philosophy

This Hero section is architected like a configurable rendering engine.

Primary priorities:

1. Merchant flexibility
2. Responsive art direction
3. Performance optimization
4. Theme Editor resilience
5. Visual sophistication
6. Layout adaptability
7. Progressive enhancement
8. Runtime configurability

It is essentially a CMS-driven media orchestration system wrapped inside a Hero section abstraction.
