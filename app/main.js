const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

const EXT = new Set(['.md', '.markdown', '.txt']);
let win, watcher, watchTimer;
if (process.env.ML_SHOT) app.setPath('userData', path.join(require('os').tmpdir(), 'ml-test-profile'));
/* The app was called MarkLens before 1.0.0 shipped as Maddy MD. Carry its settings over once. */
else {
  const ud = app.getPath('userData'), legacy = path.join(app.getPath('appData'), 'MarkLens');
  try { if (!fs.existsSync(ud) && fs.existsSync(legacy)) fs.cpSync(legacy, ud, { recursive: true }); } catch {}
}

function createWindow() {
  win = new BrowserWindow({
    width: +(process.env.ML_SIZE || '1400x900').split('x')[0], height: +(process.env.ML_SIZE || '1400x900').split('x')[1], minWidth: 820, minHeight: 520,
    backgroundColor: '#0f1117',
    icon: path.join(__dirname, 'build', 'icon.png'),
    show: !process.env.ML_SHOT, paintWhenInitiallyHidden: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#00000000', symbolColor: '#c9d1d9', height: 40 },
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false, nodeIntegration: false, backgroundThrottling: false },
  });
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.webContents.on('console-message', (_e, level, msg, line, src) => { if (level >= 2) console.log('[renderer]', msg, src + ':' + line); });
  if (process.env.ML_SHOT) {
    win.webContents.once('did-finish-load', () => setTimeout(async () => {
      if (process.env.ML_JS) await win.webContents.executeJavaScript(process.env.ML_JS).catch((e) => console.log('JS ERR', e.message));
      setTimeout(async () => { fs.writeFileSync(process.env.ML_SHOT, (await win.capturePage()).toPNG()); app.quit(); }, 1500);
    }, 3500));
  }
  /* ML_JS only (no ML_SHOT): run a script in the real, visible window */
  if (process.env.ML_JS && !process.env.ML_SHOT) win.webContents.once('did-finish-load', () => setTimeout(() => win.webContents.executeJavaScript(process.env.ML_JS).catch(() => {}), 3500));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) { e.preventDefault(); shell.openExternal(url); } });
}

async function walk(dir, base = dir) {
  let out = [];
  let entries = [];
  try { entries = await fsp.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const children = await walk(full, base);
      if (children.length) out.push({ type: 'dir', name: e.name, path: full, children });
    } else if (EXT.has(path.extname(e.name).toLowerCase())) {
      out.push({ type: 'file', name: e.name, path: full, rel: path.relative(base, full) });
    }
  }
  out.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name, undefined, { numeric: true }) : a.type === 'dir' ? -1 : 1));
  return out;
}

function flat(tree, acc = []) { for (const n of tree) n.type === 'dir' ? flat(n.children, acc) : acc.push(n); return acc; }

