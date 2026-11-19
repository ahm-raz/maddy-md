---
name: Maddy MD
description: A desktop reading room for folders of Markdown and text files, staged as a paper theatre.
colors:
  deep: "#0d0c22"
  wing: "#171832"
  wing-ink: "#e8eaf5"
  wing-muted: "#9d9eaf"
  wing-faint: "#999aa9"
  wing-line: "#32334b"
  wing-hover: "#262740"
  wing-press: "#303149"
  wing-sel: "#443837"
  wing-accent: "#f6b84d"
  wing-field: "#121327"
  sheet: "#161822"
  sheet-ink: "#e4e6ee"
  sheet-muted: "#9a9ca5"
  sheet-border: "#31333d"
  sheet-border-strong: "#474953"
  sheet-panel: "#1f212b"
  sheet-panel2: "#292b34"
  sheet-code: "#242630"
  accent: "#f6b84d"
  accent-fill: "#efb146"
  accent-ink: "#1d1406"
  accent-soft: "#352e28"
  selection: "#59482f"
  ok: "#67d283"
  warn: "#efa831"
  err: "#fe968e"
  info: "#74bffd"
  note: "#c4a4fc"
  stage: "#251a55"
typography:
  display:
    fontFamily: "'Bricolage Grotesque Variable', 'Atkinson Hyperlegible Next Variable', 'Segoe UI', sans-serif"
    fontSize: "2.5em"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "'Bricolage Grotesque Variable', 'Atkinson Hyperlegible Next Variable', 'Segoe UI', sans-serif"
    fontSize: "1.5em"
    fontWeight: 650
    lineHeight: 1.18
    letterSpacing: "-0.015em"
  title:
    fontFamily: "'Bricolage Grotesque Variable', 'Atkinson Hyperlegible Next Variable', 'Segoe UI', sans-serif"
    fontSize: "1.22em"
    fontWeight: 650
    lineHeight: 1.18
    letterSpacing: "-0.015em"
  body:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.4
  label-sm:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
    lineHeight: 1.4
  label-xs:
    fontFamily: "'Atkinson Hyperlegible Next Variable', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 600
    lineHeight: 1.4
  mono:
    fontFamily: "'Atkinson Hyperlegible Mono Variable', 'Cascadia Code', Consolas, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.75
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  tab: "9px"
  pill: "999px"
spacing:
  control: "30px"
  row: "30px"
  row-compact: "26px"
  row-roomy: "34px"
  side: "270px"
  right-panel: "292px"
  sheet-x: "64px"
  sheet-top: "56px"
  sheet-gap: "28px"
  measure: "860px"
components:
  button:
    backgroundColor: "{colors.wing-hover}"
    textColor: "{colors.wing-ink}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "30px"
  button-hover:
    backgroundColor: "{colors.wing-press}"
  button-primary:
    backgroundColor: "{colors.accent-fill}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "30px"
  button-icon:
    textColor: "{colors.wing-muted}"
    rounded: "{rounded.sm}"
    size: "30px"
  button-icon-hover:
    backgroundColor: "{colors.wing-hover}"
    textColor: "{colors.wing-ink}"
  input:
    backgroundColor: "{colors.wing-field}"
    textColor: "{colors.wing-ink}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "30px"
  segment-on:
    backgroundColor: "{colors.accent-fill}"
    textColor: "{colors.accent-ink}"
    rounded: "4px"
    height: "24px"
  tab:
    textColor: "{colors.wing-faint}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.tab}"
    padding: "0 6px 0 12px"
    height: "33px"
    width: "216px"
  tab-active:
    backgroundColor: "{colors.wing}"
    textColor: "{colors.wing-ink}"
  tree-row:
    textColor: "{colors.wing-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "30px"
  tree-row-hover:
    backgroundColor: "{colors.wing-hover}"
    textColor: "{colors.wing-ink}"
  tree-row-active:
    backgroundColor: "{colors.wing-sel}"
    textColor: "{colors.wing-ink}"
  chip:
    textColor: "{colors.wing-muted}"
    typography: "{typography.label-xs}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  chip-on:
    backgroundColor: "{colors.wing-sel}"
    textColor: "{colors.wing-ink}"
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.sheet-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "56px 64px 120px"
    width: "860px"
  menu:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.sheet-ink}"
    rounded: "{rounded.md}"
    padding: "5px"
  toast:
    backgroundColor: "{colors.wing-ink}"
    textColor: "{colors.wing}"
    rounded: "{rounded.md}"
    padding: "9px 16px"
---

# Design System: Maddy MD

This file records the system as built in `src/ui.css`, `src/themes.js`, `src/scenes.js`, `src/icons.js` and `src/index.html`. Colour values in the frontmatter are the resolved tokens for the default theme (Orbit, sheet tone "match the theme"). Every other theme produces the same token names with different values; the derivation in "Colors" is the normative part, not the Orbit hex codes.

## Overview

**Creative North Star: "The Paper Theatre"**

