/* Maddy MD renderer */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

const DEFAULTS = {
  v: 2, theme: 'orbit', accent: '', sheetTone: 'auto', scene: 'full', chars: true, parallax: true, radius: 10, headColor: false, linkStyle: 'underline', bullet: 'disc', checkStyle: 'round',
  edSize: 14, density: 'cozy', uiScale: 1, tabStyle: 'chrome', showCover: true, showProps: true, showRibbon: true,
  motion: 'full', speed: 1, smoothScroll: true, slash: true, dailyFolder: '', rightTab: 'outline', fontBody: 'var(--f-ui)', fontHead: 'var(--f-display)',
  fontCode: 'var(--f-mono)', size: 16.5, lh: 1.65, width: 860, para: 1, justify: false, numbered: false,
  headLine: true, showToc: true, showSide: true, focus: false, syncScroll: true, codeStyle: 'card', tableStyle: 'striped',
  allowHtml: true, pasteConvert: true, autosave: true, wrap: true, mermaidTheme: 'auto', zoom: 1, mode: 'preview', sideW: 270, autoPush: false,
};
let S = { ...DEFAULTS, ...store.get('ml-settings', {}) };
if (S.v !== 2) { // the look was redesigned: reset appearance keys once, keep behaviour and layout choices
  for (const k of ['theme', 'accent', 'sheetTone', 'scene', 'chars', 'parallax', 'radius', 'motion', 'fontBody', 'fontHead', 'fontCode', 'size', 'lh']) S[k] = DEFAULTS[k];
  if (S.codeStyle === 'terminal') S.codeStyle = 'card';
  S.v = 2;
}
const saveS = () => store.set('ml-settings', S);

const state = { folder: null, tree: [], file: null, text: '', dirty: false, untitled: false };
const editor = $('#editor'), preview = $('#preview'), previewPane = $('#previewPane');

/* ---------------- Markdown ---------------- */
let slugs = {};
const slug = (t) => { let s = t.toLowerCase().trim().replace(/<[^>]+>/g, '').replace(/&\w+;/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-') || 'section'; if (slugs[s] != null) s += '-' + ++slugs[s]; else slugs[s] = 0; return s; };

marked.use({
  gfm: true,
  renderer: {
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens);
      const id = slug(inner);
      return `<h${depth} id="${id}"><a class="anchor" href="#${id}">#</a>${inner}</h${depth}>\n`;
    },
    code({ text, lang }) {
      lang = (lang || '').trim().split(/\s+/)[0].toLowerCase();
      if (lang === 'mermaid' || lang === 'mmd') return `<div class="mermaid-wrap" data-code="${encodeURIComponent(text)}"><span class="mm-tag">mermaid · click to open canvas</span><div class="mm-out"></div></div>`;
      const hl = window.api.highlight(text, lang) ?? esc(text);
      return `<pre><div class="code-head"><span class="dots"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></span><span>${esc(lang || 'text')}</span><button class="copy">Copy</button></div><code class="hljs" data-raw="${encodeURIComponent(text)}">${hl}</code></pre>`;
    },
    html({ text }) { return S.allowHtml ? text : esc(text); },
  },
});