ipcMain.handle('pick-folder', async () => {
  const r = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('pick-file', async () => {
  const r = await dialog.showOpenDialog(win, { properties: ['openFile'], filters: [{ name: 'Markdown / Text', extensions: ['md', 'markdown', 'txt'] }] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('list', async (_e, dir) => walk(dir));
ipcMain.handle('index', async (_e, dir) => {
  const files = flat(await walk(dir));
  return Promise.all(files.map(async (f) => ({ path: f.path, rel: f.rel, name: f.name, text: await fsp.readFile(f.path, 'utf8').catch(() => '') })));
});
ipcMain.handle('find-asset', async (_e, dir, name) => {
  const target = name.toLowerCase();
  const direct = path.join(dir, name);
  if (fs.existsSync(direct)) return direct;
  async function go(d, depth) {
    if (depth > 6) return null;
    let es = []; try { es = await fsp.readdir(d, { withFileTypes: true }); } catch { return null; }
    for (const e of es) if (!e.isDirectory() && e.name.toLowerCase() === target) return path.join(d, e.name);
    for (const e of es) if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') { const r = await go(path.join(d, e.name), depth + 1); if (r) return r; }
    return null;
  }
  return go(dir, 0);
});
ipcMain.handle('default-vault', async () => {
  if (process.env.ML_SHOT) return path.join(__dirname, 'demo');
  const dir = path.join(app.getPath('documents'), 'Maddy MD Vault');
  if (!fs.existsSync(dir)) {
    const copy = (from, to) => {
      fs.mkdirSync(to, { recursive: true });
      for (const e of fs.readdirSync(from, { withFileTypes: true })) {
        const s = path.join(from, e.name), d = path.join(to, e.name);
        if (e.isDirectory()) copy(s, d); else fs.writeFileSync(d, fs.readFileSync(s));
      }
    };
    try { copy(path.join(__dirname, 'demo'), dir); } catch { fs.mkdirSync(dir, { recursive: true }); }
  }
  return dir;
});
ipcMain.handle('mkdir', async (_e, p) => { await fsp.mkdir(p, { recursive: true }); return true; });
ipcMain.handle('read',async (_e, p) => fsp.readFile(p, 'utf8'));
ipcMain.handle('write', async (_e, p, c) => { await fsp.mkdir(path.dirname(p), { recursive: true }); await fsp.writeFile(p, c, 'utf8'); return true; });
ipcMain.handle('exists', async (_e, p) => fs.existsSync(p));
ipcMain.handle('rename', async (_e, a, b) => { await fsp.rename(a, b); return true; });
ipcMain.handle('trash', async (_e, p) => { await shell.trashItem(p); return true; });
ipcMain.handle('reveal', async (_e, p) => shell.showItemInFolder(p));
ipcMain.handle('fullscreen', (_e, on) => { win.setFullScreen(!!on); return win.isFullScreen(); });
ipcMain.handle('shot', async (_e, p) => { if (!process.env.ML_SHOT) return false; win.webContents.invalidate(); await win.capturePage(); await new Promise((r) => setTimeout(r, 180)); win.webContents.invalidate(); fs.writeFileSync(p, (await win.capturePage()).toPNG()); return true; });
ipcMain.handle('titlebar', (_e, color, symbol) => { try { win.setTitleBarOverlay({ color, symbolColor: symbol }); } catch {} });
ipcMain.handle('save-dialog', async (_e, name, ext) => {
  const r = await dialog.showSaveDialog(win, { defaultPath: name, filters: [{ name: ext.toUpperCase(), extensions: [ext] }] });
  return r.canceled ? null : r.filePath;
});
ipcMain.handle('pdf', async (_e, out) => {
  const data = await win.webContents.printToPDF({ printBackground: true, margins: { marginType: 'default' }, pageSize: 'A4' });
  await fsp.writeFile(out, data); shell.openPath(out); return true;
});

ipcMain.handle('watch', (_e, dir) => {
  if (watcher) { watcher.close(); watcher = null; }
  if (!dir) return;
  try {
    watcher = fs.watch(dir, { recursive: true }, (_ev, file) => {
      if (file && !EXT.has(path.extname(file).toLowerCase()) && path.extname(file)) return;
      clearTimeout(watchTimer);
      watchTimer = setTimeout(() => win && win.webContents.send('fs-changed', file ? path.join(dir, file) : null), 250);
    });
  } catch {}
});

/* ---------------- GitHub Gist cloud sync ---------------- */
const SEP = '__';
const SYNC_PREFIX = 'Maddy MD Sync: ';
const META = '.maddy-md.json';
const gh = async (token, url, opts = {}) => {
  const r = await fetch('https://api.github.com' + url, {
    ...opts,
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'User-Agent': 'Maddy-MD', 'Content-Type': 'application/json' },
  });
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
};

async function findGist(token, folder, gistId) {
  if (gistId) { try { return await gh(token, '/gists/' + gistId); } catch {} }
  const names = [SYNC_PREFIX + path.basename(folder), 'MarkLens Sync: ' + path.basename(folder)];
  for (let page = 1; page <= 5; page++) {
    const list = await gh(token, `/gists?per_page=100&page=${page}`);
    const g = list.find((x) => names.includes(x.description));
    if (g) return gh(token, '/gists/' + g.id);
    if (list.length < 100) break;
  }
  return null;
}

ipcMain.handle('sync-test', async (_e, token) => { const u = await gh(token, '/user'); return u.login; });

ipcMain.handle('sync-push', async (_e, { token, folder, gistId }) => {
  const files = flat(await walk(folder));
  const payload = {};
  for (const f of files) {
    let c = await fsp.readFile(f.path, 'utf8');
    if (!c.trim()) c = '​'; // gists reject empty files
    payload[f.rel.split(path.sep).join(SEP)] = { content: c };
  }
  payload[META] = { content: JSON.stringify({ folder: path.basename(folder), pushed: new Date().toISOString(), count: files.length }, null, 2) };
  const existing = await findGist(token, folder, gistId);
  let g;
  if (existing) {
    for (const name of Object.keys(existing.files)) if (!payload[name]) payload[name] = null; // delete removed files
    g = await gh(token, '/gists/' + existing.id, { method: 'PATCH', body: JSON.stringify({ files: payload }) });
  } else {
    g = await gh(token, '/gists', { method: 'POST', body: JSON.stringify({ description: SYNC_PREFIX + path.basename(folder), public: false, files: payload }) });
  }
  return { gistId: g.id, url: g.html_url, count: files.length };
});

ipcMain.handle('sync-pull', async (_e, { token, folder, gistId }) => {
  const g = await findGist(token, folder, gistId);
  if (!g) throw new Error('No synced copy found in the cloud for this folder yet. Push first.');
  let count = 0;
  for (const [name, f] of Object.entries(g.files)) {
    if (name === META || name === '.marklens.json') continue;
    let content = f.truncated ? await (await fetch(f.raw_url)).text() : f.content;
    if (content === '​') content = '';
    const rel = name.split(SEP).join(path.sep);
    const target = path.join(folder, rel);
    if (!target.startsWith(folder)) continue;
    await fsp.mkdir(path.dirname(target), { recursive: true });
    await fsp.writeFile(target, content, 'utf8');
    count++;
  }
  return { gistId: g.id, url: g.html_url, count };
});

const fileArg = (argv) => argv.slice(1).find((a) => /\.(md|markdown|txt)$/i.test(a) && fs.existsSync(a));
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', (_e, argv) => {
    if (!win) return; if (win.isMinimized()) win.restore(); win.focus();
    const f = fileArg(argv); if (f) win.webContents.send('open-path', f);
  });
  app.whenReady().then(() => {
    createWindow();
    const f = fileArg(process.argv);
    if (f) win.webContents.once('did-finish-load', () => setTimeout(() => win.webContents.send('open-path', f), 1500));
  });
}
app.on('window-all-closed', () => app.quit());