The window is a shadow-box stage. Each theme is a cut-paper diorama behind the reading column, and the document is a sheet of paper standing in front of it. The shell panels are called wings: flat stock colour, divided from each other by one hairline. The reader picks a room in the Customize drawer and then reads; the theme changes the room and never the legibility of the text.

The system has two surfaces with separate token families. Wing tokens (`--deep`, `--wing`, `--wing-*`) colour the shell: tab strip, icon rail, page tree, document bar, right panel, drawers, status bar. Sheet tokens (`--bg`, `--text`, `--muted`, `--border`, `--panel`, `--accent`, ...) colour the paper: the reading sheet, the editor, menus, the command palette, popovers. A light sheet can sit inside a dark shell and the reverse, so a component must take all of its colours from one family, the family of the surface it sits on.

Density is desktop-app density: 30px controls, 30px tree rows, 13.5px interface text, 16.5px reading text at a 860px measure. Nothing decorative is added to the shell. The only pictures are the stage scene, the small scene at the foot of the page tree, and the theme thumbnails.

**Key Characteristics:**
- Two token families, wing and sheet, generated per theme by `themeTokens()` in `src/themes.js`. `ui.css` contains no theme colours.
- Wings are flat and meet at a 1px seam in `--wing-line`.
- Shadow marks paper lying on the stage: the sheet, the editor, sticky notes, menus, the finish bar, the study sign.
- Study status is a 9px shape (hollow, half, solid), never a colour.
- 15 themes, each with a scene drawn in code from 11 paper stocks. 13 have original characters, 2 are plain layered paper.
- Icons are one in-house 24px stroke set. Emoji appear only as page icons the reader chose for their own pages.
- Motion uses three durations and three easing curves, and can be reduced or switched off.

## Colors

All colour is generated. A theme supplies a neutral hue, two shell stocks, an accent and 11 scene stocks; `themeTokens(t, opts)` turns those into the CSS custom properties below and `applyTheme(S)` writes them inline on `<html>`, together with `data-theme`, `data-dark`, `data-wing` and `color-scheme`.

### Theme inputs (`THEMES` in `src/themes.js`)

| Field | Type | Meaning |
|---|---|---|
| `h` | hue in degrees | Neutral hue. Tints the sheet, the sheet ink and the wing ink. |
| `wing` | `[L, C, H]` OKLCH | Main shell stock. The shell counts as dark when `wing[0] < 0.5`. |
| `deep` | `[L, C, H]` OKLCH | Deepest shell stock: tab strip, icon rail, status bar, canvas bar. |
| `accent` | `[L, C, H]` OKLCH | Accent source. Replaced by the reader's custom accent when one is set. |
| `dark` | boolean | Default tone of the reading sheet. The reader can override it with "Reading sheet": light or dark paper. |
| `st` | 11 hex stocks | The scene's paper stocks (see "Scene stocks"). |

`Color.hex(L, C, H)` converts OKLCH to sRGB and reduces chroma by 8% per step (up to 24 steps) until the colour is in gamut. `Color.mix(a, b, t)` is a linear sRGB mix. `Color.ensure(fg, bg, min, toward)` mixes `fg` 12% toward `toward` per step (up to 20 steps) until it reaches `min` contrast against `bg`.

### Primary

- **Accent fill** (`--accent-fill`, `accent-fill`): the one filled colour. Primary buttons, the selected segment, checked task boxes, the vault badge, the resume flag. `hex(L, aC, aH)` with L clamped to at least 0.70 on dark paper and at most 0.62 on light paper. A custom accent is used as given.
- **Accent ink** (`--accent-ink`, `accent-ink`): text and icons on accent fill. `hex(0.2, 0.03, aH)` when the fill's luminance is above 0.36, otherwise white. The fill is then adjusted until this pair clears 4.6:1.
- **Sheet accent** (`--accent`, `accent`): links, caret, focus ring on paper surfaces. `hex(0.82 | 0.47, min(aC, 0.14 | 0.19), aH)` (dark | light sheet), then walked toward the sheet ink until it reaches 5:1 on the sheet.
- **Wing accent** (`--wing-accent`, `wing-accent`): the same recipe computed against the wing, floor 4.6:1. Focus ring in the shell, current outline stop, unsaved dot, reading bar, resize seams on hover.
- **Accent soft** (`--accent-soft`, `accent-soft`) and **Selection** (`--sel`, `selection`): sheet mixed 14% and 30% toward the sheet accent. Tag pills, selected palette row, text selection.

### Secondary

Five fixed-hue signal colours for the sheet, each `hex(0.78 | 0.5, 0.15, H)` walked to 4.5:1 on the sheet. They colour callouts and syntax highlighting; they are not interface accents.

- **Ok** (`--ok`, H 150): success and tip callouts, strings in code.
- **Warn** (`--warn`, H 75): warning callouts, numbers in code, the star mark, `==highlight==` (30% over the sheet).
- **Err** (`--err`, H 25): danger callouts, destructive menu items, Mermaid errors, attributes in code.
- **Info** (`--info`, H 245): default callout hue, function names in code.
- **Note** (`--note`, H 300): keywords in code.

