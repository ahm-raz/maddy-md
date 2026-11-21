# Maddy MD Setup Guide

Maddy MD is a Windows desktop app for reading and writing folders of Markdown (`.md`) files. This guide covers installing it, the first run, cloud sync, and building it from the source code.

## What you can download

| Item | What it is |
|---|---|
| `Maddy-MD-Setup-1.1.0.exe` | Installer. Adds desktop and Start menu shortcuts. |
| `Maddy-MD-Portable-1.1.0.exe` | Runs without installing. Good for a USB stick. |
| `app\` (in the GitHub repository) | The full source code. Only needed if you want to change or rebuild the app. |

You need Windows 10 or 11 (64-bit). Nothing else has to be installed to run the app.

## 1. Install the app

Pick one of the two.

**Installer (recommended)**

1. Double-click `Maddy-MD-Setup-1.1.0.exe`.
2. If Windows shows "Windows protected your PC", click **More info**, then **Run anyway**. This appears because the app is not code-signed, not because anything is wrong with it.
3. Choose the install folder and finish. Open Maddy MD from the desktop or Start menu shortcut.

**Portable**

1. Copy `Maddy-MD-Portable-1.1.0.exe` anywhere you like.
2. Double-click it. The same SmartScreen note applies the first time.
3. It takes a few seconds longer to start than the installed version.

To update later, run a newer Setup file over the old install, or replace the portable file. Your settings, to-dos, study list and notes are kept.

## 2. First run

1. Maddy MD starts empty: no folder is open and nothing is created on your PC.
2. Click **Open Folder** in the sidebar or in the middle of the window (or press `Ctrl+Shift+O`). The folder picker starts on your Desktop. Choose any folder that contains `.md` files.
3. Click a page in the sidebar to read it.

Maddy MD only reads and writes `.md` files. Other files in the folder are not shown and are never changed.

Next time you start the app, it reopens the folder you used last.

### Reading and writing

- The three buttons in the toolbar switch between **Read**, **Split** and **Write** (`Ctrl+1`, `Ctrl+2`, `Ctrl+3`).
- Changes save automatically. `Ctrl+S` saves at once.
- Paste text copied from ChatGPT or Claude into the editor and it becomes clean Markdown. `Ctrl+Shift+V` makes a new page from the clipboard.
- Type `/` in the editor for a menu of blocks (headings, tables, to-dos, diagrams). Type `[[` to link to another page.
- Click a Mermaid diagram to open it in a canvas you can pan, zoom and export.

### Choosing a theme

Press `Ctrl+,` to open **Customize**. The **Look** tab has 12 single-colour themes: Graphite, Midnight, Ocean, Forest, Plum, Ember and Crimson (dark), and Paper, Sky, Mint, Sand and Lilac (light). You can also switch the page between light and dark paper, pick an accent colour, and change fonts, text size and page width.

### Shortcuts worth knowing

| Shortcut | Action |
|---|---|
| `Ctrl+O` | Find or create a page |
| `Ctrl+P` | Command palette (every action, searchable) |
| `Ctrl+T` / `Ctrl+W` | New tab / close tab |
| `Ctrl+Alt+→` `←` `↓` | Split the view right, left or down |
| `Ctrl+G` | Graph of how pages link |
| `F11` | Zen mode (`Esc` to leave) |
| `Ctrl` with `+` `-` `0` | Zoom text in, out, reset |
| `Alt+N` | Sticky note on the current page |
| `Alt+S` | Add the page to your study list |

### Personal tools

The right panel holds a **To-Do** list, a **Study List** (pages you must not skip, with progress) and **Sticky Notes** for each page. These are saved on this PC only. They are not written into your files and are not synced.

## 3. Cloud sync (optional)

Maddy MD can back up a folder to a private GitHub Gist. It is free and keeps a history of every upload.

1. Create a GitHub account at <https://github.com/signup> if you do not have one.
2. While signed in, open <https://github.com/settings/tokens/new?scopes=gist&description=Maddy%20MD>.
3. Set **Expiration** to "No expiration" (or one year). Under **Scopes** tick only **gist**. Click **Generate token**.
4. Copy the token straight away. It starts with `ghp_` and GitHub shows it only once.
5. In Maddy MD, click the cloud icon in the left rail, paste the token, and click **Connect**. It should say "Connected as" followed by your username.
6. Click **Push** to upload the open folder.

To get the notes on another PC: install Maddy MD, connect with the same token, open a folder **with the same name**, and click **Pull**.

Your synced files appear at <https://gist.github.com> under **Your gists**, in a gist named `Maddy MD Sync: <folder name>`. Files in subfolders show with `__` in the name.

Things to know:

- **Pull overwrites.** It replaces local files with the cloud copy. It does not merge.
- Treat the token like a password. If it leaks, delete it at GitHub, Settings, Developer settings, Personal access tokens.
- A private gist is hidden from search, but anyone who has its exact link can open it. Do not keep passwords in synced notes.

## 4. Build from source (optional)

Only needed if you want to change the app.

**You need:** [Node.js](https://nodejs.org) 20 or newer, which includes `npm`. Git is optional.

Open a terminal in the `app` folder and run:

```
npm install
npm start
```

`npm install` downloads the dependencies (several hundred MB, once). `npm start` runs the app straight from the source.

To build the two `.exe` files:

```
npm run dist
```

They are written to `app\dist\`. The first build downloads extra tools and takes a few minutes.

**If the first build fails with "Cannot create symbolic link":** Windows is blocking a step in the build tools. Either turn on Developer Mode (Settings, System, For developers), or run the terminal as administrator once, then run `npm run dist` again.

### Where things are in the source

| File | Purpose |
|---|---|
| `main.js` | The desktop shell: windows, files, sync |
| `preload.js` | Bridge between the window and your files |
| `src\index.html` | Page structure |
| `src\ui.css` | All styling |
| `src\app.js` | Rendering, editing, settings |
| `src\vault.js` | Links, tabs, palette, graph, Zen mode |
| `src\personal.js` | To-do, study list, sticky notes |
| `src\split.js` | Split views |
| `src\themes.js` | The 12 themes and their colours |
| `DESIGN.md` | Design rules, including how to add a theme |

## 5. Where your data is kept

| Data | Location |
|---|---|
| Your notes | The folder you opened. Plain files, usable in any other app. |
| Settings, to-dos, study list, sticky notes, sync token | `%APPDATA%\Maddy MD` on this PC |

## 6. Uninstall

- **Installed version:** Windows Settings, Apps, Maddy MD, Uninstall.
- **Portable version:** delete the `.exe`.
- To also remove settings and personal data, delete the folder `%APPDATA%\Maddy MD`.

Your notes are never deleted by uninstalling.

## Troubleshooting

| Problem | What to do |
|---|---|
| "Windows protected your PC" | Click **More info**, then **Run anyway**. |
| Sidebar is empty | The folder has no `.md` files. Open a different folder or press `Ctrl+N` to make a page. |
| Sync says it failed | Open the cloud panel and read the log at the bottom. The usual cause is an expired token or one made without the **gist** scope. |
| Text is too small or too large | `Ctrl` with `+` or `-`, or Customize, Type, Text size. |
