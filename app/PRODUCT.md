# Product

> **1.1.0 redesign (2026-11-21), overrides the rest of this file where they disagree:** the scenes, characters, stage art and page covers were removed. There are 12 single-colour themes (each one hue for the shell, the sheet and the accent, built by `mono()` in `src/themes.js`); `src/scenes.js` no longer exists. The app opens empty with no folder, starts every file dialog on the Desktop, and reads and writes only `.md` files.


<!-- impeccable:product-schema 1 -->

> Facts marked *(inferred)* were taken from the build conversation and the code, not from a product interview. The owner asked for the redesign to proceed without stopping for questions.

## Platform

web

## Users

One person, the owner, on a Windows desktop. They read and study long technical Markdown documents (roadmaps, specs, tables, Mermaid diagrams), often pasted from AI assistants, and keep a queue of files they must not skip. *(inferred)* Sessions are long and at a desk; the same documents are reopened many times.

## Product Purpose

Maddy MD is a desktop reader and writer for folders of `.md` and `.txt` files. It renders Markdown, Mermaid and HTML well enough that studying a document is pleasant, and lets the reader keep personal study material (to-dos, a study queue, sticky notes) beside the text without changing the files. Success is the owner preferring it to a browser or editor for reading their notes.

## Positioning

Plain files stay plain: everything personal lives outside the documents, and the app is a reading room around them rather than a database that owns them.

## Operating Context

- Opens a folder ("vault") of `.md` / `.txt` files; nothing else is supported.
- Content is frequently pasted from ChatGPT or Claude and converted to Markdown.
- Reading is the main activity; writing happens in a split or write mode beside it.
- Optional sync to a private GitHub Gist.
- Ships as an Electron app (`.exe` installer and portable build).

## Capabilities and Constraints

- Rendering: Markdown (GFM), Mermaid with a pan/zoom canvas, sanitized raw HTML, callouts, toggles, tables, task lists, wikilinks, embeds, tags, YAML properties with page icon and cover.
- Navigation: page tree, Chrome-style tabs, quick switcher, command palette, graph view, backlinks, outline, search.
- Layout: read / split / write modes, adjustable text column, Zen mode, split panes right / left / bottom.
- Personal (local only): to-do list, study list with progress, per-page sticky notes, starred pages, reading progress and resume.
- Customization is a core expectation: the owner explicitly wants many built-in visual themes ("background vibes" such as space and cartoon characters, 10 to 15 of them), plus fonts, widths and motion controls.
- Vanilla HTML/CSS/JS in an Electron renderer; no framework. Icons are an in-house inline SVG set.

## Brand Commitments

- Name: Maddy MD. Mark: a diamond.
- The owner rejected the first interface as "not acceptable" and asked for a redesign that uses the installed design skills.
- Themes must include playful scenic worlds, including original cartoon characters and space. Characters are original to Maddy MD; no existing franchise characters.

## Evidence on Hand

- Working app and source in `src/`; demo vault in `demo/`.
- No user research, testimonials or metrics exist; none may be invented.

## Product Principles

1. The document is the product; chrome earns its place or recedes.
2. Files stay plain and portable; personal data never leaks into them.
3. Personality is the reader's choice: a theme changes the room, never the legibility of the text.
4. Nothing the reader queued to study gets lost or skipped.
5. Every frequent action has a keyboard path.

## Accessibility & Inclusion

Body text must stay comfortably readable on every theme (contrast at least WCAG AA against its own reading surface), and motion must be reducible or switchable off.