### Neutral

Wing family (shell):

- **Deep** (`--deep`): `theme.deep`. Body background, tab strip, icon rail, status bar.
- **Wing** (`--wing`): `theme.wing`. Sidebar, document bar, right panel, drawers, active tab.
- **Wing ink** (`--wing-ink`): `hex(0.94, 0.015, h)` on a dark wing, `hex(0.26, 0.03, h)` on a light wing.
- **Wing muted** (`--wing-muted`): wing ink mixed 36% toward wing, floor 4.6:1 on wing. Secondary text and resting icons on the wing.
- **Wing faint** (`--wing-faint`): wing ink mixed 36% toward deep, floor 4.6:1 on deep. Text and icons that sit on `--deep` (inactive tabs, rail icons, status bar).
- **Wing line** (`--wing-line`): wing mixed 13% toward wing ink. Every seam and control border in the shell.
- **Wing hover / press** (`--wing-hover`, `--wing-press`): wing mixed 7% and 12% toward wing ink.
- **Wing selected** (`--wing-sel`): wing mixed 20% toward wing accent. Current tree row, lit toolbar button, selected chip.
- **Wing field** (`--wing-field`): wing mixed 22% toward black (dark wing) or 55% toward white (light wing). Inputs, the search box, segmented-control wells.

Sheet family (paper):

- **Sheet** (`--bg`): `hex(0.212, 0.02, h)` dark, `hex(0.987, 0.006, h)` light.
- **Sheet ink** (`--text`): `hex(0.925, 0.012, h)` dark, `hex(0.25, 0.025, h)` light.
- **Sheet muted** (`--muted`): ink mixed 36% toward sheet, floor 4.8:1.
- **Border / strong** (`--border`, `--border-strong`): sheet mixed 13% and 24% toward ink.
- **Panel / panel 2** (`--panel`, `--panel2`; `--bg2` equals `--panel`): sheet mixed 4.5% and 9% toward ink. Table heads, embeds, Mermaid wells, hover fills on paper.
- **Code** (`--code`): sheet mixed 7% (dark) or 4% (light) toward ink.

Stage and shadow:

- **Stage** (`--stage`): `st.sky2`. Background of the stage before the scene paints, and the veil colour in calm mode.
- **Shadow / shadow soft** (`--shadow`, `--shadow-soft`): `rgba(0,0,0,.5)` and `rgba(0,0,0,.32)` when the sheet or the wing is dark; `rgba(46,34,72,.22)` and `rgba(46,34,72,.12)` when both are light.

### Scene stocks (`theme.st`)

| Key | Use |
|---|---|
| `sky1`, `sky2` | Top and bottom of the sky. `sky2` is also `--stage`. |
| `far`, `mid`, `near` | The three ridge layers, back to front. |
| `star` | Stars, moons, window lights, light rays. |
| `a`, `b`, `c` | Three object colours. `a` is normally the character's body. |
| `w` | Light paper: bellies, clouds, highlights. |
| `k` | Dark paper: eyes, mouths, silhouettes. |

Shades inside a sprite are made with `mixc(stock, c.k, t)` or `mixc(stock, c.w, t)`, so a sprite recolours with its theme.

### Contrast floors enforced in code

| Pair | Floor |
|---|---|
| `--accent` on `--bg` | 5:1 |
| `--muted` on `--bg` | 4.8:1 |
| `--wing-muted` on `--wing`, `--wing-faint` on `--deep`, `--wing-accent` on `--wing` | 4.6:1 |
| `--ok`, `--warn`, `--err`, `--info`, `--note` on `--bg` | 4.5:1 |

Measured across the 15 themes, sheet ink on sheet is 14.1:1 to 15.5:1 and wing ink on wing is 12.4:1 to 14.4:1.

### Named Rules

**The Stock Rule.** A colour in the interface is a token written by `themeTokens()` or a `color-mix()` of two of those tokens. `ui.css` never names a theme and never holds a theme's hex value.

**The Two Papers Rule.** A component on a wing uses only `--wing-*` and `--deep`. A component on paper uses only the sheet family. Accent fill and accent ink are the only tokens shared by both.

**The One Fill Rule.** `--accent-fill` is the only saturated fill in the shell. It marks the single selected or primary thing in a group: one segment, one primary button, one checked box.

## Typography

**Display Font:** Bricolage Grotesque Variable (with Atkinson Hyperlegible Next Variable, Segoe UI, sans-serif)
**Body Font:** Atkinson Hyperlegible Next Variable (with Segoe UI Variable Text, Segoe UI, system-ui, sans-serif)
**Label/Mono Font:** Atkinson Hyperlegible Mono Variable (with Cascadia Code, Consolas, monospace)

