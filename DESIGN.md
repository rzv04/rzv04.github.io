# VLC-Whisper Website Design System

This file is the source of truth for the GitHub Pages visual system. The public page intentionally does **not** expose a design-system drawer or developer-only style controls.

## 1. Brand direction

VLC-Whisper should feel like native media software made by engineers: dark, restrained, product-first, and visibly open source. The visual language combines VLC orange, audio waveforms, captions, and desktop-media UI without drifting into generic purple/blue "AI SaaS" styling.

Core principles:

- Product first: show the real VLC experience before architecture or implementation detail.
- One accent: orange should communicate state, action, or audio activity—not decorate every surface.
- Local-first tone: privacy and on-device processing are visual concepts, not only copy.
- Calm technical density: use mono text for labels/state, not for normal paragraphs.
- Motion explains behavior: waveform → captions, seek → caption change, loading → content ready.
- Prefer stable, cheap rendering over ornamental GPU effects.

## 2. Logo

The logo is an inline SVG in `index.html`, so the page has no logo-file dependency.

Visual construction:

- Container: charcoal rounded square (`#242424`).
- Left motif: VLC orange waveform bars (`#F27A0B`).
- Right motif: three white caption lines.
- Meaning: **audio → captions**.

Do not recolor the waveform independently from the primary orange accent. Do not add gradients, outer glows, or drop shadows inside the mark.

## 3. Color tokens

The active theme is dark-only. Tokens live at the top of `style.css` under `:root`.

| Token | Value | Purpose |
| --- | --- | --- |
| `--bg` | `#0B0D0E` | Page background |
| `--bg-elev` | `#0E1113` | Elevated dark background |
| `--surface` | `#111416` | Controls / compact surfaces |
| `--surface-2` | `#171A1D` | Hover / secondary surface |
| `--surface-3` | `#202428` | Stronger raised surface |
| `--line` | `#2A3036` | Default border |
| `--line-strong` | `#5B6570` | Strong border / separator |
| `--text` | `#F5F6F7` | Primary text |
| `--text-2` | `#A8ADB4` | Secondary text |
| `--text-3` | `#858D96` | Tertiary / metadata text |
| `--orange-9` | `#F27A0B` | Primary VLC-Whisper accent |
| `--orange-10` | `#FF8B22` | Hover / bright accent |
| `--ink-on-orange` | `#14110E` | Text on solid orange |

### Contrast baseline

Calculated against the current palette:

| Pair | Ratio | Rule |
| --- | ---: | --- |
| Primary text / background | `18.0:1` | Safe for all text sizes |
| Secondary text / background | `8.6:1` | Safe for normal copy |
| Orange / background | `7.0:1` | Safe for accent text |
| Dark ink / orange | `6.8:1` | Use on orange CTAs |
| White / orange | `2.8:1` | Avoid for small/normal CTA text |

Primary orange buttons therefore use `--ink-on-orange`, not white.

## 4. Typography

Primary typeface: **Geist Variable**.  
Technical typeface: **Geist Mono Variable**.

Both are loaded from Fontsource via jsDelivr in `index.html`, with system fallbacks in `style.css`.

### Font stacks

```css
--font-sans: "Geist Variable", "Geist", "Inter", "SF Pro Display", "Segoe UI", ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-mono: "Geist Mono Variable", "Geist Mono", "SFMono-Regular", "Cascadia Code", "Roboto Mono", ui-monospace, monospace;
```

### Type scale

| Token / use | Size |
| --- | --- |
| `--fs-00` | `12px` — mono labels, kickers |
| `--fs-0` | `14px` — compact UI |
| `--fs-1` | `16px` — body |
| `--fs-2` | `18px` — lead copy |
| `--fs-3` | `22px` — component heading |
| `--fs-4` | `28px` — title |
| `--fs-5` | `clamp(36px, 4.6vw, 64px)` — section heading |
| Hero, desktop (`>980px`) | `clamp(57.6px, 4.1vw, 70.4px)` |
| Hero, narrow/tablet | `--fs-6`: `clamp(54.4px, 7.4vw, 108.8px)` before responsive layout collapses |

The desktop hero deliberately caps early to prevent one-word-per-line wrapping on 1080p laptops and wider displays.

### Typography rules

- Hero and section headings use tight negative tracking and short line-height.
- Body text uses generous line-height (`~1.65–1.72`).
- Mono is reserved for section indices, state labels, timestamps, technical metadata, and tags.
- Avoid all-caps for paragraph-length copy.

## 5. Spacing and layout

The system uses a 4px base unit.

```text
4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160, 192
```

CSS tokens:

```css
--s1: 4px;
--s2: 8px;
--s3: 12px;
--s4: 16px;
--s5: 24px;
--s6: 32px;
--s7: 48px;
--s8: 64px;
--s9: 96px;
--s10: 128px;
--s11: 160px;
--s12: 192px;
```

### Section rhythm

Major sections use **one spacing source only**:

- `padding-block: 0`
- one `margin-top: var(--section-space)` per major section
- desktop section gap: `clamp(80px, 8vw, 112px)`
- tablet section gap: `clamp(72px, 12vw, 96px)`

Do not add both bottom padding to the previous section and top margin to the next section.

### Container and grid

- Max content width: `1200px`.
- Desktop outer gutter: `24px` per side minimum.
- Tablet content max: `760px` with `16px` outer gutter.
- Mobile outer gutter: `14px`.
- Conceptual layout: 12-column desktop grid, simplified to explicit CSS grids per component.
- Main breakpoints: `980px` and `640px`.

## 6. Radius and borders