/* Obsidian-flavoured syntax: [[wikilinks]], ![[embeds]], ==highlight==, #tags */
const IMG_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i;
marked.use({
  extensions: [
    { name: 'wikilink', level: 'inline', start: (s) => s.match(/!?\[\[/)?.index,
      tokenizer(src) { const m = /^(!?)\[\[([^\]\n|#^]*)(?:#([^\]\n|]+))?(?:\|([^\]\n]+))?\]\]/.exec(src); if (m) return { type: 'wikilink', raw: m[0], embed: !!m[1], target: m[2].trim(), heading: m[3]?.trim(), alias: m[4]?.trim() }; },
      renderer(t) {
        if (t.embed && IMG_EXT.test(t.target)) return `<img class="ml-asset" data-asset="${esc(t.target)}" alt="${esc(t.alias || t.target)}"${t.alias && /^\d+$/.test(t.alias) ? ` width="${t.alias}"` : ''}>`;
        if (t.embed) return `<div class="embed" data-target="${esc(t.target)}" data-heading="${esc(t.heading || '')}"></div>`;
        const ok = !t.target || resolveNote(t.target);
        const label = t.alias || (t.target || '') + (t.heading ? (t.target ? ' › ' : '') + t.heading : '');
        return `<a class="wikilink${ok ? '' : ' unresolved'}" data-target="${esc(t.target)}" data-heading="${esc(t.heading || '')}">${esc(label)}</a>`;
      } },
    { name: 'mark', level: 'inline', start: (s) => s.indexOf('=='),
      tokenizer(src) { const m = /^==(?=\S)([\s\S]*?\S)==/.exec(src); if (m) return { type: 'mark', raw: m[0], tokens: this.lexer.inlineTokens(m[1]) }; },
      renderer(t) { return `<mark>${this.parser.parseInline(t.tokens)}</mark>`; } },
    { name: 'tag', level: 'inline', start(s) { const m = s.match(/(^|\s)#[\p{L}_][\p{L}\p{N}_/-]*/u); return m ? m.index + m[1].length : undefined; },
      tokenizer(src) { const m = /^#([\p{L}_][\p{L}\p{N}_/-]*)/u.exec(src); if (m) return { type: 'tag', raw: m[0], tag: m[1] }; },
      renderer(t) { return `<a class="tag" data-tag="${esc(t.tag)}">#${esc(t.tag)}</a>`; } },
  ],
});

const CALLOUTS = {
  note: ['pen', '--info'], abstract: ['clipboard', '--info'], summary: ['clipboard', '--info'], tldr: ['clipboard', '--info'], info: ['info', '--info'], todo: ['checkCircle', '--info'],
  tip: ['bulb', '--ok'], hint: ['bulb', '--ok'], important: ['zap', '--note'], success: ['checkCircle', '--ok'], check: ['checkCircle', '--ok'], done: ['checkCircle', '--ok'],
  question: ['help', '--warn'], help: ['help', '--warn'], faq: ['help', '--warn'], warning: ['alert', '--warn'], caution: ['alert', '--err'], attention: ['alert', '--warn'],
  failure: ['xCircle', '--err'], fail: ['xCircle', '--err'], missing: ['xCircle', '--err'], danger: ['zap', '--err'], error: ['xCircle', '--err'], bug: ['bug', '--err'],
  example: ['flask', '--note'], quote: ['quote', '--muted'], cite: ['quote', '--muted'],
};

/* YAML front-matter → properties */
function parseFrontmatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return { props: {}, body: src };
  const props = {}; let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    const li = line.match(/^\s+-\s+(.*)$/);
    if (li && key) { (props[key] = Array.isArray(props[key]) ? props[key] : []).push(li[1].replace(/^["']|["']$/g, '')); continue; }
    const kv = line.match(/^([\w -]+):\s*(.*)$/);
    if (kv) { key = kv[1].trim(); let v = kv[2].trim(); if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean); else v = v.replace(/^["']|["']$/g, ''); props[key] = v; }
  }
  return { props, body: src.slice(m[0].length) };
}

function renderMarkdown(src, isTxt) {
  const { props, body } = renderCore(preview, src, isTxt, state.file);
  state.props = props;
  buildToc();
  updateStats(body);
  if (window.afterRender) afterRender();
}
function renderCore(preview, src, isTxt, file) {
  slugs = {};
  const { props, body } = parseFrontmatter(src);
  const clean = body.replace(/%%[\s\S]*?%%/g, '');
  let html = marked.parse(clean, { breaks: !!isTxt });
  html = DOMPurify.sanitize(html, { ADD_TAGS: ['details', 'summary', 'mark', 'kbd', 'sub', 'sup'], ADD_ATTR: ['target', 'open', 'align'], FORBID_TAGS: ['script', 'iframe', 'object', 'embed'] });
  preview.innerHTML = pageHeader(props, file, body) + html;

  // tables → wrap
  $$('table', preview).forEach((t) => { const w = document.createElement('div'); w.className = 'table-wrap'; t.replaceWith(w); w.appendChild(t); });
  // callouts: Obsidian / GitHub  > [!type]± Optional title
  $$('blockquote', preview).forEach((bq) => {
    const p = bq.firstElementChild; if (!p || p.tagName !== 'P') return;
    const m = p.innerHTML.match(/^\s*\[!([\w-]+)\]([+-]?)[ \t]*([^\n<]*)(\n|<br>)?/i); if (!m) return;
    const type = m[1].toLowerCase(), [ic, color] = CALLOUTS[type] || CALLOUTS.note;
    const title = m[3].trim() || type[0].toUpperCase() + type.slice(1);
    p.innerHTML = p.innerHTML.slice(m[0].length); if (!p.innerHTML.trim()) p.remove();
    const fold = m[2];
    const d = document.createElement(fold ? 'details' : 'div'); d.className = 'callout'; d.style.setProperty('--c', `var(${color})`);
    if (fold === '+') d.open = true;
    const head = document.createElement(fold ? 'summary' : 'div'); head.className = 'ct'; head.innerHTML = `<span class="ci">${icon(ic, 17)}</span> ${title}`;
    const content = document.createElement('div'); content.className = 'cbody'; content.append(...bq.childNodes);
    d.append(head, content); bq.replaceWith(d);
  });
  // assets (images) & note embeds
  $$('img.ml-asset', preview).forEach(async (img) => { const p = state.folder && (await api.findAsset(state.folder, img.dataset.asset)); if (p) img.src = api.fileUrl(p); else img.replaceWith(Object.assign(document.createElement('span'), { className: 'muted', textContent: '🖼 missing: ' + img.dataset.asset })); });
  $$('img:not(.ml-asset)', preview).forEach((img) => { const s = img.getAttribute('src') || ''; if (s && !/^[a-z]+:/i.test(s) && file) img.src = api.fileUrl(file.slice(0, file.lastIndexOf(api.sep)) + api.sep + decodeURIComponent(s)); });
  $$('.embed', preview).forEach(renderEmbed);
  // task lists
  $$('li > input[type=checkbox], li > p > input[type=checkbox]', preview).forEach((cb, i) => {
    cb.disabled = false; cb.dataset.idx = i;
    const li = cb.closest('li'); li.classList.add('task'); if (cb.checked) li.classList.add('done');
  });
  $$('a[href^="http"]', preview).forEach((a) => a.setAttribute('target', '_blank'));
  renderMermaid(preview);
  return { props, body };
}

/* ---------------- Mermaid ---------------- */
const mmCache = new Map(); let mmN = 0, mmKey = '';
const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function initMermaid() {
  const dark = cssVar('--dark') === '1';
  let theme = S.mermaidTheme, vars = {};
  const base = { fontFamily: 'Atkinson Hyperlegible Next Variable, Segoe UI, sans-serif', fontSize: '15px' };
  if (theme === 'auto') {
    theme = 'base';
    vars = { darkMode: dark, background: cssVar('--panel'), primaryColor: cssVar('--panel2'), primaryTextColor: cssVar('--text'), primaryBorderColor: cssVar('--accent'),
      lineColor: cssVar('--muted'), secondaryColor: cssVar('--bg2'), tertiaryColor: cssVar('--panel'), textColor: cssVar('--text'), mainBkg: cssVar('--panel2'),
      nodeBorder: cssVar('--accent'), clusterBkg: cssVar('--bg2'), clusterBorder: cssVar('--border'), titleColor: cssVar('--text'), edgeLabelBackground: cssVar('--panel'),
      actorBkg: cssVar('--panel2'), actorBorder: cssVar('--accent'), actorTextColor: cssVar('--text'), signalColor: cssVar('--text'), signalTextColor: cssVar('--text'),
      noteBkgColor: cssVar('--bg2'), noteTextColor: cssVar('--text'), noteBorderColor: cssVar('--accent'), labelBoxBkgColor: cssVar('--panel2'), labelTextColor: cssVar('--text'), loopTextColor: cssVar('--text') };
  } else if (theme === 'base') {
    vars = { primaryColor: cssVar('--accent'), primaryTextColor: '#ffffff', primaryBorderColor: cssVar('--accent'), lineColor: cssVar('--muted'), textColor: cssVar('--text'), darkMode: dark };
  }
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme, themeVariables: { ...base, ...vars }, flowchart: { htmlLabels: false, curve: 'basis' }, htmlLabels: false });
  mmKey = theme + JSON.stringify(vars);
}
async function renderMermaid(root = preview) {
  for (const wrap of $$('.mermaid-wrap', root)) {
    const code = decodeURIComponent(wrap.dataset.code);
    const key = mmKey + code;
    const out = $('.mm-out', wrap);
    if (mmCache.has(key)) { out.innerHTML = mmCache.get(key); continue; }
    const id = 'mm' + ++mmN;
    try {
      const { svg } = await mermaid.render(id, code);
      out.innerHTML = svg;
      const el = $('svg', out);
      try { // re-fit the viewBox so nothing gets clipped
        const b = el.getBBox(), pad = 12;
        el.setAttribute('viewBox', `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
        el.style.maxWidth = Math.ceil(b.width + pad * 2) + 'px';
        el.removeAttribute('height');
      } catch {}
      mmCache.set(key, out.innerHTML); if (mmCache.size > 200) mmCache.delete(mmCache.keys().next().value);
    } catch (e) {
      out.innerHTML = `<div class="mermaid-err">⚠ Mermaid error\n${esc(e.message || e)}</div>`;
      document.getElementById('d' + id)?.remove(); document.getElementById(id)?.remove();
    }
  }
}

/* ---------------- TOC ---------------- */
function buildToc() {
  const hs = $$('h1,h2,h3,h4', preview);
  $('#tocList').innerHTML = hs.length ? hs.map((h) => `<a class="l${h.tagName[1]}" href="#${h.id}" data-id="${h.id}">${esc(h.textContent.replace(/^#/, ''))}</a>`).join('') : '<span class="muted" style="font-size:12px">No headings</span>';
}
previewPane.addEventListener('scroll', () => {
  const hs = $$('h1,h2,h3,h4', preview); let cur = null;
  for (const h of hs) { if (h.offsetTop - 90 <= previewPane.scrollTop) cur = h.id; else break; }
  $$('#tocList a').forEach((a) => a.classList.toggle('active', a.dataset.id === cur));
});

/* ---------------- Preview interactions ---------------- */
preview.addEventListener('click', async (e) => {
  const copy = e.target.closest('.copy');
  if (copy) { api.copy(decodeURIComponent(copy.closest('pre').querySelector('code').dataset.raw)); copy.textContent = 'Copied'; setTimeout(() => (copy.textContent = 'Copy'), 1200); return; }
  const cb = e.target.closest('input[type=checkbox][data-idx]');
  if (cb) { toggleTask(+cb.dataset.idx, cb.checked); return; }
  const wl = e.target.closest('a.wikilink');
  if (wl) { e.preventDefault(); followWikilink(wl.dataset.target, wl.dataset.heading, e.ctrlKey); return; }
  const tg = e.target.closest('a.tag');
  if (tg) { e.preventDefault(); searchFor('#' + tg.dataset.tag); return; }
  const mm = e.target.closest('.mermaid-wrap');
  if (mm && $('svg', mm)) { openCanvas(mm); return; }
  const a = e.target.closest('a');
  if (a) {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) { e.preventDefault(); document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView({ behavior: 'smooth' }); return; }
    if (!/^[a-z]+:/i.test(href) && /\.(md|markdown|txt)(#.*)?$/i.test(href) && state.file) {
      e.preventDefault();
      const dir = state.file.slice(0, state.file.lastIndexOf(api.sep));
      const target = (dir + api.sep + decodeURIComponent(href.split('#')[0])).replace(/[\\/]/g, api.sep);
      if (await api.exists(target)) openFile(target); else toast('Linked file not found');
    }
  }
});
$('#tocList').addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); document.getElementById(a.dataset.id)?.scrollIntoView({ behavior: 'smooth' }); });

function toggleTask(idx, checked) {
  let n = -1;
  const src = editor.value.replace(/^(\s*(?:[-*+]|\d+[.)])\s+)\[( |x|X)\]/gm, (m, pre) => (++n === idx ? `${pre}[${checked ? 'x' : ' '}]` : m));
  editor.value = src; onEdit(true);
}

/* ---------------- Files & tree ---------------- */
const isTxt = (p) => /\.txt$/i.test(p || '');
const relOf = (p) => (state.folder && p && p.startsWith(state.folder) ? p.slice(state.folder.length + 1) : p ? p.split(/[\\/]/).pop() : '');

async function openFolder(dir, booting) {
  if (!dir) return;
  if (state.folder && state.folder !== dir && window.closeAllTabs) closeAllTabs();
  state.folder = dir; store.set('ml-folder', dir);
  const nm = dir.split(/[\\/]/).pop();
  $('#folderName').textContent = dir; $('#vaultName').textContent = nm; $('#vaultIc').textContent = (nm[0] || 'M').toUpperCase();
  await refreshTree();
  api.watch(dir);
  updateSyncPanel();
  if (!booting && !state.file) { const first = flatFiles(state.tree).find((f) => /readme/i.test(f.name)) || flatFiles(state.tree)[0]; if (first) openFile(first.path); }
}
const flatFiles = (t, acc = []) => { for (const n of t) n.type === 'dir' ? flatFiles(n.children, acc) : acc.push(n); return acc; };
const openDirs = new Set(store.get('ml-open-dirs', []));

async function refreshTree() {
  if (!state.folder) return;
  state.tree = await api.list(state.folder);
  drawTree();
  if (window.rebuildIndex) rebuildIndex();
}
function drawTree() {
  const q = $('#filter').value.trim().toLowerCase();
  const tree = $('#tree');
  if (!state.folder) return;
  if (q) {
    const hits = searchNotes(q);
    tree.innerHTML = hits.map((f) => nodeHtml(f, f.rel) + (f.snippet ? `<div class="snip">${f.snippet}</div>` : '')).join('') || '<div class="empty-side">No matches</div>';
  } else {
    const draw = (nodes) => nodes.map((n) => n.type === 'dir'
      ? `<div class="node dir" data-dir="${esc(n.path)}"><span class="ic chev${openDirs.has(n.path) ? ' open' : ''}">${icon('chevron', 13)}</span><span class="ic">${icon(openDirs.has(n.path) ? 'folderOpen' : 'folder', 15)}</span><span class="nm">${esc(n.name)}</span><span class="add" data-add="${esc(n.path)}" title="Add a page inside">＋</span></div><div class="children ${openDirs.has(n.path) ? '' : 'closed'}">${draw(n.children)}</div>`
      : nodeHtml(n, n.name)).join('');
    tree.innerHTML = draw(state.tree) || '<div class="empty-side">No .md or .txt files here yet.<br>Click <b>＋ New</b> or paste something.</div>';
  }
}
const nodeHtml = (f, label) => `<div class="node file ${f.path === state.file ? 'active' : ''}" data-file="${esc(f.path)}" title="${esc(f.rel)}"><span class="ic">${typeof noteOf === 'function' && noteOf(f.path)?.icon ? esc(noteOf(f.path).icon) : icon(isTxt(f.path) ? 'fileText' : 'file', 15)}</span><span class="nm">${esc(label.replace(/\.(md|markdown)$/i, ''))}</span></div>`;

$('#tree').addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (add) { e.stopPropagation(); openDirs.add(add.dataset.add); newDoc(undefined, 'Untitled', add.dataset.add); return; }
  const d = e.target.closest('[data-dir]');
  if (d) { const p = d.dataset.dir; openDirs.has(p) ? openDirs.delete(p) : openDirs.add(p); store.set('ml-open-dirs', [...openDirs]); drawTree(); return; }
  const f = e.target.closest('[data-file]'); if (f) openFile(f.dataset.file, e.ctrlKey || e.button === 1);
});
$('#tree').addEventListener('auxclick', (e) => { const f = e.target.closest('[data-file]'); if (f && e.button === 1) openFile(f.dataset.file, true); });
$('#tree').addEventListener('dblclick', (e) => { const f = e.target.closest('[data-file]'); if (f) renameInline(f); });
$('#tree').addEventListener('contextmenu', (e) => {
  const f = e.target.closest('[data-file]'); if (!f) return; e.preventDefault();
  ctxMenu(e.clientX, e.clientY, [
    ['✏️ Rename', () => renameInline(f)],
    ['📂 Show in Explorer', () => api.reveal(f.dataset.file)],
    ['📋 Copy path', () => api.copy(f.dataset.file)],
    ['🗑 Move to Recycle Bin', async () => { await api.trash(f.dataset.file); if (state.file === f.dataset.file) closeDoc(); refreshTree(); toast('Moved to Recycle Bin'); }],
  ]);
});
const CTX_ICONS = [[/rename/i, 'edit'], [/explorer|reveal/i, 'folder'], [/copy|duplicate/i, 'copy'], [/recycle|delete|remove|close|unstar/i, 'x'], [/split|side/i, 'split'], [/star/i, 'star'], [/stud|up next/i, 'study'], [/open/i, 'arrowRight']];
function ctxItem(label, fn) {
  const text = String(label).replace(/^[^\p{L}\p{N}]+/u, '');
  const b = document.createElement('div'); b.className = 'node' + (/recycle|delete/i.test(text) ? ' danger' : '');
  b.innerHTML = `<span class="ci">${icon((CTX_ICONS.find(([re]) => re.test(text)) || [0, 'chevron'])[1], 15)}</span><span>${esc(text)}</span>`;
  b.onclick = () => { document.querySelector('.ctx')?.remove(); fn(); };
  return b;
}
function ctxMenu(x, y, items) {
  document.querySelector('.ctx')?.remove();
  const m = document.createElement('div'); m.className = 'ctx';
  items.forEach(([label, fn]) => m.appendChild(ctxItem(label, fn)));
  document.body.appendChild(m);
  const z = S.uiScale || 1, r = m.getBoundingClientRect();
  m.style.left = Math.max(6, Math.min(x, (innerWidth - r.width) / z - 8)) + 'px'; m.style.top = Math.max(46, Math.min(y, (innerHeight - r.height) / z - 8)) + 'px';
  setTimeout(() => document.addEventListener('click', () => m.remove(), { once: true }));
}
function renameInline(el) {
  const p = el.dataset.file, name = p.split(/[\\/]/).pop();
  const nm = $('.nm', el); const inp = document.createElement('input'); inp.value = name; inp.style.cssText = 'width:100%;padding:2px 6px';
  nm.replaceWith(inp); inp.focus(); inp.setSelectionRange(0, name.lastIndexOf('.') > 0 ? name.lastIndexOf('.') : name.length);
  const done = async (ok) => {
    let v = inp.value.trim(); if (!ok || !v || v === name) return drawTree();
    if (!/\.(md|markdown|txt)$/i.test(v)) v += '.md';
    const np = p.slice(0, p.length - name.length) + v;
    if (await api.exists(np)) { toast('A file with that name exists'); return drawTree(); }
    await api.rename(p, np); window.migratePath && migratePath(p, np); if (state.file === p) { state.file = np; store.set('ml-file', np); updateCrumbs(); }
    refreshTree();
  };
  inp.onkeydown = (e) => { if (e.key === 'Enter') done(true); if (e.key === 'Escape') done(false); };
  inp.onblur = () => done(true);
}

async function openFile(p, newTab) {
  if (state.dirty) await save();
  let text;
  try { text = await api.read(p); } catch { toast('That file could not be opened. It may have been moved or deleted.'); if (window.closeTab) closeTab(p, true); return; }
  if (window.tabOpen) tabOpen(p, newTab);
  state.file = p; state.text = text; state.dirty = false; state.untitled = false;
  store.set('ml-file', p);
  editor.value = text;
  renderMarkdown(text, isTxt(p));
  previewPane.scrollTop = 0; editor.scrollTop = 0;
  updateCrumbs(); drawTree(); setDirty(false);
  // expand parent dirs
  if (state.folder && p.startsWith(state.folder)) {
    let dir = p.slice(0, p.lastIndexOf(api.sep)); let changed = false;
    while (dir.length > state.folder.length) { if (!openDirs.has(dir)) { openDirs.add(dir); changed = true; } dir = dir.slice(0, dir.lastIndexOf(api.sep)); }
    if (changed) drawTree();
  }
}
function closeDoc() { state.file = null; state.text = ''; editor.value = ''; showWelcome(); updateCrumbs(); setDirty(false); }
function showWelcome() { preview.innerHTML = $('#welcomeTpl').innerHTML; hydrateIcons(preview); $('#tocList').innerHTML = ''; updateStats(''); }
function updateCrumbs() {
  const rel = state.file ? relOf(state.file) : state.untitled ? 'Untitled (unsaved)' : 'No document';
  $('#crumbs').innerHTML = rel.split(/[\\/]/).map(esc).join('<span class="sep">/</span>');
  $('#stFile').textContent = state.file ? (isTxt(state.file) ? 'Plain text · rendered as Markdown' : 'Markdown') : '';
  document.title = (state.file ? rel.split(/[\\/]/).pop() + ' — ' : '') + 'Maddy MD';
}
function updateStats(src) {
  const w = (src.match(/\S+/g) || []).length;
  $('#stWords').textContent = w ? `${w.toLocaleString()} words · ${src.length.toLocaleString()} chars` : '';
  $('#stRead').textContent = w ? `${Math.max(1, Math.round(w / 230))} min read` : '';
}
function setDirty(d) { state.dirty = d; const el = $('#stDirty'); el.textContent = d ? 'Unsaved' : state.file ? 'Saved' : ''; if (d || state.file) el.dataset.s = d ? 'dirty' : 'saved'; else delete el.dataset.s; }

async function uniqueName(base, ext = '.md') {
  let n = 0, p;
  do { p = state.folder + api.sep + base + (n ? ` ${n}` : '') + ext; n++; } while (await api.exists(p));
  return p;
}
async function uniqueIn(dir, base, ext = '.md') {
  let n = 0, p;
  do { p = dir + api.sep + base + (n ? ` ${n}` : '') + ext; n++; } while (await api.exists(p));
  return p;
}
async function newDoc(content = '\n', baseName = 'Untitled', dir) {
  if (state.dirty) await save();
  if (state.folder) {
    const p = await uniqueIn(dir || state.folder, baseName);
    await api.write(p, content); await refreshTree(); await openFile(p, true);
  } else {
    state.file = null; state.untitled = true; editor.value = content; renderMarkdown(content); setDirty(true); updateCrumbs();
  }
  if (S.mode === 'preview') setMode('split');
  editor.focus(); editor.setSelectionRange(editor.value.length, editor.value.length);
}

async function save() {
  if (!state.dirty) return;
  if (!state.file) {
    const p = await api.saveDialog('Untitled.md', 'md'); if (!p) return;
    state.file = p; state.untitled = false; updateCrumbs();
  }
  await api.write(state.file, editor.value);
  state.text = editor.value; setDirty(false);
  if (S.autoPush) autoPush();
}

/* ---------------- Editing ---------------- */
const liveRender = debounce(() => { const y = previewPane.scrollTop; renderMarkdown(editor.value, isTxt(state.file)); previewPane.scrollTop = y; }, 180);
const autoSave = debounce(() => S.autosave && state.file && save(), 900);
function onEdit(immediate) {
  setDirty(editor.value !== state.text);
  if (immediate) { const y = previewPane.scrollTop; renderMarkdown(editor.value, isTxt(state.file)); previewPane.scrollTop = y; } else liveRender();
  autoSave();
}
editor.addEventListener('input', () => onEdit());
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '  '); }
  if (e.key === 'Enter') { // continue lists
    const s = editor.selectionStart, line = editor.value.slice(editor.value.lastIndexOf('\n', s - 1) + 1, s);
    const m = line.match(/^(\s*)([-*+]|\d+[.)])(\s+)(\[[ xX]\]\s+)?(.*)$/);
    if (m) {
      e.preventDefault();
      if (!m[5].trim() && !m[4]?.trim?.()) { editor.setSelectionRange(s - line.length, s); document.execCommand('insertText', false, ''); return; }
      const bullet = /\d/.test(m[2]) ? parseInt(m[2]) + 1 + m[2].slice(-1) : m[2];
      document.execCommand('insertText', false, '\n' + m[1] + bullet + m[3] + (m[4] ? '[ ] ' : ''));
    }
  }
  const wrapSel = (l, r = l) => { e.preventDefault(); const s = editor.selectionStart, en = editor.selectionEnd, t = editor.value.slice(s, en); document.execCommand('insertText', false, l + t + r); if (!t) editor.setSelectionRange(s + l.length, s + l.length); };
  if (e.ctrlKey && e.key === 'b') wrapSel('**');
  if (e.ctrlKey && e.key === 'i') wrapSel('*');
  if (e.ctrlKey && e.key === 'k') wrapSel('[', '](https://)');
  if (e.ctrlKey && e.key === '`') wrapSel('`');
});

function looksRich(html) { return /<(h[1-6]|li|table|pre|strong|b|em|blockquote|code|a |img|details)\b/i.test(html); }
function clipToMarkdown(html, text) {
  if (S.pasteConvert && html && looksRich(html)) { try { return api.htmlToMd(html).replace(/\n{3,}/g, '\n\n').trim() + '\n'; } catch {} }
  return text;
}
editor.addEventListener('paste', (e) => {
  const html = e.clipboardData.getData('text/html'), text = e.clipboardData.getData('text/plain');
  const md = clipToMarkdown(html, text);
  if (md !== text) { e.preventDefault(); document.execCommand('insertText', false, md); toast('Pasted as Markdown ✨'); }
});
async function pasteAsDoc() {
  const md = clipToMarkdown(api.clipHtml(), api.clipText());
  if (!md || !md.trim()) return toast('Clipboard is empty');
  const h = md.match(/^#{1,3}\s+(.+)$/m);
  let name = (h ? h[1] : md.trim().split('\n')[0]).replace(/[*_`#\[\]<>:"/\\|?]/g, '').trim().slice(0, 50) || 'Pasted';
  await newDoc(md, name);
  setMode('preview'); toast('Created a new doc from the clipboard');
}

editor.addEventListener('scroll', () => {
  if (S.mode !== 'split' || !S.syncScroll) return;
  const r = editor.scrollTop / Math.max(1, editor.scrollHeight - editor.clientHeight);
  previewPane.style.scrollBehavior = 'auto'; previewPane.scrollTop = r * (previewPane.scrollHeight - previewPane.clientHeight); previewPane.style.scrollBehavior = '';
});

/* ---------------- Modes / zoom ---------------- */
function setMode(m) { S.mode = m; saveS(); applyClasses(); $$('#modeSeg button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m)); if (m !== 'preview') editor.focus(); }
$$('#modeSeg button').forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));
function setZoom(z) { S.zoom = Math.min(3, Math.max(0.5, Math.round(z * 10) / 10)); saveS(); document.documentElement.style.setProperty('--zoom', S.zoom); $('#zoomVal').textContent = Math.round(S.zoom * 100) + '%'; }
$('#zoomIn').onclick = () => setZoom(S.zoom + 0.1);
$('#zoomOut').onclick = () => setZoom(S.zoom - 0.1);
$('#zoomVal').onclick = () => setZoom(1);
document.addEventListener('wheel', (e) => { if (e.ctrlKey && !$('#canvas').classList.contains('open')) { e.preventDefault(); setZoom(S.zoom + (e.deltaY < 0 ? 0.1 : -0.1)); } }, { passive: false });

/* ---------------- Settings ---------------- */
function applyClasses() {
  const b = document.body, keep = ['zen', 'paused', 'toc-peek', 'floor'].filter((c) => b.classList.contains(c));
  b.className = [`mode-${S.mode}`, !S.showToc && 'no-toc', !S.showSide && 'no-side', S.focus && 'focus', S.justify && 'justify', S.numbered && 'numbered',
    S.headLine && 'headline', `code-${S.codeStyle}`, `tbl-${S.tableStyle}`, !S.wrap && 'nowrap', S.headColor && 'headcolor', `link-${S.linkStyle}`, `bullet-${S.bullet}`,
    `check-${S.checkStyle}`, `dens-${S.density}`, `tabs-${S.tabStyle}`, !S.showCover && 'no-cover', !S.showProps && 'no-props', !S.showRibbon && 'no-ribbon',
    `motion-${S.motion}`, S.smoothScroll && 'smooth-scroll', S.scene === 'off' && 'scene-none', ...keep].filter(Boolean).join(' ');
}
function applySettings(rerender = true) {
  const r = document.documentElement;
  applyTheme(S);
  Object.entries({ '--fs': S.size + 'px', '--lh': S.lh, '--maxw': S.width + 'px', '--para': S.para, '--font': S.fontBody, '--font-h': S.fontHead, '--font-code': S.fontCode, '--side': S.sideW + 'px',
    '--radius': S.radius + 'px', '--ed-size': S.edSize + 'px', '--speed': S.speed, '--ui': S.uiScale })
    .forEach(([k, v]) => r.style.setProperty(k, v));
  applyClasses(); setZoom(S.zoom);
  api.titlebar(cssVar('--deep'), cssVar('--wing-ink'));
  $('#accent').value = S.accent || cssVar('--accent-fill');
  $('#radiusV').textContent = S.radius + 'px'; $('#edSizeV').textContent = S.edSize + 'px'; $('#uiScaleV').textContent = Math.round(S.uiScale * 100) + '%';
  document.body.style.zoom = S.uiScale;
  $('#rbTheme').innerHTML = icon(cssVar('--dark') === '1' ? 'sun' : 'moon', 19);
  $('#sizeV').textContent = S.size + 'px'; $('#lhV').textContent = S.lh; $('#widthV').textContent = S.width + 'px'; $('#paraV').textContent = S.para + '×';
  $$('.theme-chip').forEach((c) => c.classList.toggle('on', c.dataset.t === S.theme));
  const k = mmKey; initMermaid();
  if (rerender && (state.file || state.untitled) && k !== mmKey) renderMarkdown(editor.value, isTxt(state.file));
}
$('#themes').innerHTML = THEMES.map((t) => `<button class="theme-chip" data-t="${t.id}" title="${t.name}">${themeThumb(t)}<span class="th-meta"><b>${t.name}</b><span>${t.blurb}</span></span></button>`).join('');
$('#themes').onclick = (e) => { const c = e.target.closest('.theme-chip'); if (!c) return; S.theme = c.dataset.t; S.accent = ''; saveS(); applySettings(); };

const bindings = { fontBody: 'value', fontHead: 'value', fontCode: 'value', size: 'num', lh: 'num', width: 'num', para: 'num', justify: 'checked', numbered: 'checked', headLine: 'checked',
  showToc: 'checked', showSide: 'checked', focus: 'checked', syncScroll: 'checked', codeStyle: 'value', tableStyle: 'value', allowHtml: 'checked', pasteConvert: 'checked',
  autosave: 'checked', wrap: 'checked', mermaidTheme: 'value', autoPush: 'checked', radius: 'num', headColor: 'checked', linkStyle: 'value', bullet: 'value', checkStyle: 'value',
  edSize: 'num', density: 'value', uiScale: 'num', tabStyle: 'value', showCover: 'checked', showProps: 'checked', showRibbon: 'checked', motion: 'value', smoothScroll: 'checked',
  slash: 'checked', dailyFolder: 'value', scene: 'value', chars: 'checked', parallax: 'checked', sheetTone: 'value' };
for (const [k, kind] of Object.entries(bindings)) {
  const el = $('#' + k); if (!el) continue;
  if (kind === 'checked') el.checked = S[k]; else el.value = S[k];
  el.addEventListener('input', () => {
    S[k] = kind === 'checked' ? el.checked : kind === 'num' ? +el.value : el.value; saveS(); applySettings();
    if (k === 'allowHtml' && (state.file || state.untitled)) renderMarkdown(editor.value, isTxt(state.file));
  });
}
$('#accent').addEventListener('input', (e) => { S.accent = e.target.value; saveS(); applySettings(); });
$('#resetAccent').onclick = () => { S.accent = ''; saveS(); applySettings(); };
$('#resetAll').onclick = () => { if (!confirm('Reset every setting to its default? Your pages, to-dos, study list and notes are not touched.')) return; S = { ...DEFAULTS }; saveS(); location.reload(); };

/* drawers */
const openDrawer = (id) => { $$('.drawer').forEach((d) => d.classList.toggle('open', d.id === id && !d.classList.contains('open'))); };
$('#settingsBtn').onclick = () => openDrawer('drawer');
$('#syncBtn').onclick = () => { openDrawer('syncDrawer'); updateSyncPanel(); };
$$('[data-close]').forEach((b) => (b.onclick = () => b.closest('.drawer').classList.remove('open')));

/* ---------------- Export ---------------- */
function download(name, blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
const docName = () => (state.file ? state.file.split(/[\\/]/).pop().replace(/\.\w+$/, '') : 'document');
$('#exportHtml').onclick = () => {
  const vars = document.documentElement.getAttribute('style') || '';
  const html = `<!doctype html><html data-theme="${S.theme}" data-dark="${cssVar('--dark')}" style="${esc(vars)}"><head><meta charset="utf-8"><title>${esc(docName())}</title><style>${api.cssText()} html,body{overflow:auto;height:auto}</style></head><body class="${document.body.className.replace(/mode-\w+/, '')}"><article class="md">${preview.innerHTML}</article></body></html>`;
  download(docName() + '.html', new Blob([html], { type: 'text/html' }));
};
$('#exportPdf').onclick = async () => {
  const out = await api.saveDialog(docName() + '.pdf', 'pdf'); if (!out) return;
  const m = S.mode; setMode('preview'); $$('.drawer').forEach((d) => d.classList.remove('open'));
  await new Promise((r) => setTimeout(r, 400)); await api.pdf(out); setMode(m); toast('PDF exported');
};

/* ---------------- Mermaid canvas ---------------- */
const cv = { x: 0, y: 0, s: 1, code: '', svg: null };
const stage = $('#cvStage'), inner = $('#cvInner');
function openCanvas(wrap) {
  cv.code = decodeURIComponent(wrap.dataset.code);
  inner.innerHTML = $('.mm-out', wrap).innerHTML;
  cv.svg = $('svg', inner);
  const vb = cv.svg.viewBox.baseVal;
  if (vb && vb.width) { cv.svg.setAttribute('width', vb.width); cv.svg.setAttribute('height', vb.height); }
  cv.svg.style.maxWidth = 'none';
  $('#canvas').classList.add('open'); stage.classList.add('grid');
  requestAnimationFrame(fitCanvas);
}
function cvApply() { inner.style.transform = `translate(${cv.x}px,${cv.y}px) scale(${cv.s})`; $('#cvZoom').textContent = Math.round(cv.s * 100) + '%'; }
function fitCanvas() {
  const w = cv.svg.width.baseVal.value || inner.offsetWidth, h = cv.svg.height.baseVal.value || inner.offsetHeight;
  const W = stage.clientWidth, H = stage.clientHeight;
  cv.s = Math.min((W - 80) / w, (H - 80) / h, 4); cv.x = (W - w * cv.s) / 2; cv.y = (H - h * cv.s) / 2; cvApply();
}
function cvZoomAt(f, px = stage.clientWidth / 2, py = stage.clientHeight / 2) {
  const ns = Math.min(20, Math.max(0.05, cv.s * f));
  cv.x = px - (px - cv.x) * (ns / cv.s); cv.y = py - (py - cv.y) * (ns / cv.s); cv.s = ns; cvApply();
}
stage.addEventListener('wheel', (e) => { e.preventDefault(); const r = stage.getBoundingClientRect(); cvZoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
stage.addEventListener('pointerdown', (e) => {
  stage.setPointerCapture(e.pointerId); stage.classList.add('dragging');
  const sx = e.clientX - cv.x, sy = e.clientY - cv.y;
  const move = (ev) => { cv.x = ev.clientX - sx; cv.y = ev.clientY - sy; cvApply(); };
  const up = () => { stage.classList.remove('dragging'); stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerup', up); };
  stage.addEventListener('pointermove', move); stage.addEventListener('pointerup', up);
});
stage.addEventListener('dblclick', fitCanvas);
$('#cvIn').onclick = () => cvZoomAt(1.25); $('#cvOut').onclick = () => cvZoomAt(0.8); $('#cvFit').onclick = fitCanvas;
$('#cvBg').onclick = () => stage.classList.toggle('grid');
$('#cvClose').onclick = () => $('#canvas').classList.remove('open');
$('#cvCopy').onclick = () => { api.copy(cv.code); toast('Mermaid code copied'); };
const svgString = () => { const c = cv.svg.cloneNode(true); c.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); return new XMLSerializer().serializeToString(c); };
$('#cvSvg').onclick = () => download('diagram.svg', new Blob([svgString()], { type: 'image/svg+xml' }));
$('#cvPng').onclick = () => {
  const img = new Image(), scale = 3;
  img.onload = () => {
    const w = cv.svg.width.baseVal.value, h = cv.svg.height.baseVal.value;
    const c = document.createElement('canvas'); c.width = w * scale; c.height = h * scale;
    const g = c.getContext('2d'); g.fillStyle = cssVar('--bg'); g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
    try { c.toBlob((b) => download('diagram.png', b)); } catch { toast('PNG export blocked for this diagram, use SVG'); }
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString());
};

/* ---------------- Cloud sync (GitHub Gist) ---------------- */
const gistMap = store.get('ml-gists', {});
function slog(msg) { const l = $('#syncLog'); l.textContent = `[${new Date().toLocaleTimeString()}] ${msg}\n` + l.textContent; }
function updateSyncPanel() {
  $('#token').value = store.get('ml-token', '');
  $('#syncFolder').innerHTML = state.folder ? `Folder: <b>${esc(state.folder.split(/[\\/]/).pop())}</b>${gistMap[state.folder] ? ' · linked ✓' : ' · not synced yet'}` : 'Open a folder first.';
  $('#stSync').textContent = store.get('ml-token', '') ? (gistMap[state.folder] ? 'Synced folder' : 'Sync ready') : '';
}
$('#connect').onclick = async () => {
  const t = $('#token').value.trim(); if (!t) return;
  try { const who = await api.syncTest(t); store.set('ml-token', t); $('#who').textContent = 'Connected as ' + who + ' ✓'; slog('Connected as ' + who); updateSyncPanel(); }
  catch (e) { $('#who').textContent = 'Failed'; slog(e.message); }
};
async function doSync(kind, quiet) {
  const token = store.get('ml-token', '');
  if (!token) { openDrawer('syncDrawer'); return toast('Connect a GitHub token first'); }
  if (!state.folder) return toast('Open a folder first');
  if (kind === 'push' && state.dirty) await save();
  try {
    $('#stSync').textContent = kind === 'push' ? 'Pushing…' : 'Pulling…';
    const r = await (kind === 'push' ? api.syncPush : api.syncPull)({ token, folder: state.folder, gistId: gistMap[state.folder] });
    gistMap[state.folder] = r.gistId; store.set('ml-gists', gistMap);
    slog(`${kind === 'push' ? 'Pushed' : 'Pulled'} ${r.count} file(s) → ${r.url}`);
    if (!quiet) toast(`${kind === 'push' ? 'Pushed' : 'Pulled'} ${r.count} file(s) ☁`);
    if (kind === 'pull') { await refreshTree(); if (state.file) openFile(state.file); }
  } catch (e) { slog('Error: ' + e.message); toast('Sync failed, see the sync panel'); }
  updateSyncPanel();
}
const autoPush = debounce(() => doSync('push', true), 4000);
$('#push').onclick = () => doSync('push');
$('#pull').onclick = () => doSync('pull');

/* ---------------- Toolbar / keys / dnd ---------------- */
const pickFolder = async () => openFolder(await api.pickFolder());
$('#openFolder').onclick = pickFolder;
$('#newFile').onclick = () => newDoc();
$('#pasteNew').onclick = pasteAsDoc;
$('#openFile').onclick = async () => { const p = await api.pickFile(); if (p) openFile(p); };
$('#filter').addEventListener('input', drawTree);
$('#filter').addEventListener('keydown', (e) => { if (e.key === 'Enter') { const f = $('#tree [data-file]'); if (f) openFile(f.dataset.file); } if (e.key === 'Escape') { e.target.value = ''; drawTree(); } });

let toastT;
function toast(m) { const t = $('#toast'); t.textContent = String(m).replace(/[\p{Extended_Pictographic}\uFE0F\u2713]/gu, '').replace(/\s+/g, ' ').trim(); t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); }

document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (e.key === 'Escape') { $('#canvas').classList.remove('open'); $$('.drawer').forEach((d) => d.classList.remove('open')); }
  if (!e.ctrlKey) return;
  if (k === 's') { e.preventDefault(); save().then(() => toast('Saved')); }
  else if (k === ',') { e.preventDefault(); openDrawer('drawer'); }
  else if (k === '1') setMode('preview'); else if (k === '2') setMode('split'); else if (k === '3') setMode('edit');
  else if (k === '=' || k === '+') { e.preventDefault(); setZoom(S.zoom + 0.1); }
  else if (k === '-') { e.preventDefault(); setZoom(S.zoom - 0.1); }
  else if (k === '0') { e.preventDefault(); setZoom(1); }
  else if (k === '\\') { S.showSide = !S.showSide; $('#showSide').checked = S.showSide; saveS(); applyClasses(); }
  else if (k === 'v' && e.shiftKey) { e.preventDefault(); pasteAsDoc(); }
});
// Ctrl+V outside the editor → new doc from clipboard
document.addEventListener('paste', (e) => { if (e.target === editor || /INPUT|TEXTAREA/.test(e.target.tagName)) return; e.preventDefault(); pasteAsDoc(); });

document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
  e.preventDefault(); const f = e.dataTransfer.files[0]; if (!f) return;
  const p = api.pathFor(f); if (!p) return;
  if (/\.(md|markdown|txt)$/i.test(p)) openFile(p); else if (!/\.\w{1,5}$/.test(p)) openFolder(p); else toast('Only .md and .txt files are supported');
});

// sidebar resize
$('#resizer').addEventListener('pointerdown', (e) => {
  const move = (ev) => { S.sideW = Math.min(520, Math.max(180, ev.clientX)); document.documentElement.style.setProperty('--side', S.sideW + 'px'); };
  const up = () => { saveS(); document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
});

// external file changes
api.onFsChanged(debounce(async (p) => {
  await refreshTree();
  if (state.file && !state.dirty && (await api.exists(state.file))) {
    const t = await api.read(state.file);
    if (t !== state.text) { state.text = t; editor.value = t; const y = previewPane.scrollTop; renderMarkdown(t, isTxt(state.file)); previewPane.scrollTop = y; toast('Reloaded external changes'); }
  }
}, 300));

window.addEventListener('beforeunload', () => { if (state.dirty && state.file) api.write(state.file, editor.value); });

/* ---------------- Boot ---------------- */
window.addEventListener('DOMContentLoaded', async function boot() {
  hydrateIcons();
  applySettings(false);
  setMode(S.mode);
  showWelcome(); updateCrumbs(); updateSyncPanel();
  let f = store.get('ml-folder', null);
  if (!f || !(await api.exists(f))) f = await api.defaultVault();
  if (f && (await api.exists(f))) await openFolder(f, true);
  if (window.restoreTabs) await restoreTabs();
});
document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));

/* accessibility: clickable rows behave as buttons for keyboard and assistive tech; icon-only buttons get names */
const ROW_SEL = '.node[data-file], .node[data-dir], .sitem, .bl, .tagrow, .np-item, .np-page, .sg-head, .vault-head, .page-icon, .ctx .node, .tpage, .pill.tagpill, .mermaid-wrap, .tab';
function a11yPass() {
  document.querySelectorAll(ROW_SEL).forEach((el) => { if (el.hasAttribute('role')) return; el.setAttribute('role', el.classList.contains('tab') ? 'tab' : 'button'); el.tabIndex = 0; });
  document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', t.classList.contains('active')));
  document.querySelectorAll('button[title]:not([aria-label])').forEach((b) => { if (!b.textContent.trim()) b.setAttribute('aria-label', b.title.replace(/\s*\(.*$/, '')); });
}
new MutationObserver(debounce(a11yPass, 120)).observe(document.body, { childList: true, subtree: true });
a11yPass();
document.addEventListener('keydown', (e) => {
  const t = e.target; if ((e.key !== 'Enter' && e.key !== ' ') || !t.matches?.('[role=button]:not(button), [role=tab]') || t.isContentEditable) return;
  e.preventDefault(); if (t.classList.contains('tab')) openFile(t.dataset.p); else t.click();
});