**Character:** A legibility-first sans carries the interface and the reading text; a wider grotesque is used only for headings on the sheet, drawer titles and the study count. All four families are bundled from `node_modules/@fontsource-variable` and loaded by `<link>` in `index.html`; the app works offline.

Tokens in `:root`:

| Token | Value |
|---|---|
| `--f-ui` | `'Atkinson Hyperlegible Next Variable', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif` |
| `--f-display` | `'Bricolage Grotesque Variable', 'Atkinson Hyperlegible Next Variable', 'Segoe UI', sans-serif` |
| `--f-mono` | `'Atkinson Hyperlegible Mono Variable', 'Cascadia Code', Consolas, monospace` |
| `--font`, `--font-h`, `--font-code` | Reader-selectable aliases, defaulting to the three above. The sheet uses these; the shell uses `--f-*` directly. |
| `--t-xs`, `--t-sm`, `--t-md`, `--t-lg` | 11.5px, 12.5px, 13.5px, 15px (interface scale) |
| `--fs`, `--lh`, `--para`, `--zoom` | 16.5px, 1.65, 1, 1 (reading size, line height, paragraph-gap multiplier, zoom) |
| `--ed-size` | 14px (editor) |
| `--maxw` | 860px (sheet width) |

Literata Variable is bundled as an optional reading and heading font. The reading-font menu also offers Segoe UI, Georgia and Atkinson Mono; the code-font menu offers Cascadia Code and Consolas.

### Hierarchy

Sheet sizes are in `em` of the reading size (`--fs` × `--zoom`), so they follow the reader's text-size setting.

- **Display** (700, 2.5em, 1.18, -0.03em): the page title (`h1.page-title`). An `h1` inside the body is 2.05em, 700, -0.025em.
- **Headline** (650, 1.5em, 1.18, -0.015em): `h2`. With "Heading underline" on, it gains a 1px `--border` rule below.
- **Title** (650, 1.22em, 1.18, -0.015em): `h3`. `h4` 1.06em, `h5` 1em, `h6` 0.92em in `--muted`.
- **Body** (400, 16.5px, 1.65): reading text in `--font`. Paragraphs use `text-wrap: pretty`, headings `text-wrap: balance`. Paragraph gap is `1em × --para`.
- **Label** (400 to 650, 13.5px, 1.4): interface text. Tree rows, to-do text, drawer rows, breadcrumbs (550), pane titles (650).
- **Label small** (500 to 600, 12.5px): buttons, inputs, tabs, outline entries.
- **Label extra small** (600, 11.5px): section labels such as "Pages", counts, the status bar, badges. Not uppercase and not letter-spaced.
- **Mono** (400, 14px, 1.75): the editor. Inline code is 0.88em and code blocks 0.86em/1.6 of the reading size. `kbd` is 500 11px.

Display type outside the sheet: drawer titles are `650 17px` Bricolage, canvas-bar titles `650 15px`, the study summary figure `650 20px/1.2`, the vault badge letter `700 15px`.

### Named Rules

**The Tabular Rule.** Every number that changes in place (zoom percentage, counts, status bar, table cells, slider values, the resize tip) uses `font-variant-numeric: tabular-nums`.

**The Two Scales Rule.** Interface text uses the fixed `--t-*` pixel scale and never follows the reading size. Sheet text uses `em` of `--fs` and never uses `--t-*`.

## Layout

A fixed frame with one fluid column. Top to bottom: tab strip (40px, `--deep`), the app row, status bar (26px, `--deep`). The app row is, left to right: icon rail (48px, `--deep`), sidebar (`--side`, 270px by default, minimum 190px, `--wing`), a 5px resize handle that shows as a 1px seam, then the main column. The main column is a document bar (44px; 38px compact, 50px roomy) over the reading area, which holds the stage, the sheet and the right panel (292px, `--wing`).

- **The stage** is positioned absolutely behind the centre column (`inset: 0 292px 0 0`; `right: 0` when the right panel is hidden, in Zen mode, or under 1100px).
- **The sheet** is centred, `max-width: var(--maxw)`, starts 28px below the document bar, has padding `56px 64px 120px` and is at least the height of the pane, so its lower edge runs off the bottom of the stage. The reader can resize the measure by dragging the sashes at the sheet's edges (360px to 2400px).
- **Modes:** read (sheet only), split (editor left, sheet right), write (editor only, centred at `--maxw`). Zen mode hides every wing and starts the sheet at 8vh. Focus mode dims the wings to 30% opacity until hovered.
- **Split panes** open to the left, right or bottom of the centre column. Each has a 34px wing-coloured header tab and a paper body.
- **Density:** `--row` is 30px (cozy), 26px (compact) or 34px (roomy). Interface scale (85% to 130%) is applied as `zoom` on `body`.
- **Rhythm:** there is no spacing token scale. Recurring values are 2px gaps inside control groups, 6px to 8px between sibling controls and row padding, 12px between drawer rows, 14px to 18px panel insets.
- **Responsive:** the sheet's pane is a size container. Under 720px of pane width the sheet padding tightens to `40px 32px 110px`, the cover drops to 150px and the page title to 2em. Under 1100px of window width the right panel leaves the row and becomes a slide-over shown by the right-panel toggle, the stage spans the full width, and the pane gutter drops from 24px to 14px.
- **Print:** every wing, the stage and all overlays are hidden; the sheet prints full width on white with no shadow.

