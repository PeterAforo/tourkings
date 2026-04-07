# Design System Document: The Sovereign Voyager

## 1. Overview & Creative North Star
### The Creative North Star: "The Royal Navigator"
This design system is not a mere travel portal; it is a digital concierge that bridges the gap between Ghanaian heritage and global luxury. The "Royal Navigator" ethos translates into a visual language that is **authoritative, layered, and adventurous**. 

To move beyond the "template" look common in tourism, we employ **Editorial Asymmetry**. This means breaking the rigid 12-column grid with overlapping elements—such as imagery bleeding off the edge of the screen or high-contrast typography scales that demand attention. We lean into a "vibrant professional" aesthetic where deep royal blues provide the "trust," and sunset golds provide the "energy," all while using expansive white space to maintain a premium, high-end editorial feel.

---

## 2. Colors: Tonal Depth over Borders
The palette is rooted in the "TourKings" identity, utilizing Material Design tokens to create a sophisticated, high-contrast environment.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be defined solely through background color shifts. For instance, a `surface-container-low` (#fbf2ec) section should sit directly against a `surface` (#fff8f5) background. This creates a seamless, modern flow that feels organic rather than boxed-in.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers to create "nested" depth:
- **Level 0 (Base):** `surface` (#fff8f5)
- **Level 1 (Sectioning):** `surface-container-low` (#fbf2ec)
- **Level 2 (Cards/Interaction):** `surface-container-highest` (#eae1db)

### The Glass & Gradient Rule
To achieve a "signature" look:
- **Glassmorphism:** For floating navigation bars or overlays, use `surface` at 80% opacity with a `backdrop-blur` of 20px.
- **Signature Gradients:** For primary CTAs and hero sections, do not use flat colors. Use a linear gradient transitioning from `primary` (#003b7a) to `primary_container` (#1d5299) at a 135-degree angle. This adds "soul" and a sense of movement.

---

## 3. Typography: The Editorial Voice
We utilize a pairing of **Plus Jakarta Sans** for high-impact display and **Manrope** for technical readability.

*   **Display & Headlines (Plus Jakarta Sans):** These are our "Hooks." Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to create an authoritative, premium look. Headlines should feel like magazine titles.
*   **Body & Titles (Manrope):** Chosen for its modern, clean geometry. `body-lg` (1rem) provides a comfortable reading experience for travel itineraries.
*   **Tonal Authority:** Use `on_surface` (#1f1b18) for primary text. For secondary metadata or "Ghanaian Heritage" subtitles, use `secondary` (#865300) in all-caps with a 0.1em letter-spacing.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often a crutch for poor spacing. In this system, we prioritize **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." Place a `surface_container_lowest` (#ffffff) card on a `surface_container_low` (#fbf2ec) background. This creates a soft, natural lift.
*   **Ambient Shadows:** If a "floating" effect is mandatory (e.g., a booking modal), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(31, 27, 24, 0.06)`. The shadow color is a tinted version of `on_surface` to mimic natural light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline_variant` (#c3c6d2) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components: Bespoke Primitives

### Buttons
- **Primary:** Gradient (`primary` to `primary_container`), `rounded-md` (0.75rem), with `on_primary` text.
- **Secondary:** `surface_container_highest` background with `primary` text. No border.
- **Tertiary:** Pure text using `primary` color, bold weight, with a `secondary` (Gold) underline of 2px for a "Royal" accent.

### Cards (The "Adventure Tile")
- **Rule:** Forbid divider lines. 
- **Structure:** Use `spacing-6` (2rem) of vertical white space to separate the image, title, and price. 
- **Texture:** Incorporate a subtle Adinkra pattern (e.g., *Gye Nyame*) as a low-opacity watermark (3% opacity) in the background of cards to celebrate Ghanaian heritage.

### Input Fields
- **Style:** `surface_container_low` background with a `rounded-sm` (0.25rem) corner.
- **State:** On focus, the background shifts to `surface_container_lowest` with a 2px `primary` bottom-border only. This mimics high-end stationery.

### Additional Component: The "Heritage Path"
A custom progress tracker for multi-day tours. Instead of dots, use custom icons inspired by Ghanaian symbols, colored in `secondary` (Gold) to indicate completed stages.

---

## 6. Do's and Don'ts

### Do
*   **DO** use intentional asymmetry. Overlap a high-quality image of the Kakum National Park with a `display-md` headline.
*   **DO** use the `spacing-20` and `spacing-24` tokens for section margins. Breathing room is the hallmark of luxury.
*   **DO** ensure all "Gold" text (`secondary`) meets a 4.5:1 contrast ratio against the background. Use `on_secondary_container` (#694000) for smaller gold text to ensure readability.

### Don't
*   **DON'T** use 1px solid black or grey dividers. Separate content using the `surface_container` color shifts.
*   **DON'T** use the `full` roundedness (pills) for primary buttons. Stick to `md` (0.75rem) to maintain a "professional" rather than "playful" vibe.
*   **DON'T** crowd the UI. If you feel a section needs a border, it likely just needs more `spacing-8`.

---
*Document Ends*