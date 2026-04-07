# Brand Tokens

This file is the single source of truth for all design tokens used in Reframed.
All tokens must be reflected in `tailwind.config.ts` under `theme.extend`.
Never use raw hex colors, hardcoded font sizes, hardcoded weights, or hardcoded spacing values in UI code.

---

## Colors

| Token | Value | Usage |
|---|---|---|
| `color-bg` | `#FFFFFF` | Primary surface / page background |
| `color-bg-subtle` | `#F7F6F5` | Subtle warm gray surface (cards, panels) |
| `color-fg` | `#0F0F0F` | Primary text / high-contrast foreground |
| `color-fg-muted` | `#6B6B6B` | Secondary text, captions, metadata |
| `color-fg-faint` | `#ADADAD` | Placeholder text, disabled states |
| `color-border` | `#E5E4E2` | Default border / divider |
| `color-border-strong` | `#C9C8C6` | Emphasized border |
| `color-accent` | `#1A1A1A` | Interactive elements (buttons, links, focus rings) |
| `color-accent-hover` | `#333333` | Accent hover state |
| `color-overlay` | `rgba(0,0,0,0.48)` | Modal / lightbox backdrop |

> **Rule:** Accent is the only non-neutral color at MVP. Do not introduce brand colors beyond this palette without updating this file first.

---

## Typography

| Token | Value | Usage |
|---|---|---|
| `font-sans` | `Inter, ui-sans-serif, system-ui, -apple-system` | All UI text |
| `font-weight-regular` | `400` | Body copy |
| `font-weight-medium` | `500` | Labels, captions |
| `font-weight-semibold` | `600` | Headings, CTAs |
| `text-xs` | `0.75rem / 1rem` | Captions, badges |
| `text-sm` | `0.875rem / 1.25rem` | Secondary body, labels |
| `text-base` | `1rem / 1.5rem` | Primary body |
| `text-lg` | `1.125rem / 1.75rem` | Sub-headings |
| `text-xl` | `1.25rem / 1.75rem` | Section headings |
| `text-2xl` | `1.5rem / 2rem` | Page headings |
| `text-3xl` | `1.875rem / 2.25rem` | Hero / large display |

> **Rule:** No more than 3 font weights in any view. Do not add `font-bold` (700) or `font-light` (300).

---

## Spacing

All spacing follows a **4px base grid**. Only use the tokens below — never raw `px` values outside of border widths.

| Token | Value |
|---|---|
| `spacing-1` | `4px` |
| `spacing-2` | `8px` |
| `spacing-3` | `12px` |
| `spacing-4` | `16px` |
| `spacing-5` | `20px` |
| `spacing-6` | `24px` |
| `spacing-8` | `32px` |
| `spacing-10` | `40px` |
| `spacing-12` | `48px` |
| `spacing-16` | `64px` |
| `spacing-20` | `80px` |
| `spacing-24` | `96px` |

> Tailwind's default spacing scale (which is 4px-based) maps 1:1 to these tokens — use Tailwind utilities (`p-4`, `mt-6`, etc.) directly.

---

## Border Radius

One radius token applied consistently across the product.

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | `4px` | Chips, badges, small inputs |
| `radius-md` | `8px` | Buttons, cards, modals (default) |
| `radius-lg` | `12px` | Image containers, large cards |
| `radius-full` | `9999px` | Pills, avatars |

---

## Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.06)` | Subtle card elevation |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Floating panels, dropdowns |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, image viewer |

---

## Tailwind Config Mapping

Add the following to `tailwind.config.ts` under `theme.extend`:

```ts
colors: {
  bg: '#FFFFFF',
  'bg-subtle': '#F7F6F5',
  fg: '#0F0F0F',
  'fg-muted': '#6B6B6B',
  'fg-faint': '#ADADAD',
  border: '#E5E4E2',
  'border-strong': '#C9C8C6',
  accent: '#1A1A1A',
  'accent-hover': '#333333',
},
fontFamily: {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system'],
},
borderRadius: {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
},
boxShadow: {
  sm: '0 1px 2px rgba(0,0,0,0.06)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 8px 24px rgba(0,0,0,0.12)',
},
```