| Token | Value | Use |
| --- | ---: | --- |
| `--r-sm` | `8px` | Small controls |
| `--r-md` | `12px` | Buttons / compact UI |
| `--r-lg` | `16px` | Medium cards |
| `--r-xl` | `24px` | Feature cards / panels |
| `--r-2xl` | `32px` | Large CTA surfaces |
| `--r-pill` | `999px` | Status pills only |

Borders should normally use `--line`; stronger borders are reserved for active controls or diagrams. Orange borders are used sparingly for active state or privacy/flow emphasis.

## 7. Shadows and elevation

```css
--shadow-1: 0 1px 2px rgba(0,0,0,.34), 0 8px 24px rgba(0,0,0,.18);
--shadow-2: 0 2px 6px rgba(0,0,0,.42), 0 24px 70px rgba(0,0,0,.30);
--shadow-orange: 0 12px 40px rgba(242,122,11,.16);
```

Rules:

- Shadows remain neutral and low-chroma.
- Orange glow is reserved for primary actions or live audio state.
- Do not put large blurred shadows behind every card.
- Avoid `backdrop-filter` for the current implementation.

## 8. Motion

Motion is deliberately light and functional.

### Interaction timing

- Hover / compact UI: `180–280ms`.
- Section reveals: `750ms` using `cubic-bezier(.22,1,.36,1)`.
- Video skeleton shimmer: left-to-right, `300ms` loop, removed from the DOM once media is ready.
- Caption change in the seek demo: `220ms`.

### Signature animation

The recurring brand animation is **waveform → caption lines**. Use it in a small number of high-value areas only.

### Runtime rules

To avoid unnecessary CPU/GPU use:

- Continuous decorative animation only runs when its region is in the viewport.
- The hero video pauses when it leaves the viewport.
- The seek/caption simulation runs at 10 Hz, not every animation frame.
- The skeleton animation is stopped and its node removed after the video loads.
- `content-visibility: auto` is used on major off-screen sections.
- Avoid CSS `filter` on playing video.
- Avoid `backdrop-filter` over playing video.
- Avoid 3D transforms/perspective on the video shell.
- Avoid pointer-position-driven gradient repaints.
- Animate one waveform container rather than every individual bar.

The site includes a motion toggle and also respects `prefers-reduced-motion`.

## 9. Components

### Navigation

Desktop order mirrors page order:

1. How it works
2. Features
3. Privacy
4. Open source

The motion control and primary Download CTA sit on the right. Mobile uses the same information order.

### Hero

- Two-column desktop layout.
- Left: proposition, supporting copy, CTAs, compatibility pills.
- Right: VLC demo shell.
- Waveform and caption animation live **below the video player shell**, not over the video.
- The video must remain visually unobstructed.

### Feature bento

Use the bento layout only for capabilities; do not turn every section into a card grid.

The cards demonstrate behavior, not only label it:

- Transcribe: animated waveform resolving into caption lines.
- Private: local-processing shield.
- Control: seekable timestamped hardcoded captions with pause/resume.
- Performance: CPU → GPU/Vulkan speed gauge.
- Translate: compact language transformation visual.

### Settings mockup

The settings window is intentionally a demo surface:

- tabs are interactive;
- selects are real native controls;
- CPU thread count is a real number input;
- switches are interactive;
- the window close `X` shows a pointer cursor but does not close the mockup.

### Privacy

Privacy gets a full section. Use a local device boundary diagram instead of generic shield marketing copy alone.

## 10. Accessibility

- Normal text must meet WCAG AA contrast (`4.5:1` minimum).
- Orange CTAs use dark text for sufficient contrast.
- All meaningful icons are inline SVGs and do not depend on Unicode/icon fonts.
- Decorative SVGs are `aria-hidden`.
- Interactive controls receive explicit accessible labels and state.
- Settings tabs follow tab semantics and keyboard navigation.
- Seek timelines expose slider semantics and keyboard controls.
- Mobile navigation uses `aria-expanded`, `aria-hidden`, and `inert`.
- Reduced-motion users receive static/near-static alternatives.
- Reveal animations are progressive enhancement: page content remains visible if JavaScript or `IntersectionObserver` is unavailable.

## 11. Theming

Retheming should happen through `:root` variables first. Components should not introduce arbitrary new accent colors.

For a future light theme, do **not** simply invert the page. Define a separate semantic neutral scale and retest all contrast pairs. Keep the brand orange and logo unchanged unless the brand identity itself changes.

For the current site, `color-scheme: dark` is intentional.

## 12. File structure

```text
index.html     # semantic page markup + inline SVG sprite
style.css     # tokens, layout, components, responsive rules, motion styling
script.js      # media controls, animations, observers, mobile nav, settings demo
DESIGN.md      # this design/theming specification
.nojekyll      # prevents GitHub Pages from applying Jekyll processing
assets/        # existing repository assets (optional local demo-video source)
```

The page uses the demo video directly from the VLC-Whisper repository:

```text
https://raw.githubusercontent.com/rzv04/vlc-whisper/main/assets/vlc-whisper-demo%20%28720p%29.mp4
```

This keeps the Pages repository lightweight and avoids duplicating the media asset.

## 13. GitHub Pages deployment

Keep `index.html`, `style.css`, `script.js`, `DESIGN.md`, and `.nojekyll` in the publishing root of `rzv04/rzv04.github.io`.

GitHub Pages publishes the repository root at:

```text
https://rzv04.github.io/
```

The current canonical URL and `og:url` in `index.html` are set to that root URL.

Change both values if a custom domain is introduced later.
