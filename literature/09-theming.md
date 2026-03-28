<div align="center">

# 🎨 Chapter 9: Theming & Design System

**Beautiful by default. Customizable by design.**

</div>

---

[← Data & Excel](./08-data-excel.md) · [Back to Index](./README.md) · [Next: Keyboard Shortcuts →](./10-keyboard-shortcuts.md)

---

## Overview

The dashboard's visual identity is built on a comprehensive design system: CSS custom properties for theming, OKLCH color space for perceptual uniformity, glassmorphism for depth, and a three-font typography system for hierarchy.

---

## 🌙 Dark & Light Mode

Toggle between modes using the theme button (🌙 / ☀️) in the header or via the `useTheme` hook.

| Aspect | Dark Mode | Light Mode |
|--------|-----------|------------|
| **Background** | Deep navy (`oklch(0.13 0.015 270)`) | Near-white (`oklch(0.965 0.005 270)`) |
| **Cards** | Semi-transparent dark (`60% opacity`) | Semi-transparent white (`80% opacity`) |
| **Text primary** | `#e4e8f0` | `#1a1d2b` |
| **Text secondary** | `#8a90a8` | `#555c70` |
| **Text muted** | `#555c70` | `#8a90a8` |
| **Accent colors** | Brighter variants | Deeper variants |
| **Glass effect** | 5% white background | 55% white background |
| **Default** | ✅ Dark mode on first load | — |

> 💡 Theme preference is persisted in `localStorage` and applied before the first paint to prevent flash-of-wrong-theme (FOWT).

---

## 🎨 Color Palette

### Accent Colors

Six accent colors provide semantic meaning and visual variety:

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--accent-blue` | `#60a5fa` | `#3b82f6` | Meetings, time displays, primary actions |
| `--accent-purple` | `#a78bfa` | `#8b5cf6` | Tasks, settings icon, secondary accents |
| `--accent-green` | `#34d399` | `#10b981` | Done status, calm tone, success states |
| `--accent-amber` | `#fbbf24` | `#f59e0b` | Busy tone, travel events, medium priority |
| `--accent-pink` | `#f472b6` | `#ec4899` | Alert tone, focus blocks, destructive hints |
| `--accent-cyan` | `#22d3ee` | `#06b6d4` | Break events, gradient accents |

### OKLCH Color Space

The design system uses **OKLCH** (Oklch Lightness Chroma Hue) for core UI tokens. OKLCH provides perceptually uniform lightness, meaning a "50% lightness" blue and a "50% lightness" green actually *look* equally bright — unlike HSL.

```css
/* Example: Primary color in both modes */
:root     { --primary: oklch(0.55 0.18 265); }   /* hue 265 = blue-purple */
.dark     { --primary: oklch(0.70 0.18 265); }   /* same hue, higher lightness */
```

---

## 🪟 Glassmorphism

The dashboard's panels use a frosted-glass aesthetic:

```css
.glass {
  background: var(--glass-bg);           /* 5% white (dark) / 55% white (light) */
  backdrop-filter: blur(24px);           /* frosted effect */
  border: 1px solid var(--glass-border); /* subtle edge */
  box-shadow: var(--glass-shadow);       /* depth shadow */
  transition: all 0.2s ease;            /* smooth hover */
}

.glass:hover {
  background: var(--glass-bg-hover);     /* slightly more opaque */
  border-color: var(--glass-border-hover);
  box-shadow: var(--glass-shadow-hover); /* deeper shadow */
}
```

### Gradient Borders

Panels can use gradient borders for extra visual flair:

| Class | Gradient |
|-------|----------|
| `.gradient-border` | Blue → Purple → Green (default) |
| `.gradient-border-blue` | Blue → Cyan |
| `.gradient-border-purple` | Purple → Pink |
| `.gradient-border-green` | Green → Cyan |
| `.gradient-border-amber` | Amber → Pink |

Implemented using CSS mask-composite for a crisp 1px gradient stroke that glows on hover (45% → 80% opacity).

---

## ✏️ Typography System

Three fonts create a clear typographic hierarchy:

<table>
<thead>
<tr>
<th>Font</th>
<th>CSS Class</th>
<th>Variable</th>
<th>Usage</th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Plus Jakarta Sans</b></td>
<td><code>font-display</code></td>
<td><code>--font-display</code></td>
<td>Headings, panel titles, app name, nav labels, modal titles, stat labels, splash screen</td>
</tr>
<tr>
<td><b>Inter</b></td>
<td><code>font-sans</code></td>
<td><code>--font-sans</code></td>
<td>Body text, descriptions, email summaries, task titles — the workhorse font</td>
</tr>
<tr>
<td><b>JetBrains Mono</b></td>
<td><code>font-mono</code></td>
<td><code>--font-mono</code></td>
<td>Times, dates, stats numbers, the tagline, technical data</td>
</tr>
</tbody>
</table>

### Text Utilities

| Class | Effect |
|-------|--------|
| `.name-gradient` | Steel blue → silver → teal gradient text for the display name |
| `.gradient-text` | Blue → purple → green gradient for decorative headings |

---

## 🌊 Animated Mesh Background

Four blurred, slowly-floating orbs create ambient visual depth:

| Orb | Size | Color | Animation Duration |
|-----|------|-------|--------------------|
| **Orb 1** | 800px | Blue (`--mesh-1`) | 25s |
| **Orb 2** | 700px | Purple (`--mesh-2`) | 30s |
| **Orb 3** | 600px | Green (`--mesh-3`) | 22s |
| **Orb 4** | 500px | Pink (`--mesh-4`) | 28s |

Each orb uses `filter: blur(100px)` and a `float` keyframe animation that translates and scales in a figure-eight pattern. Orb opacities differ between dark mode (10–15%) and light mode (6–12%) for appropriate subtlety.

---

## 📜 Scrollbar Styling

Custom scrollbars match the theme:

```css
::-webkit-scrollbar         → 6px width
::-webkit-scrollbar-track   → transparent
::-webkit-scrollbar-thumb   → var(--glass-border), 3px radius
::-webkit-scrollbar-thumb:hover → var(--glass-border-hover)
```

The `.scrollbar-hide` utility class hides scrollbars entirely when needed.

---

## ✨ Custom Animations

| Animation | Class | Description |
|-----------|-------|-------------|
| `pulse-soft` | `.animate-pulse-soft` | Gentle opacity pulse (1 → 0.6 → 1, 2s loop) |
| `shimmer` | — | Background position sweep for loading effects |
| `float` | `.mesh-orb` | Translate + scale drift for background orbs |
| `fadeIn` | `animate-fade-in` | 0.5s ease-out opacity entrance |
| `slideUp` | `animate-slide-up` | 0.5s ease-out translate + opacity |
| `slideDown` | `animate-slide-down` | 0.3s ease-out for dropdowns |

---

[← Data & Excel](./08-data-excel.md) · [Back to Index](./README.md) · [**Next: Keyboard Shortcuts →**](./10-keyboard-shortcuts.md)
