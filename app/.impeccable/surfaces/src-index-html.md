---
version: 1
slug: "src-index-html"
primary_target: "src/index.html"
related_targets: []
---

# Maddy MD app window

Scope: the whole Electron window (`src/index.html`): shell, reading sheet, panels, overlays. Visitor mode: Read inside an Operate shell.

Audience and job: the owner studying long technical Markdown at a desk for hours; reading first, writing beside it. Task content is their own files; nothing is invented. Constraints: vanilla HTML/CSS/JS, offline, every existing feature keeps working, text stays AA-legible on every theme.

The owner pinned one requirement in their own words: "add different background vibes (built in themes), like cartoon characters, space, and such add 10-15 themes." Direction chosen unattended (owner asked not to be stopped for questions); it was not confirmed on a decision page.

## Direction contract

THESIS: A paper theatre. The window is a shadow-box stage; the document is a calm sheet of paper standing in front of it. Refuses the category default of a grey/purple note app with one accent, and its opposite, the blank white doc.

OWN-WORLD: Each theme is one cut-paper diorama built from a strict set of paper stocks: flat fills, stacked layers, soft offset paper shadows, no outlines, no gradients on objects. Shell panels ("wings") are solid stock colour divided by one hairline seam. Shadow is reserved for paper lying on the stage: the sheet, sticky notes, menus. Original characters only, in one geometry: round bodies, dot eyes, small mouths.

STORY: The reader picks a room, then forgets it. They read on the sheet, see what is queued beside it, and are told by the theme's character how much is left to study.

FIRST VIEWPORT: Tab strip across the top in the deepest stock. Left: icon rail, then the page tree in wing colour, with a small diorama at its foot where the character reports study status. Centre: the stage, visible above and beside the sheet, sky objects top corners, characters bottom corners; the sheet centred at reading measure with title, properties, body. Right: outline / personal panels. Primary action: opening a page from the tree.

FORM: toy-theatre / shadow-box diorama, position 7 of 7 on the grounded list. seed:4eaa9b31df57fb98

Raises carried from the declined hand:
- Palette totality (from the data field): every colour on screen is one of the theme's named stocks or a mix of two of them; no stray greys.
- State is a mark, not a hue (from the cutting bench): study status is drawn as a shape, and the place you stopped reading is a folded paper flag on the sheet edge.
- Seams, not shadows (from the developer console): panels divide with one hairline; destructive actions stand apart.
- A line with stops (from the transit diagram): the outline reads as a route, the current stop lit.
- Structure is the only ornament (from the exposed binding): no decorative chrome; the reading rail shows real sections.
- Plain literal labels (from the quote grammar): zones are named for what they hold.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