## Elevation & Depth

Depth is literal. The wings are the proscenium and stay flat. The stage is behind them and holds stacked paper layers. Anything with a shadow is a piece of paper lying on or in front of the stage. Shadows have two parts: a 1px to 2px hard edge in `--shadow-soft` directly below (the paper's thickness) and a wide, negative-spread drop in `--shadow` (its distance from the stage).

### Shadow Vocabulary

- **Sheet** (`box-shadow: 0 1px 0 var(--shadow-soft), 0 18px 40px -14px var(--shadow)`): the reading sheet and the editor.
- **Split-pane body** (`box-shadow: 0 18px 40px -14px var(--shadow)`): paper in a split pane.
- **Menu** (`box-shadow: 0 2px 0 var(--shadow-soft), 0 24px 48px -14px var(--shadow)`): command palette, context menu, popover, slash menu.
- **Finish bar** (`box-shadow: 0 2px 0 var(--shadow-soft), 0 18px 34px -10px var(--shadow)`): the bar that rises at the end of a page.
- **Study sign** (`box-shadow: 0 2px 0 var(--shadow-soft), 0 8px 16px -6px var(--shadow)`): the paper sign in the sidebar scene.
- **Sticky note** (`box-shadow: 0 1px 0 rgba(0,0,0,.08), 0 10px 18px -6px var(--shadow)`); while dragged (`0 22px 34px -10px var(--shadow)` with a -1.5deg rotation); in the notes list (`0 2px 5px var(--shadow-soft)`).
- **Resume flag** (`filter: drop-shadow(0 3px 4px var(--shadow))`): the folded flag on the sheet's edge.
- **Scene layer** (`filter: drop-shadow(0 -3px 6px rgba(10,6,30,.22))`) and **scene sprite** (`filter: drop-shadow(0 4px 5px rgba(10,6,30,.26))`): paper layers and objects inside the scene.
- **Slide-over edge** (`box-shadow: -24px 0 40px -18px var(--shadow)`): the Customize and Sync drawers, and the right panel when it is a slide-over under 1100px. These are wings that temporarily cover the stage; they also keep their seam.

### Named Rules

**The Seam Rule.** Wings meet at one 1px line in `--wing-line` and nothing else: no shadow, no gap, no second border. The sidebar/main seam is the resize handle; it turns `--wing-accent` on hover.

**The Paper Rule.** A shadow means "this is paper on the stage". A control inside a wing never gets a shadow. Rings drawn with a zero-offset `box-shadow` (selected theme chip, the field being edited) are outlines, not elevation.

## Shapes

One radius drives the scale: `--radius` (10px by default, reader-adjustable from 0 to 20px under "Corner roundness").

| Token | Value | Use |
|---|---|---|
| `--r-sm` | `calc(var(--radius) * .6)` = 6px | Controls, rows, inputs, tree nodes |
| `--r-md` | `var(--radius)` = 10px | Menus, callouts, code blocks, tables, the finish bar, the sidebar's top-left corner |
| `--r-lg` | `calc(var(--radius) * 1.4)` = 14px | The sheet, the editor, the command palette |

- The sheet and the editor round only their top corners (`--r-lg --r-lg 0 0`); the bottom runs off the stage.
- Tabs are 9px on top and square below. In the default "Chrome" tab style the active tab joins the wing with two 9px concave corners.
- Pills (`999px`) are used for chips, tag links, the resize tip, badges and the Zen hint. Circles are used for the tab close button, task checkboxes (square is a reader option), status marks and outline stops.
- Sticky notes have one folded corner: `3px 3px 14px 3px` (`3px 3px 10px 3px` in the notes list).
- The resume flag is a swallow-tail cut with `clip-path: polygon(0 0, 100% 0, calc(100% - 9px) 50%, 100% 100%, 0 100%)`.
- Borders are 1px. Marks and checkbox outlines are 1.5px. Icons are 1.8px strokes.
- Scene art is flat fills with no outlines. Strokes appear only as open lines that are themselves the shape: mouths, tails, tentacles, coral, strings.

## Components

### Buttons

- **Shape:** 30px high, `0 12px` padding, `--r-sm`, 1px `--wing-line` border, 12.5px/500. `.small` is 26px high with `0 9px` padding.
- **Default:** `--wing-hover` fill, `--wing-ink` text; hover `--wing-press`. On paper (popover, finish bar) the same button uses `--panel`, `--border` and `--text`, hover `--panel2`.
- **Primary:** `--accent-fill` with `--accent-ink`, no border, weight 600; hover `filter: brightness(1.06)`.
- **Ghost:** transparent fill, same border.
- **Icon button:** 28px to 34px square, no border or fill at rest, icon in `--wing-muted` (or `--wing-faint` on `--deep`); hover adds a `--wing-hover` fill and `--wing-ink`. A lit toggle uses `--wing-accent` on `--wing-sel`; the lit star fills.
- **Pressed / disabled:** every button scales to 0.97 while pressed; disabled is 50% opacity.
- **Focus:** `outline: 2px solid var(--wing-accent)` with a 2px offset; `--accent` on paper surfaces.

### Segmented Controls

Mode switch, zoom group and right-panel tabs. A `--wing-field` well with a 1px `--wing-line` border and 2px padding; segments are 24px to 26px high with radius `--r-sm` minus 2px. The selected segment takes `--accent-fill` / `--accent-ink`. Count badges on the right-panel tabs are 15px pills in `--wing-ink` on `--wing`.

### Chips

- **Style:** 24px pill, 11.5px, 1px `--wing-line` border, `--wing-muted` text (to-do filters).
- **State:** selected is `--wing-sel` with `--wing-ink` and no border.
- **On paper:** tag links and tag pills are `--accent-soft` with accent text, hover `--sel`. Property pills are `--panel2` with a 5px radius.

### Cards / Containers

- **Sheet:** see Layout and Elevation. Background `--bg`, top corners `--r-lg`, padding `56px 64px 120px`.
- **Blocks on the sheet** (code, table, toggle, embed, Mermaid): `--r-md`, 1px `--border`, fill `--code` or `--panel`, no shadow.
- **Callout:** tinted paper. Fill is the callout hue 9% over the sheet, border the hue at 28%, title the hue mixed 62% toward the sheet ink, with a drawn icon from the icon set.
- **Theme chip:** two-column grid in the drawer. A 66px scene thumbnail over a name and one-line description; 1px `--wing-line` border, `--r-md`. The selected chip has a `--wing-accent` border and 1px ring.

### Inputs / Fields

- **Style:** 30px high, `0 10px` padding, `--r-sm`, 1px `--wing-line`, fill `--wing-field`, 12.5px. Placeholder in `--wing-muted`.
- **Focus:** the border becomes `--wing-accent`; no glow.
- **Search box:** a 32px field with a leading 14px icon; the box, not the inner input, takes the focus border.
- **Range and checkbox:** native controls with `accent-color: var(--accent-fill)`.
- **Task checkbox on the sheet:** 1.05em circle, 1.5px `--border-strong`; checked fills `--accent-fill` with a tick in `--accent-ink`.

### Navigation

- **Tab strip:** 33px tabs on `--deep`, 216px wide shrinking to 62px, 12.5px text in `--wing-faint`, title faded at the right edge with a mask. The active tab is `--wing`. Inactive neighbours are separated by a 1px `--wing-line` tick. An unsaved tab shows an 8px `--wing-accent` dot in place of the close button. Pills and Underline are reader-selectable variants.
- **Icon rail:** 34px buttons with 19px icons in `--wing-faint`.
- **Page tree:** rows of `--row` height, `--r-sm`, text in `--wing-muted`; folders in `--wing-ink` at 550. Hover is `--wing-hover`; the current page is `--wing-sel`, `--wing-ink`, 600. Children are indented 15px with a 1px `--wing-line` guide. Row decorations sit at the right edge: star, note count, study mark.
- **Document bar:** breadcrumbs at 13.5px/550, a save state (7px dot: hollow when saved, `--wing-accent` when unsaved), the mode switch, zoom group and toolbar toggles. A 1px `--wing-line` seam below.
- **Drawer tabs:** text tabs with a 2px `--wing-accent` underline on the current one.

### Menus and Overlays

Command palette, context menu, slash menu and popovers are paper: `--bg` fill, 1px `--border`, the Menu shadow. Rows are 30px to 40px with `--r-sm`; the selected or hovered row is `--accent-soft`. A destructive row is coloured `--err`. The palette is `min(640px, 92vw)` with a 52px input row and a footer of `kbd` hints, over a `rgba(8,6,20,.5)` scrim. The toast and the drop label are inverted wing colours (`--wing-ink` fill, `--wing` text).

### Study Marks (signature)

Study status is a 9px circle with a 1.5px `--wing-ink` border, drawn the same way in the tree, the study list groups and the summary strip:

- hollow: queued
- left half filled: studying
- solid: studied

Progress inside a study item is a 2px bar in `--wing-ink` on `--wing-line`. No status uses a colour.

### Outline Route (signature)

The outline is a route with stops. A 1.5px vertical line in `--wing-line` runs down the left; each heading has a stop on it (7px circle for levels 1 and 2, 5px for 3 and 4), hollow with a `--wing-muted` border. The section being read has its stop filled in `--wing-accent`.

### Reading Bar, Resume Flag, Finish Bar (signature)

- A 3px `--wing-accent` bar sticks to the top of the reading pane and grows with scroll position.
- The place the reader stopped is a folded paper flag in `--accent-fill` on the left edge of the sheet, labelled "Stopped".
- At the end of a page a paper bar rises from the bottom of the pane with the next actions.

### Sticky Notes (signature)

Notes are paper on the stage: one folded corner, a header strip 12% darker than the note, six fixed note colours and a fixed dark ink. They can be dragged, resized, collapsed and recoloured.

### The Stage and the Sidebar Scene (signature)

`buildScene()` in `src/scenes.js` paints the stage back to front: sky gradient, sky details (stars, aurora, rays, bubbles, petals, fireflies), top-anchored sprites, back sprites, far ridge, mid ridge, ground sprites, near ridge, veil. Ridges are generated from a seeded random function, so a scene is identical on every run.

- **Scene modes:** full; calm (a veil of `--stage` at 62% opacity over the scene); off (a flat mix of the two sky stocks). "Show characters" removes every sprite flagged `char`.
- **Sidebar scene:** a 112px version at the foot of the page tree, with the theme's mascot at the right and a paper sign at the left that states what is left to study. Clicking the sign opens the study list.
- **Characters:** original to Maddy MD. One geometry: a round body, two dot eyes with a small highlight, a small curved mouth, soft blush ellipses. They are built from the shared `eye`, `eyes`, `smile`, `sleepy` and `blush` helpers. Pixel Arcade redraws the same face on a pixel grid.

### Icons

`src/icons.js` holds 65 icons on a 24px grid: `fill: none`, `stroke: currentColor`, `stroke-width: 1.8`, round caps and joins. Use `icon(name, size)` in script or `data-icon="name"` (with optional `data-size`) in markup; `hydrateIcons()` expands the attribute. Common sizes are 14px to 16px in controls and 19px on the rail.

### Motion

| Token | Value | Use |
|---|---|---|
| `--d1` | 120ms | Hover, press, colour and border changes |
| `--d2` | 180ms | Chevron rotation, list item exit, pane fade |
| `--d3` | 260ms | Entrances: sticky note, resume flag, finish bar; progress width |
| `--ease-out` | `cubic-bezier(.23, 1, .32, 1)` | Default for transforms and entrances |
| `--ease-in-out` | `cubic-bezier(.77, 0, .175, 1)` | Looping scene motion |
| `--ease-drawer` | `cubic-bezier(.32, .72, 0, 1)` | Drawer opening |

- Drawers open in 320ms on `--ease-drawer` and close in 200ms on `--ease-out`. Menus pop in over 140ms from `scale(.97)`.
- Scene loops are slow and small: blink 5.6s, float 6s (9px), twinkle 3.4s, hop 2.4s, gear spin 46s and 30s, aurora 12s. Layers drift 4px to 20px with scroll when "Layers drift as you scroll" is on.
- One authored moment: the characters hop (900ms) when a page is marked studied.
- `body.motion-off` sets all three durations to 0ms and zeroes every transition and animation. `body.motion-reduced`, `prefers-reduced-motion` and a hidden window stop all scene animation.

### Page covers

The eight cover presets (`aurora`, `sunset`, `ocean`, `forest`, `peach`, `night`, `mono`, `candy`) are not images or gradients. `coverArt()` in `src/scenes.js` draws each one as a small cut-paper landscape from the active theme's stocks, using the same seeded ridge generator as the stage, so a cover changes with the theme. A cover value that is a URL is still shown as an image.

### The stage and the room it has

`sceneFit()` in `src/scenes.js` measures the gutters the sheet leaves. With 140px or more on a side, props stand beside the sheet and are scaled down so none is cut by its edge (hidden below 42%). With less, `body.floor` opens a strip under the sheet (116px, or 76px when the window is shorter than 780px) and the ground cast stands there in full; sky props are hidden in that mode.

## Do's and Don'ts

### Do:
- **Do** take every colour from a token written by `themeTokens()`, or from a `color-mix()` of two of them.
- **Do** keep a component on one paper: `--wing-*` and `--deep` in the shell, the sheet family on paper surfaces.
- **Do** divide wings with one 1px `--wing-line` seam.
- **Do** give a shadow only to paper on the stage, using a hard edge in `--shadow-soft` plus a negative-spread drop in `--shadow`.
- **Do** show study status with the hollow, half and solid marks.
- **Do** use `--r-sm`, `--r-md` and `--r-lg` so "Corner roundness" keeps working.
- **Do** use `--d1`, `--d2`, `--d3` and the three easing tokens so "Motion: off" keeps working.
- **Do** draw new icons on the 24px grid at a 1.8px stroke and add them to `ICON_PATHS`.
- **Do** build characters from the shared face helpers and colour them only from the theme's `st` stocks.
- **Do** put `tabular-nums` on any number that updates in place.

### Don't:
- **Don't** hard-code a theme colour in `ui.css`.
- **Don't** put a shadow on a control inside a wing, or add a second border or gap at a seam.
- **Don't** signal study status with a colour.
- **Don't** use emoji as interface icons. Emoji are allowed only as the page icon a reader picks for their own page.
- **Don't** use existing franchise characters. Characters are original to Maddy MD.
- **Don't** outline scene shapes or put gradients on scene objects. The sky is the only gradient in a scene.
- **Don't** add a second saturated fill to the shell beside `--accent-fill`.
- **Don't** let a theme change the reading text's contrast: sheet ink and sheet tone come from the fixed recipes in `themeTokens()`, not from the scene.

## Adding a Theme

A theme is one object in `THEMES` (`src/themes.js`) and one entry with the same id in `SCENES` (`src/scenes.js`). Nothing in `ui.css` changes. The gallery in the Customize drawer and the "Theme: ..." commands are built from `THEMES`, so the theme appears in both automatically.

1. **Add the theme object** to `THEMES`:

```js
{ id: 'harbor', name: 'Harbor', blurb: 'One line shown under the name in the gallery',
  dark: true,                    // default tone of the reading sheet
  h: 220,                        // neutral hue for the sheet, sheet ink and wing ink
  wing: [0.24, 0.045, 222],      // OKLCH [L, C, H]; L below 0.5 makes the shell dark
  deep: [0.185, 0.04, 225],      // OKLCH; a step deeper than wing (dark) or darker than wing (light)
  accent: [0.8, 0.14, 70],       // OKLCH accent source
  st: { sky1: '#...', sky2: '#...', far: '#...', mid: '#...', near: '#...',
        star: '#...', a: '#...', b: '#...', c: '#...', w: '#...', k: '#...' } }
```

   Existing dark themes use wing L 0.225 to 0.25 with deep L 0.17 to 0.19; light themes use wing L 0.925 to 0.94 with deep L 0.865 to 0.895. All 11 `st` keys are required. The two character-free themes also carry `quiet: true`; no code reads it.

2. **Add the scene** to `SCENES` under the same id. It is a function of the stocks that returns a spec:

```js
harbor: (c) => ({
  sky: sky(c.sky1, c.sky2),                     // optional third argument: a middle colour at 62%
  mascot: 'gull', skyObj: 'moon',               // sprite names for the sidebar scene and thumbnail; omit both for a character-free theme
  layers: [['hills', c.far, 36, 4], ['city', c.mid, 24, 9], ['dunes', c.near, 12, 2]],
  sprites: [{ s: 'moon', at: 'tr', x: 60, y: 46, w: 80 },
            { s: 'gull', at: 'br', x: 28, w: 120, char: 1 }] }),
```

   - `layers` must have exactly three entries, back to front: `[kind, colour, height in % of the stage, seed]`. Kinds: `hills`, `dunes`, `frost`, `peaks`, `ice`, `mesa`, `city`, `pixel`, `pines`, `clouds`.
   - `sprites`: `s` names a function in `SPR`; `at` is `tl`, `tr`, `bl` or `br`; `x` is the distance in px from that side; `y` is the distance from the top (top-anchored sprites only); `w` is the width in px. Optional flags: `char` (hidden by "Show characters"), `float`, `hop`, `spin` (1 or -1), `lift` (px above the ground line), `rot` (degrees), `back` (drawn behind the ridges).
   - Optional sky details: `stars` (count), `pstars` (pixel stars), `bubbles`, `petals`, `flies` (counts), `aurora: [colourA, colourB]`, `rays: colour`, `lights: colour` (windows on `city` layers), `frost: colour` (a cap line on `frost` layers).

3. **Add any new sprites** to `SPR` as `name: (c) => svgEl(width, height, body)`. Use only the stocks on `c` and `mixc()` shades of them. Give a character a round body and build its face from `eye` / `eyes`, `smile` or `sleepy`, and `blush`.

4. **Check contrast.** `themeTokens()` enforces the floors listed under "Colors"; this includes text on `--accent-fill`: the fill is walked away from its ink until the pair clears 4.6:1, for theme accents and custom accents alike.

5. **Update the count** in the welcome screen copy in `src/index.html` ("Fifteen scenes, ...").

## Known Drift

Places where the build does not follow its own rules. They are recorded so they are not copied into new work; none of them is a rule.

- **Colours outside the token system:** sticky notes use six fixed pastel colours and a fixed ink (`#26221c`); the accent presets are 12 fixed hex values; the modal scrim is `rgba(8,6,20,.5)`; scene drop-shadows use a fixed `rgba(10,6,30,...)`; `--wing-field` mixes toward pure black or white; the Forest Camp and Desert Dusk skies have a hard-coded middle colour; sprite eyes default to `#1d1730` with `#fff` highlights.
- **Radii and durations outside the scale:** several small elements use literal radii (3px to 9px) that do not follow "Corner roundness"; the drawer (200ms / 320ms), menu pop-in (140ms) and toast (180ms / 400ms) use literal durations.
- **Emoji in toasts:** several toast messages end with an emoji glyph.
- **System font in art:** the sleeping cat's "z" letters are SVG text in Arial.
