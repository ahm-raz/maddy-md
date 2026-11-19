var COMMANDS_EXTRA = [];
/* Maddy MD vault layer: index, links, backlinks, tags, tabs, palette, graph, slash menu, page header */

/* ============ Index ============ */
const vault = { notes: [], byName: new Map(), byRel: new Map(), built: false };
const baseName = (p) => p.split(/[\\/]/).pop().replace(/\.(md|markdown|txt)$/i, '');
const LINK_RE = /!?\[\[([^\]\n|#^]+)(?:#[^\]\n|]*)?(?:\|[^\]\n]*)?\]\]/g;
const TAG_RE = /(?:^|\s)#([\p{L}_][\p{L}\p{N}_/-]*)/gu;
const stripCode = (t) => t.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

function analyse(n) {
  const { props, body } = parseFrontmatter(n.text);
  const plain = stripCode(body);
  n.props = props; n.base = baseName(n.path);
  n.links = [...plain.matchAll(LINK_RE)].map((m) => m[1].trim());
  const ft = props.tags ? (Array.isArray(props.tags) ? props.tags : String(props.tags).split(/[,\s]+/)) : [];
  n.tags = [...new Set([...ft.filter(Boolean).map((t) => t.replace(/^#/, '')), ...[...plain.matchAll(TAG_RE)].map((m) => m[1])])];
  n.icon = props.icon || '';
  return n;
}
async function rebuildIndex() {
  if (!state.folder) return;
  const first = !vault.built;
  vault.notes = (await api.index(state.folder)).map(analyse);
  vault.byName = new Map(); vault.byRel = new Map();
  for (const n of vault.notes) {
    if (!vault.byName.has(n.base.toLowerCase())) vault.byName.set(n.base.toLowerCase(), n.path);
    vault.byRel.set(n.rel.replace(/\\/g, '/').replace(/\.(md|markdown|txt)$/i, '').toLowerCase(), n.path);
  }
  vault.built = true;
  renderTabs(); drawTags(); drawBacklinks(); drawTree();
  if (first && state.file) renderMarkdown(editor.value, isTxt(state.file));
}
function resolveNote(t) {
  if (!t) return null;
  const k = t.replace(/\\/g, '/').replace(/\.(md|markdown|txt)$/i, '').toLowerCase();
  return vault.byName.get(k) || vault.byRel.get(k) || null;
}
const noteOf = (p) => vault.notes.find((n) => n.path === p);

/* keep index fresh on own edits */
const reindexCurrent = debounce(() => {
  if (!state.file) return;
  const n = noteOf(state.file);
  if (n) { n.text = editor.value; analyse(n); drawBacklinks(); drawTags(); renderTabs(); }
}, 600);
editor.addEventListener('input', reindexCurrent);

/* ============ Links / embeds ============ */
async function followWikilink(target, heading, newTab) {
  if (!target && heading) return scrollToHeading(heading);
  let p = resolveNote(target);
  if (!p) {
    if (!state.folder) return toast('Open a vault to create linked pages');
    p = state.folder + api.sep + target.replace(/[\\/:*?"<>|]/g, '-') + '.md';
    await api.write(p, ''); await refreshTree(); toast('Created page “' + target + '”');
  }
  await openFile(p, newTab);
  if (heading) setTimeout(() => scrollToHeading(heading), 120);
}
function scrollToHeading(h) {
  const want = h.toLowerCase().trim();
  const el = $$('h1,h2,h3,h4,h5,h6', preview).find((x) => x.textContent.replace(/^#/, '').trim().toLowerCase() === want);
  if (el) { el.scrollIntoView({ behavior: 'smooth' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1400); }
}
async function renderEmbed(div) {
  const p = resolveNote(div.dataset.target);
  if (!p) { div.innerHTML = `<div class="muted">Missing page: ${esc(div.dataset.target)}</div>`; return; }
  let text = noteOf(p)?.text ?? (await api.read(p));
  text = parseFrontmatter(text).body;
  const h = div.dataset.heading;
  if (h) {
    const lines = text.split('\n'); const i = lines.findIndex((l) => /^#{1,6}\s/.test(l) && l.replace(/^#+\s*/, '').trim().toLowerCase() === h.toLowerCase());
    if (i >= 0) { const lvl = lines[i].match(/^#+/)[0].length; let j = i + 1; while (j < lines.length && !(new RegExp(`^#{1,${lvl}}\\s`).test(lines[j]))) j++; text = lines.slice(i, j).join('\n'); }
  }
  const saved = slugs; slugs = {};
  div.innerHTML = `<div class="embed-head"><a class="wikilink" data-target="${esc(div.dataset.target)}">${icon('link', 13)} ${esc(baseName(p))}${h ? ' › ' + esc(h) : ''}</a></div>` +
    DOMPurify.sanitize(marked.parse(text.replace(/!\[\[[^\]]+\]\]/g, '')));
  slugs = saved;
}

/* ============ Page header (Notion-style) ============ */
const COVERS = {
  aurora: 'linear-gradient(120deg,#7c5cff,#22d3ee 55%,#34d399)', sunset: 'linear-gradient(120deg,#f97316,#ec4899 60%,#8b5cf6)',
  ocean: 'linear-gradient(120deg,#0ea5e9,#2563eb 60%,#1e1b4b)', forest: 'linear-gradient(120deg,#065f46,#10b981 60%,#a3e635)',
  peach: 'linear-gradient(120deg,#fde68a,#fca5a5 60%,#f9a8d4)', night: 'radial-gradient(circle at 20% 30%,#4c1d95,#0f172a 70%)',
  mono: 'linear-gradient(120deg,#334155,#0f172a)', candy: 'linear-gradient(120deg,#a5f3fc,#c4b5fd 50%,#fbcfe8)',
};
const EMOJIS = '📝 📘 📗 📙 📕 📓 🗒️ 📌 📎 🧠 💡 🚀 🎯 ✅ ⭐ 🔥 ⚡ 🌱 🌊 🌙 ☀️ 🎨 🎵 🧪 🔬 🛠️ ⚙️ 🧩 📊 📈 💼 🏠 ✈️ 🍀 ❤️ 💬 🔒 🗂️ 📅 ⏱️ 🤖 👋 🦄 🐙 🌍 🏔️ 🍕 ☕'.split(' ');
const HIDDEN_PROPS = new Set(['icon', 'cover', 'title', 'banner']);

function pageHeader(props, file = state.file, body) {
  if (!file && !state.untitled) return '';
  const title = props.title || (file ? baseName(file) : 'Untitled');
  const cover = props.cover || props.banner;
  const coverCss = cover ? (COVERS[cover] || (/^(https?:|file:|data:)/.test(cover) ? `url("${cover}") center/cover` : cover)) : '';
  const firstH1 = /^\s*#\s/.test(body ?? parseFrontmatter(editor.value).body);
  const rows = Object.entries(props).filter(([k]) => !HIDDEN_PROPS.has(k.toLowerCase()));
  const val = (k, v) => {
    if (Array.isArray(v)) return v.map((x) => `<span class="pill${/tags?/i.test(k) ? ' tagpill' : ''}" ${/tags?/i.test(k) ? `data-tag="${esc(String(x).replace(/^#/, ''))}"` : ''}>${esc(x)}</span>`).join('');
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) return `<span class="pill date">${icon('calendar', 12)} ${esc(v)}</span>`;
    if (/^(true|false)$/i.test(v)) return `<input type="checkbox" disabled ${/true/i.test(v) ? 'checked' : ''}>`;
    if (/^https?:\/\//.test(v)) return `<a href="${esc(v)}" target="_blank">${esc(v)}</a>`;
    return esc(v);
  };
  const ic = (k) => (/tag/i.test(k) ? 'hash' : /date|created|updated|due/i.test(k) ? 'calendar' : /url|link|source/i.test(k) ? 'link' : /status/i.test(k) ? 'check' : 'type');
  return `<div class="page-head${cover ? ' has-cover' : ''}${props.icon ? ' has-icon' : ''}">
    ${cover ? `<div class="cover" ${window.coverArt && coverArt(cover) ? '' : `style="background:${esc(coverCss)}"`}>${(window.coverArt && coverArt(cover)) || ''}<button class="cover-btn" data-pa="cover">${icon('image', 13)} Change cover</button></div>` : ''}
    ${props.icon ? `<div class="page-icon" data-pa="icon" title="Change icon">${esc(props.icon)}</div>` : ''}
    <div class="page-tools">
      ${props.icon ? '' : `<button data-pa="icon">${icon('smile', 14)} Add icon</button>`}
      ${cover ? '' : `<button data-pa="cover">${icon('image', 14)} Add cover</button>`}
      <button data-pa="prop">${icon('list', 14)} Add property</button>
    </div>
    ${firstH1 ? '' : `<h1 class="page-title">${esc(title)}</h1>`}
    ${rows.length ? `<div class="props">${rows.map(([k, v]) => `<div class="prop"><span class="pk">${icon(ic(k), 14)} ${esc(k)}</span><span class="pv">${val(k, v)}</span></div>`).join('')}</div>` : ''}
  </div>`;
}

function setProp(key, value) {
  let src = editor.value;
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  const line = value == null ? null : `${key}: ${value}`;
  if (m) {
    let lines = m[1].split(/\r?\n/); const i = lines.findIndex((l) => l.startsWith(key + ':'));
    if (i >= 0) { let j = i + 1; while (j < lines.length && /^\s+-/.test(lines[j])) j++; lines.splice(i, j - i, ...(line ? [line] : [])); } else if (line) lines.push(line);
    lines = lines.filter((l) => l.trim());
    src = (lines.length ? `---\n${lines.join('\n')}\n---\n` : '') + src.slice(m[0].length);
  } else if (line) src = `---\n${line}\n---\n` + src;
  editor.value = src; onEdit(true); save();
}

function popover(anchor, html, onClick) {
  $('.popover')?.remove();
  const r = anchor.getBoundingClientRect(), z = S.uiScale || 1;
  const pop = document.createElement('div'); pop.className = 'popover'; pop.innerHTML = html;
  pop.style.left = Math.min(r.left / z, innerWidth / z - 340) + 'px'; pop.style.top = r.bottom / z + 6 + 'px';
  document.body.appendChild(pop);
  pop.addEventListener('click', (e) => { const t = e.target.closest('[data-v]'); if (t) { onClick(t.dataset.v); pop.remove(); } });
  setTimeout(() => document.addEventListener('mousedown', function off(e) { if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener('mousedown', off); } }));
  return pop;
}
preview.addEventListener('click', (e) => {
  const pa = e.target.closest('[data-pa]');
  const tp = e.target.closest('.tagpill');
  if (tp) return searchFor('#' + tp.dataset.tag);
  if (!pa) return;
  const kind = pa.dataset.pa;
  if (kind === 'icon') popover(pa, `<div class="pop-title">Pick an icon</div><div class="emoji-grid">${EMOJIS.map((x) => `<button data-v="${x}">${x}</button>`).join('')}</div><button class="ghost small" data-v="__remove">Remove icon</button>`,
    (v) => setProp('icon', v === '__remove' ? null : v));
  if (kind === 'cover') popover(pa, `<div class="pop-title">Cover</div><div class="cover-grid">${Object.keys(COVERS).map((k) => `<button data-v="${k}" title="${k}">${coverArt(k) || ''}</button>`).join('')}</div><button class="ghost small" data-v="__remove">Remove cover</button>`,
    (v) => setProp('cover', v === '__remove' ? null : v));
  if (kind === 'prop') {
    const pop = popover(pa, `<div class="pop-title">New property</div><input id="pName" placeholder="name (e.g. status)"><input id="pVal" placeholder="value (lists: a, b)"><button class="primary small" id="pAdd">Add</button>`, () => {});
    $('#pName', pop).focus();
    const add = () => { const k = $('#pName', pop).value.trim(), v = $('#pVal', pop).value.trim(); if (!k) return; setProp(k, v.includes(',') ? `[${v}]` : v || '""'); pop.remove(); };
    $('#pAdd', pop).onclick = add; $('#pVal', pop).onkeydown = (e) => e.key === 'Enter' && add();
  }
});

/* ============ Search ============ */
function searchNotes(q) {
  q = q.trim().toLowerCase();
  if (q.startsWith('#')) {
    const t = q.slice(1);
    return vault.notes.filter((n) => n.tags.some((x) => x.toLowerCase().startsWith(t))).map((n) => ({ ...n, snippet: n.tags.map((x) => '#' + esc(x)).join(' ') }));
  }
  const byName = [], byText = [];
  for (const n of vault.notes) {
    if (n.rel.toLowerCase().includes(q)) byName.push({ ...n, snippet: '' });
    else {
      const i = n.text.toLowerCase().indexOf(q);
      if (i >= 0) { const s = n.text.slice(Math.max(0, i - 40), i + q.length + 60).replace(/\s+/g, ' '); const j = s.toLowerCase().indexOf(q); byText.push({ ...n, snippet: esc(s.slice(0, j)) + '<mark>' + esc(s.slice(j, j + q.length)) + '</mark>' + esc(s.slice(j + q.length)) }); }
    }
  }
  return [...byName, ...byText].slice(0, 200);
}
function searchFor(q) { S.showSide = true; $('#showSide').checked = true; applyClasses(); const f = $('#filter'); f.value = q; drawTree(); f.focus(); }

/* ============ Right panel ============ */
$$('.rtabs button').forEach((b) => (b.onclick = () => setRightTab(b.dataset.rt)));
function setRightTab(t) { S.rightTab = t; saveS(); $$('.rtabs button').forEach((x) => x.classList.toggle('on', x.dataset.rt === t)); $$('.rpane').forEach((x) => x.classList.toggle('on', x.dataset.rp === t)); }
setRightTab(S.rightTab);
function drawBacklinks() {
  const box = $('#backlinks'); if (!state.file) { box.innerHTML = ''; return; }
  const me = baseName(state.file).toLowerCase();
  const hits = vault.notes.filter((n) => n.path !== state.file && n.links.some((l) => resolveNote(l) === state.file || l.toLowerCase() === me));
  $('#stLinks').textContent = hits.length ? `${hits.length} backlink${hits.length > 1 ? 's' : ''}` : '';
  box.innerHTML = hits.length ? hits.map((n) => {
    const line = n.text.split('\n').find((l) => l.toLowerCase().includes('[[' + me)) || '';
    return `<div class="bl" data-open="${esc(n.path)}"><b>${n.icon ? esc(n.icon) + ' ' : ''}${esc(n.base)}</b><span>${esc(line.trim().slice(0, 140))}</span></div>`;
  }).join('') : '<span class="muted small-note">No other page links here yet. Link with [[' + esc(baseName(state.file)) + ']]</span>';
}
function drawTags() {
  const counts = {}; vault.notes.forEach((n) => n.tags.forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const list = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  $('#tagList').innerHTML = list.length ? list.map(([t, c]) => `<div class="tagrow" data-tag="${esc(t)}"><span>#${esc(t)}</span><span class="cnt">${c}</span></div>`).join('') : '<span class="muted small-note">No #tags yet</span>';
}
$('#backlinks').onclick = (e) => { const b = e.target.closest('[data-open]'); if (b) openFile(b.dataset.open, e.ctrlKey); };
$('#tagList').onclick = (e) => { const b = e.target.closest('[data-tag]'); if (b) searchFor('#' + b.dataset.tag); };

/* ============ Chrome-style tabs ============ */
const tabs = { list: [], active: null, closed: [] };
function tabOpen(p, newTab) {
  if (!tabs.list.includes(p)) {
    const i = tabs.list.indexOf(tabs.active);
    if (newTab || i < 0) tabs.list.splice(i + 1, 0, p); else tabs.list[i] = p;
    tabs.fresh = p;
  }
  tabs.active = p; renderTabs(); persistTabs();
  setTimeout(drawBacklinks, 0);
}
function persistTabs() { if (state.folder) store.set('ml-tabs:' + state.folder, { list: tabs.list, active: tabs.active }); }
async function closeTab(p, silent) {
  const i = tabs.list.indexOf(p); if (i < 0) return;
  const el = $(`#tabs .tab[data-p="${CSS.escape(p)}"]`);
  if (el && !silent && S.motion !== 'off') { el.classList.add('closing'); await new Promise((r) => setTimeout(r, 160 / S.speed)); }
  if (p === state.file && state.dirty) await save();
  tabs.list.splice(i, 1); tabs.closed.push(p);
  if (tabs.active === p) {
    const next = tabs.list[i] || tabs.list[i - 1];
    tabs.active = null;
    if (next) { tabs.active = next; await openFile(next); } else { closeDoc(); state.file = null; drawTree(); }
  }
  renderTabs(); persistTabs();
}
function closeAllTabs() { tabs.list = []; tabs.active = null; renderTabs(); }
async function restoreTabs() {
  const saved = store.get('ml-tabs:' + state.folder, null);
  if (saved && saved.list?.length) {
    const ok = []; for (const p of saved.list) if (await api.exists(p)) ok.push(p);
    tabs.list = ok;
    const act = ok.includes(saved.active) ? saved.active : ok[0];
    if (act) { tabs.active = act; return openFile(act); }
  }
  const first = flatFiles(state.tree).find((f) => /welcome|readme|index/i.test(f.name)) || flatFiles(state.tree)[0];
  if (first) openFile(first.path, true); else renderTabs();
}
function renderTabs() {
  const box = $('#tabs');
  box.innerHTML = tabs.list.map((p) => {
    const n = noteOf(p); const dirty = p === state.file && state.dirty;
    return `<div class="tab${p === tabs.active ? ' active' : ''}${p === tabs.fresh ? ' opening' : ''}" data-p="${esc(p)}" draggable="true" title="${esc(relOf(p))}">
      <span class="tab-ic">${n?.icon ? esc(n.icon) : icon(isTxt(p) ? 'fileText' : 'file', 14)}</span>
      <span class="tab-t">${esc(baseName(p))}</span>
      <span class="tab-x${dirty ? ' dirty' : ''}" data-x>${icon('x', 12)}</span></div>`;
  }).join('');
  tabs.fresh = null;
  const a = $('.tab.active', box); if (a) a.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
const tabsEl = $('#tabs');
tabsEl.addEventListener('mousedown', (e) => {
  const t = e.target.closest('.tab'); if (!t) return;
  if (e.button === 1) { e.preventDefault(); closeTab(t.dataset.p); return; }
  if (e.button === 0 && !e.target.closest('[data-x]') && t.dataset.p !== tabs.active) openFile(t.dataset.p);
});
tabsEl.addEventListener('click', (e) => { const x = e.target.closest('[data-x]'); if (x) closeTab(x.closest('.tab').dataset.p); });
tabsEl.addEventListener('dblclick', (e) => { if (!e.target.closest('.tab')) newDoc(); });
tabsEl.addEventListener('wheel', (e) => { tabsEl.scrollLeft += e.deltaY; }, { passive: true });
tabsEl.addEventListener('contextmenu', (e) => {
  const t = e.target.closest('.tab'); if (!t) return; e.preventDefault(); const p = t.dataset.p;
  ctxMenu(e.clientX, e.clientY, [
    ['✕ Close', () => closeTab(p)],
    ['⇥ Close others', async () => { tabs.list = [p]; tabs.active = null; await openFile(p); }],
    ['→ Close tabs to the right', () => { tabs.list = tabs.list.slice(0, tabs.list.indexOf(p) + 1); if (!tabs.list.includes(tabs.active)) openFile(p); renderTabs(); persistTabs(); }],
    ['⧉ Duplicate', () => { tabs.list.splice(tabs.list.indexOf(p) + 1, 0, p + ''); renderTabs(); }],
    ['📂 Show in Explorer', () => api.reveal(p)],
  ]);
});
let dragP = null;
tabsEl.addEventListener('dragstart', (e) => { const t = e.target.closest('.tab'); dragP = t?.dataset.p; t?.classList.add('dragging'); });
tabsEl.addEventListener('dragend', () => { dragP = null; renderTabs(); persistTabs(); });
tabsEl.addEventListener('dragover', (e) => {
  e.preventDefault(); const t = e.target.closest('.tab'); if (!t || !dragP || t.dataset.p === dragP) return;
  const from = tabs.list.indexOf(dragP), to = tabs.list.indexOf(t.dataset.p);
  tabs.list.splice(from, 1); tabs.list.splice(to, 0, dragP);
  const r = t.getBoundingClientRect(); const dragEl = $(`.tab[data-p="${CSS.escape(dragP)}"]`, tabsEl);
  if (dragEl) (from < to ? t.after(dragEl) : t.before(dragEl));
});
$('#newTab').onclick = () => openPalette('files');

/* dirty dot on tab */
const _setDirty = setDirty;
setDirty = function (d) { _setDirty(d); const x = state.file && $(`.tab[data-p="${CSS.escape(state.file)}"] .tab-x`, tabsEl); if (x) x.classList.toggle('dirty', d); };

/* ============ Palette ============ */
const pal = { mode: 'files', items: [], sel: 0, newTab: false };
const COMMANDS = () => [
  ['New page', 'filePlus', 'Ctrl+N', () => newDoc()],
  ["Open today's daily note", 'calendar', '', dailyNote],
  ['Quick switcher', 'search', 'Ctrl+O', () => setTimeout(() => openPalette('files'))],
  ['Open graph view', 'graph', 'Ctrl+G', openGraph],
  ['Open folder / vault', 'folderOpen', 'Ctrl+Shift+O', pickFolder],
  ['Paste clipboard as new page', 'clipboard', 'Ctrl+Shift+V', pasteAsDoc],
  ['Read mode', 'book', 'Ctrl+1', () => setMode('preview')], ['Split mode', 'split', 'Ctrl+2', () => setMode('split')], ['Write mode', 'pen', 'Ctrl+3', () => setMode('edit')],
  ['Toggle sidebar', 'sidebarL', 'Ctrl+\\', toggleSide], ['Toggle right panel', 'sidebarR', '', toggleRight],
  ['Switch the reading sheet: light or dark', 'moon', 'Ctrl+Shift+L', toggleDark], ['Toggle focus mode', 'focus', '', () => toggleSetting('focus')],
  ['Customize appearance', 'palette', 'Ctrl+,', () => openDrawer('drawer')], ['Cloud sync: push', 'upload', '', () => doSync('push')], ['Cloud sync: pull', 'download', '', () => doSync('pull')],
  ['Export as HTML', 'download', '', () => $('#exportHtml').click()], ['Export as PDF', 'download', '', () => $('#exportPdf').click()],
  ['Close tab', 'x', 'Ctrl+W', () => state.file && closeTab(state.file)], ['Reopen closed tab', 'chevron', 'Ctrl+Shift+T', reopenTab],
  ['Zoom in', 'zoomIn', 'Ctrl +', () => setZoom(S.zoom + 0.1)], ['Zoom out', 'zoomOut', 'Ctrl −', () => setZoom(S.zoom - 0.1)], ['Reset zoom', 'search', 'Ctrl+0', () => setZoom(1)],
  ['Reveal current page in Explorer', 'folder', '', () => state.file && api.reveal(state.file)],
  ['Copy wikilink to this page', 'link', '', () => state.file && (api.copy(`[[${baseName(state.file)}]]`), toast('Link copied'))],
  ...(window.COMMANDS_EXTRA || []),
  ...THEMES.map((t) => [`Theme: ${t.name}`, 'palette', '', () => { S.theme = t.id; S.accent = ''; saveS(); applySettings(); }]),
];
function fuzzy(q, s) {
  q = q.toLowerCase(); s = s.toLowerCase(); if (!q) return 1;
  const i = s.indexOf(q); if (i >= 0) return 100 - i;
  let j = 0, score = 0; for (const c of s) { if (c === q[j]) { j++; score++; } if (j === q.length) return score; }
  return 0;
}
function openPalette(mode) {
  pal.mode = mode; pal.sel = 0;
  $('#palette').classList.add('open');
  const inp = $('#palInput'); inp.value = mode === 'commands' ? '>' : ''; inp.placeholder = mode === 'commands' ? 'Type a command…' : 'Find or create a page…  (type > for commands)';
  inp.focus(); palFilter();
}
function closePalette() { $('#palette').classList.remove('open'); }
function palFilter() {
  let q = $('#palInput').value;
  const cmd = q.startsWith('>'); if (cmd) q = q.slice(1).trim();
  pal.mode = cmd ? 'commands' : 'files';
  $('#palIc').innerHTML = icon(cmd ? 'command' : 'search', 18);
  if (cmd) pal.items = COMMANDS().map(([t, ic, k, fn]) => ({ t, ic, k, fn, s: fuzzy(q, t) })).filter((x) => x.s).sort((a, b) => b.s - a.s);
  else {
    const recent = store.get('ml-recent', []);
    pal.items = vault.notes.map((n) => ({ t: n.base, sub: n.rel, ic: n.icon, p: n.path, s: fuzzy(q, n.base) * 2 + fuzzy(q, n.rel) + (q ? 0 : 50 - Math.min(50, (recent.indexOf(n.path) + 1 || 51))) }))
      .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 60);
    if (q && !pal.items.some((x) => x.t.toLowerCase() === q.toLowerCase())) pal.items.push({ t: `Create page “${q}”`, ic: '', create: q, s: 0 });
  }
  pal.sel = Math.min(pal.sel, Math.max(0, pal.items.length - 1));
  $('#palList').innerHTML = pal.items.map((x, i) => `<div class="pal-item${i === pal.sel ? ' sel' : ''}" data-i="${i}">
    <span class="pal-ic">${x.fn ? icon(x.ic, 16) : x.create ? icon('plus', 16) : x.ic ? esc(x.ic) : icon('file', 16)}</span>
    <span class="pal-t">${esc(x.t)}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</span>${x.k ? `<kbd>${esc(x.k)}</kbd>` : ''}</div>`).join('') || '<div class="muted" style="padding:16px">Nothing found</div>';
}
async function palRun(i, newTab) {
  const x = pal.items[i]; if (!x) return; closePalette();
  if (x.fn) return x.fn();
  if (x.create) return followWikilink(x.create, null, true);
  openFile(x.p, newTab);
}
$('#palInput').addEventListener('input', () => { pal.sel = 0; palFilter(); });
$('#palInput').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); pal.sel = (pal.sel + (e.key === 'ArrowDown' ? 1 : -1) + pal.items.length) % Math.max(1, pal.items.length); palFilter(); $('.pal-item.sel')?.scrollIntoView({ block: 'nearest' }); }
  if (e.key === 'Enter') { e.preventDefault(); palRun(pal.sel, e.ctrlKey); }
  if (e.key === 'Escape') closePalette();
});
$('#palList').addEventListener('click', (e) => { const it = e.target.closest('.pal-item'); if (it) palRun(+it.dataset.i, e.ctrlKey); });
$('#palette').addEventListener('mousedown', (e) => { if (e.target.id === 'palette') closePalette(); });
const _openFile = openFile;
openFile = async function (p, nt) { const r = store.get('ml-recent', []).filter((x) => x !== p); r.unshift(p); store.set('ml-recent', r.slice(0, 30)); return _openFile(p, nt); };

/* ============ Daily note, new folder, toggles ============ */
async function dailyNote() {
  if (!state.folder) return toast('Open a vault first');
  const d = new Date(), iso = d.toISOString().slice(0, 10);
  const dir = S.dailyFolder ? state.folder + api.sep + S.dailyFolder.replace(/[\\/]/g, api.sep) : state.folder;
  const p = dir + api.sep + iso + '.md';
  if (!(await api.exists(p))) {
    await api.write(p, `---\nicon: 📅\ndate: ${iso}\ntags: [daily]\n---\n\n## Focus\n- [ ] \n\n## Notes\n\n\n## Reflection\n`);
    await refreshTree();
  }
  openFile(p, true);
}
async function newFolder() {
  if (!state.folder) return toast('Open a vault first');
  const p = await uniqueIn(state.folder, 'New folder', '');
  await api.mkdir(p); await api.write(p + api.sep + 'Untitled.md', '');
  openDirs.add(p); await refreshTree();
  const el = $(`[data-dir="${CSS.escape(p)}"]`); if (el) toast('Folder created. Right-click a page to rename it');
}
function toggleSetting(k) { S[k] = !S[k]; const el = $('#' + k); if (el) el.checked = S[k]; saveS(); applySettings(); }
function toggleSide() { toggleSetting('showSide'); }
function toggleRight() { if (innerWidth < 1100) document.body.classList.toggle('toc-peek'); else toggleSetting('showToc'); }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.body.classList.remove('toc-peek'); });
window.addEventListener('resize', () => { if (innerWidth >= 1100) document.body.classList.remove('toc-peek'); });
function toggleDark() {
  S.sheetTone = cssVar('--dark') === '1' ? 'light' : 'dark';
  const el = $('#sheetTone'); if (el) el.value = S.sheetTone;
  saveS(); applySettings();
}
function reopenTab() { const p = tabs.closed.pop(); if (p) openFile(p, true); }

$('#toggleSide').onclick = toggleSide; $('#toggleRight').onclick = toggleRight;
$('#rbFiles').onclick = toggleSide; $('#rbSearch').onclick = () => searchFor($('#filter').value);
$('#rbPalette').onclick = () => openPalette('commands'); $('#rbGraph').onclick = () => openGraph(); $('#rbDaily').onclick = dailyNote;
$('#rbTheme').onclick = toggleDark; $('#newFolder').onclick = newFolder; $('#vaultHead').onclick = pickFolder;
preview.addEventListener('click', (e) => {
  const c = e.target.closest('.welcome .wl-row'); if (!c) return;
  ({ open: pickFolder, paste: pasteAsDoc, graph: openGraph, palette: () => openPalette('commands'), switch: () => openPalette('files'), theme: () => openDrawer('drawer') })[c.dataset.act]?.();
});

/* accent swatches + drawer tabs */
const ACCENTS = ['#a78bfa', '#7c5cff', '#2383e2', '#22d3ee', '#10b981', '#84cc16', '#eab308', '#f97316', '#ef4444', '#ec4899', '#e11d74', '#94a3b8'];
$('#accents').innerHTML = ACCENTS.map((c) => `<button style="background:${c}" data-c="${c}"></button>`).join('');
$('#accents').onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) { S.accent = b.dataset.c; saveS(); applySettings(); } };
$$('.drawer-tabs button').forEach((b) => (b.onclick = () => { $$('.drawer-tabs button').forEach((x) => x.classList.toggle('on', x === b)); $$('[data-ds]').forEach((s) => s.classList.toggle('on', s.dataset.ds === b.dataset.dt)); }));

/* sidebar spotlight */
$('#sidebar').addEventListener('mousemove', (e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', (e.clientX - r.left) + 'px'); e.currentTarget.style.setProperty('--my', (e.clientY - r.top) + 'px'); });

/* ============ Keyboard ============ */
document.addEventListener('keydown', (e) => {
  if (!e.ctrlKey) return;
  const k = e.key.toLowerCase();
  const stop = () => { e.preventDefault(); e.stopImmediatePropagation(); };
  if (k === 'o' && e.shiftKey) { stop(); pickFolder(); }
  else if (k === 'o') { stop(); openPalette('files'); }
  else if (k === 'p') { stop(); openPalette('commands'); }
  else if (k === 'n') { stop(); newDoc(); }
  else if (k === 't' && e.shiftKey) { stop(); reopenTab(); }
  else if (k === 't') { stop(); openPalette('files'); }
  else if (k === 'w') { stop(); if (state.file) closeTab(state.file); }
  else if (k === 'g') { stop(); openGraph(); }
  else if (k === 'l' && e.shiftKey) { stop(); toggleDark(); }
  else if (k === 'f' && e.shiftKey) { stop(); searchFor(''); }
  else if (e.key === 'Tab') { stop(); if (!tabs.list.length) return; const i = tabs.list.indexOf(tabs.active); openFile(tabs.list[(i + (e.shiftKey ? -1 : 1) + tabs.list.length) % tabs.list.length]); }
  else if (/^[1-9]$/.test(e.key) && e.altKey) { stop(); const p = e.key === '9' ? tabs.list.at(-1) : tabs.list[+e.key - 1]; if (p) openFile(p); }
}, true);

/* ============ Slash menu & [[ autocomplete ============ */
const BLOCKS = [
  ['Text', 'type', '', ''], ['Heading 1', 'type', 'h1', '# '], ['Heading 2', 'type', 'h2', '## '], ['Heading 3', 'type', 'h3', '### '],
  ['Bulleted list', 'list', 'ul', '- '], ['Numbered list', 'list', 'ol', '1. '], ['To-do list', 'check', 'todo', '- [ ] '],
  ['Toggle', 'chevron', 'toggle', '<details>\n<summary>Toggle title</summary>\n\nHidden content\n</details>\n'],
  ['Quote', 'backlink', 'quote', '> '], ['Divider', 'layout', 'hr', '---\n'],
  ['Callout: note', 'sparkle', 'callout', '> [!note] Title\n> '], ['Callout: tip', 'sparkle', 'tip', '> [!tip]\n> '], ['Callout: warning', 'sparkle', 'warn', '> [!warning]\n> '],
  ['Callout: foldable', 'sparkle', 'fold', '> [!info]- Click to expand\n> '],
  ['Table', 'layout', 'table', '| Column | Column | Column |\n| --- | --- | --- |\n|  |  |  |\n'],
  ['Code block', 'command', 'code', '```js\n\n```\n'], ['Mermaid flowchart', 'graph', 'mermaid', '```mermaid\nflowchart LR\n  A[Start] --> B{Decide}\n  B -->|yes| C[Do it]\n  B -->|no| D[Skip]\n```\n'],
  ['Mermaid sequence', 'graph', 'seq', '```mermaid\nsequenceDiagram\n  Alice->>Bob: Hello\n  Bob-->>Alice: Hi!\n```\n'],
  ['Mermaid mindmap', 'graph', 'mind', '```mermaid\nmindmap\n  root((Idea))\n    Branch A\n    Branch B\n```\n'],
  ['Link to page', 'link', 'link', '[['], ['Embed page', 'file', 'embed', '![['], ['Image', 'image', 'img', '![alt](image.png)'],
  ['Highlight', 'pen', 'mark', '==text=='], ['Tag', 'hash', 'tag', '#'], ['Comment (hidden)', 'eye', 'comment', '%% hidden note %%'],
  ['Properties', 'list', 'props', '---\nicon: 📝\ntags: []\nstatus: draft\n---\n'], ['Date today', 'calendar', 'date', () => new Date().toISOString().slice(0, 10)],
];
const sm = { open: false, kind: 'slash', start: 0, items: [], sel: 0 };
const smEl = $('#slashMenu');
function caretXY() {
  const m = document.createElement('div'), cs = getComputedStyle(editor);
  ['fontFamily', 'fontSize', 'lineHeight', 'padding', 'border', 'letterSpacing', 'whiteSpace', 'wordWrap', 'tabSize', 'boxSizing'].forEach((p) => (m.style[p] = cs[p]));
  m.style.cssText += `;position:absolute;visibility:hidden;width:${editor.clientWidth}px;white-space:pre-wrap;word-wrap:break-word;overflow:hidden`;
  m.textContent = editor.value.slice(0, editor.selectionStart); const sp = document.createElement('span'); sp.textContent = '​'; m.appendChild(sp);
  document.body.appendChild(m); const x = sp.offsetLeft, y = sp.offsetTop; m.remove();
  const r = editor.getBoundingClientRect(), z = S.uiScale || 1;
  return { x: r.left / z + x - editor.scrollLeft, y: r.top / z + y - editor.scrollTop + parseFloat(cs.lineHeight || 24) };
}
function smShow() {
  const q = editor.value.slice(sm.start, editor.selectionStart).toLowerCase();
  if (sm.kind === 'slash') sm.items = BLOCKS.map((b) => ({ t: b[0], ic: b[1], ins: b[3], s: fuzzy(q, b[0]) * 2 + fuzzy(q, b[2]) })).filter((x) => x.s).sort((a, b) => b.s - a.s);
  else sm.items = vault.notes.map((n) => ({ t: n.base, ic: n.icon, sub: n.rel, s: fuzzy(q, n.base) })).filter((x) => x.s).sort((a, b) => b.s - a.s).slice(0, 12)
    .concat(q && !vault.notes.some((n) => n.base.toLowerCase() === q) ? [{ t: q, sub: 'new page', create: true }] : []);
  if (!sm.items.length) return smClose();
  sm.sel = Math.min(sm.sel, sm.items.length - 1);
  smEl.innerHTML = `<div class="sm-title">${sm.kind === 'slash' ? 'Blocks' : 'Link to page'}</div>` + sm.items.map((x, i) => `<div class="sm-item${i === sm.sel ? ' sel' : ''}" data-i="${i}">
    <span class="sm-ic">${sm.kind === 'slash' ? icon(x.ic, 16) : x.ic ? esc(x.ic) : icon(x.create ? 'plus' : 'file', 15)}</span><span>${esc(x.t)}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</span></div>`).join('');
  const { x, y } = caretXY();
  smEl.style.left = Math.min(x, innerWidth / (S.uiScale || 1) - 300) + 'px'; smEl.style.top = Math.min(y + 4, innerHeight / (S.uiScale || 1) - 340) + 'px';
  smEl.classList.add('open'); sm.open = true;
  $('.sm-item.sel', smEl)?.scrollIntoView({ block: 'nearest' });
}
function smClose() { sm.open = false; smEl.classList.remove('open'); }
function smPick(i) {
  const x = sm.items[i]; if (!x) return;
  const end = editor.selectionStart;
  if (sm.kind === 'slash') {
    const ins = typeof x.ins === 'function' ? x.ins() : x.ins;
    editor.setSelectionRange(sm.start - 1, end); document.execCommand('insertText', false, ins);
    if (ins === '[[' || ins === '![[') { sm.kind = 'link'; sm.start = editor.selectionStart; sm.sel = 0; return smShow(); }
    const sel = ins.indexOf('Title') >= 0 ? ins.indexOf('Title') : ins.includes('```js\n') ? ins.indexOf('\n') + 1 : -1;
    if (sel >= 0) { const base = sm.start - 1; editor.setSelectionRange(base + sel, base + sel + (ins.includes('Title') ? 5 : 0)); }
  } else {
    editor.setSelectionRange(sm.start, end);
    const after = editor.value.slice(end, end + 2) === ']]' ? '' : ']]';
    document.execCommand('insertText', false, x.t + after);
  }
  smClose();
}
editor.addEventListener('input', (e) => {
  const pos = editor.selectionStart, v = editor.value;
  if (sm.open) {
    const q = v.slice(sm.start, pos);
    if (pos < sm.start || /[\n\]]/.test(q) || (sm.kind === 'slash' && /\s/.test(q))) smClose(); else smShow();
    return;
  }
  if (e.data === '/' && S.slash && (pos === 1 || /\s/.test(v[pos - 2]))) { sm.kind = 'slash'; sm.start = pos; sm.sel = 0; smShow(); }
  else if (e.data === '[' && v.slice(pos - 2, pos) === '[[') { sm.kind = 'link'; sm.start = pos; sm.sel = 0; if (v[pos] !== ']') { document.execCommand('insertText', false, ']]'); editor.setSelectionRange(pos, pos); } smShow(); }
});
editor.addEventListener('keydown', (e) => {
  if (!sm.open) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopImmediatePropagation(); sm.sel = (sm.sel + (e.key === 'ArrowDown' ? 1 : -1) + sm.items.length) % sm.items.length; smShow(); }
  else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopImmediatePropagation(); smPick(sm.sel); }
  else if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); smClose(); }
}, true);
editor.addEventListener('blur', () => setTimeout(smClose, 150));
smEl.addEventListener('mousedown', (e) => { e.preventDefault(); const it = e.target.closest('.sm-item'); if (it) smPick(+it.dataset.i); });

/* ============ Graph view ============ */
const G = { nodes: [], edges: [], x: 0, y: 0, s: 1, hover: null, raf: 0, alpha: 1 };
const gc = $('#gCanvas'), gx = gc.getContext('2d');
function openGraph() {
  if (!vault.notes.length) return toast('Open a vault with some pages first');
  $('#graph').classList.add('open');
  buildGraph(); requestAnimationFrame(() => { sizeGraph(); gSettle(); loopGraph(); });
}
function buildGraph() {
  const local = $('#gLocal').checked && state.file, withTags = $('#gTags').checked;
  const map = new Map(); const nodes = [], edges = [];
  const add = (id, label, kind) => { if (!map.has(id)) { const n = { id, label, kind, x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 600, vx: 0, vy: 0, deg: 0 }; map.set(id, n); nodes.push(n); } return map.get(id); };
  for (const n of vault.notes) {
    const a = add(n.path, (n.icon ? n.icon + ' ' : '') + n.base, 'note');
    for (const l of n.links) { const p = resolveNote(l); const b = p ? add(p, baseName(p), 'note') : add('?' + l, l, 'ghost'); edges.push([a, b]); }
    if (withTags) for (const t of n.tags) edges.push([a, add('#' + t, '#' + t, 'tag')]);
  }
  let N = nodes, E = edges;
  if (local) { const me = map.get(state.file); const keep = new Set([me]); E = edges.filter(([a, b]) => (a === me || b === me) && (keep.add(a), keep.add(b))); N = nodes.filter((n) => keep.has(n)); }
  E.forEach(([a, b]) => { a.deg++; b.deg++; });
  G.nodes = N; G.edges = E; G.alpha = 1;
}
function sizeGraph() { const r = gc.parentElement.getBoundingClientRect(); const z = S.uiScale || 1; gc.width = r.width / z * devicePixelRatio; gc.height = (r.height / z - 44) * devicePixelRatio; gc.style.width = r.width / z + 'px'; gc.style.height = r.height / z - 44 + 'px'; }
function gFit() {
  const W = gc.width / devicePixelRatio, H = gc.height / devicePixelRatio; if (!G.nodes.length) return;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const n of G.nodes) { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); }
  const pad = 96;
  G.s = Math.max(0.2, Math.min(1.5, (W - pad * 2) / Math.max(1, x1 - x0), (H - pad * 2) / Math.max(1, y1 - y0)));
  G.x = W / 2 - ((x0 + x1) / 2) * G.s; G.y = H / 2 - ((y0 + y1) / 2) * G.s;
}
function gSettle() { for (let i = 0; i < 280; i++) stepGraph(); gFit(); }
function stepGraph() {
  const N = G.nodes, k = G.alpha;
  for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
    const a = N[i], b = N[j]; let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy || 1; if (d2 > 250000) continue;
    const f = (2400 / d2) * k; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
  }
  for (const [a, b] of G.edges) { const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = ((d - 110) / d) * 0.04 * k; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f; }
  for (const n of N) { if (n === G.drag) continue; n.vx += -n.x * 0.002 * k; n.vy += -n.y * 0.002 * k; n.vx *= 0.82; n.vy *= 0.82; n.x += n.vx; n.y += n.vy; }
  G.alpha = Math.max(0.02, G.alpha * 0.995);
}
function drawGraph() {
  const dpr = devicePixelRatio, ac = cssVar('--accent'), tx = cssVar('--text'), mu = cssVar('--muted'), bd = cssVar('--border');
  gx.setTransform(1, 0, 0, 1, 0, 0); gx.clearRect(0, 0, gc.width, gc.height);
  gx.setTransform(dpr * G.s, 0, 0, dpr * G.s, dpr * G.x, dpr * G.y);
  const h = G.hover, nb = new Set(); if (h) G.edges.forEach(([a, b]) => { if (a === h) nb.add(b); if (b === h) nb.add(a); });
  for (const [a, b] of G.edges) { const on = h && (a === h || b === h); gx.strokeStyle = on ? ac : bd; gx.globalAlpha = h && !on ? 0.25 : 0.9; gx.lineWidth = (on ? 1.8 : 1) / G.s; gx.beginPath(); gx.moveTo(a.x, a.y); gx.lineTo(b.x, b.y); gx.stroke(); }
  for (const n of G.nodes) {
    const r = 4 + Math.min(10, Math.sqrt(n.deg) * 2.2), cur = n.id === state.file;
    gx.globalAlpha = h && n !== h && !nb.has(n) ? 0.25 : 1;
    gx.fillStyle = cur || n === h ? ac : n.kind === 'ghost' ? mu : n.kind === 'tag' ? cssVar('--ok') : tx;
    if (cur || n === h) { gx.shadowColor = ac; gx.shadowBlur = 16; }
    gx.beginPath(); gx.arc(n.x, n.y, r, 0, 7); gx.fill(); gx.shadowBlur = 0;
    if (G.s > 0.55 || n === h || nb.has(n) || cur) { gx.fillStyle = n === h || cur ? tx : mu; gx.font = `${12 / Math.max(0.8, G.s)}px Segoe UI`; gx.textAlign = 'center'; gx.fillText(n.label, n.x, n.y + r + 13 / Math.max(0.8, G.s)); }
  }
  gx.globalAlpha = 1;
}
function loopGraph() { cancelAnimationFrame(G.raf); const tick = () => { if (!$('#graph').classList.contains('open')) return; stepGraph(); drawGraph(); G.raf = requestAnimationFrame(tick); }; tick(); }
const gPt = (e) => { const r = gc.getBoundingClientRect(), z = S.uiScale || 1; return { x: ((e.clientX - r.left) / z - G.x) / G.s, y: ((e.clientY - r.top) / z - G.y) / G.s }; };
const gHit = (p) => G.nodes.find((n) => Math.hypot(n.x - p.x, n.y - p.y) < 12 / Math.min(1, G.s));
gc.addEventListener('mousemove', (e) => { if (G.panning || G.drag) return; G.hover = gHit(gPt(e)) || null; gc.style.cursor = G.hover ? 'pointer' : 'grab'; });
gc.addEventListener('pointerdown', (e) => {
  const p = gPt(e), n = gHit(p), sx = e.clientX, sy = e.clientY, ox = G.x, oy = G.y; let moved = false;
  gc.setPointerCapture(e.pointerId); if (n) G.drag = n; else G.panning = true;
  const mv = (ev) => { moved = moved || Math.hypot(ev.clientX - sx, ev.clientY - sy) > 4; if (G.drag) { const q = gPt(ev); G.drag.x = q.x; G.drag.y = q.y; G.alpha = Math.max(G.alpha, 0.3); } else { G.x = ox + (ev.clientX - sx) / (S.uiScale || 1); G.y = oy + (ev.clientY - sy) / (S.uiScale || 1); } };
  const up = (ev) => { gc.removeEventListener('pointermove', mv); gc.removeEventListener('pointerup', up);
    if (!moved && n && n.kind === 'note') { $('#graph').classList.remove('open'); openFile(n.id, ev.ctrlKey); }
    if (!moved && n && n.kind === 'ghost') { $('#graph').classList.remove('open'); followWikilink(n.label); }
    if (!moved && n && n.kind === 'tag') { $('#graph').classList.remove('open'); searchFor(n.label); }
    G.drag = null; G.panning = false; };
  gc.addEventListener('pointermove', mv); gc.addEventListener('pointerup', up);
});
gc.addEventListener('wheel', (e) => { e.preventDefault(); const r = gc.getBoundingClientRect(), z = S.uiScale || 1, px = (e.clientX - r.left) / z, py = (e.clientY - r.top) / z; const f = e.deltaY < 0 ? 1.12 : 1 / 1.12; const ns = Math.min(4, Math.max(0.1, G.s * f)); G.x = px - (px - G.x) * (ns / G.s); G.y = py - (py - G.y) * (ns / G.s); G.s = ns; }, { passive: false });
$('#gClose').onclick = () => $('#graph').classList.remove('open');
$('#gFit').onclick = gFit;
$('#gLocal').onchange = $('#gTags').onchange = () => { buildGraph(); gSettle(); };
window.addEventListener('resize', () => $('#graph').classList.contains('open') && sizeGraph());
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $('#graph').classList.remove('open'); closePalette(); $('.popover')?.remove(); } });

/* render hook */
function afterRender() {
  if (S.pageAnim && S.motion !== 'off') { preview.classList.remove('enter'); void preview.offsetWidth; preview.classList.add('enter'); }
  drawBacklinks();
}
let lastRendered = null;
const _render = renderMarkdown;
renderMarkdown = function (src, txt) {
  const same = lastRendered === state.file; lastRendered = state.file;
  _render(src, txt);
  if (same) preview.classList.remove('enter');
};

api.onOpenPath((p) => openFile(p, true));

/* ============ Adjustable text column (VS Code style) + Zen mode ============ */
const sashL = $('#sashL'), sashR = $('#sashR'), sashTip = $('#sashTip'), mainEl = $('#centerRow');
function columnBox() {
  // which pane hosts the main text column
  const z = S.uiScale || 1, mr = mainEl.getBoundingClientRect();
  if (S.mode === 'edit') {
    const r = editor.getBoundingClientRect(); const w = r.width / z;
    const cx = (r.left + r.width / 2 - mr.left) / z; return { cx, w, top: 0, bottom: 0, pane: editor };
  }
  if (getComputedStyle(previewPane).display === 'none') return null;
  const pr = previewPane.getBoundingClientRect(), ar = preview.getBoundingClientRect();
  return { cx: (ar.left + ar.width / 2 - mr.left) / z, w: ar.width / z, left: (pr.left - mr.left) / z, pane: previewPane };
}
function placeSashes() {
  const b = columnBox();
  if (!b || (!state.file && !state.untitled)) { sashL.style.display = sashR.style.display = 'none'; return; }
  sashL.style.display = sashR.style.display = '';
  sashL.style.left = b.cx - b.w / 2 - 6 + 'px'; sashR.style.left = b.cx + b.w / 2 - 6 + 'px';
}
let sashing = null;
function startSash(e, side) {
  e.preventDefault(); const b = columnBox(); if (!b) return;
  sashing = { side, cx: b.cx }; document.body.classList.add('sashing'); (side === 'l' ? sashL : sashR).classList.add('active');
  const mr = mainEl.getBoundingClientRect(), z = S.uiScale || 1;
  const move = (ev) => {
    const x = (ev.clientX - mr.left) / z;
    let w = Math.round(Math.abs(x - sashing.cx) * 2 / 10) * 10;
    const maxW = (S.mode === 'edit' ? $('#editorPane').clientWidth : previewPane.clientWidth) - 48;
    w = Math.max(360, Math.min(w, maxW, 2400));
    S.width = w; document.documentElement.style.setProperty('--maxw', w + 'px');
    $('#width').value = w; $('#widthV').textContent = w + 'px';
    sashTip.textContent = w + 'px'; sashTip.style.left = sashing.cx + 'px'; sashTip.classList.add('show');
    placeSashes();
  };
  const up = () => {
    document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
    document.body.classList.remove('sashing'); sashL.classList.remove('active'); sashR.classList.remove('active');
    sashTip.classList.remove('show'); saveS();
  };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
}
sashL.addEventListener('pointerdown', (e) => startSash(e, 'l'));
sashR.addEventListener('pointerdown', (e) => startSash(e, 'r'));
[sashL, sashR].forEach((s) => s.addEventListener('dblclick', () => { S.width = DEFAULTS.width; saveS(); applySettings(false); placeSashes(); toast('Text width reset'); }));
new ResizeObserver(() => placeSashes()).observe(mainEl);
new ResizeObserver(() => placeSashes()).observe(preview);
const _setMode = setMode; setMode = function (m) { _setMode(m); requestAnimationFrame(placeSashes); };
const _applySettings = applySettings; applySettings = function (r) { _applySettings(r); requestAnimationFrame(placeSashes); };
$('#width').addEventListener('input', () => requestAnimationFrame(placeSashes));

/* Zen mode */
let zen = false, zenChord = false, zenBefore = null;
async function toggleZen(force) {
  zen = force ?? !zen;
  document.body.classList.toggle('zen', zen);
  await api.fullscreen(zen);
  if (zen) { const h = $('#zenHint'); h.classList.remove('show'); void h.offsetWidth; h.classList.add('show'); }
  setTimeout(placeSashes, 350);
}
$('#zenBtn').onclick = () => toggleZen();
document.addEventListener('keydown', (e) => {
  if (zenChord) { zenChord = false; if (e.key.toLowerCase() === 'z') { e.preventDefault(); e.stopImmediatePropagation(); toggleZen(); return; } }
  if (e.ctrlKey && e.key.toLowerCase() === 'k' && !e.shiftKey && document.activeElement !== editor) { e.preventDefault(); zenChord = true; setTimeout(() => (zenChord = false), 1500); return; }
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'z') { e.preventDefault(); toggleZen(); return; }
  if (e.key === 'F11') { e.preventDefault(); toggleZen(); return; }
  if (e.key === 'Escape' && zen && !$('#palette').classList.contains('open') && !sm.open && !$('.drawer.open') && !$('.canvas.open')) { toggleZen(false); }
}, true);
editor.addEventListener('keydown', (e) => { if (e.ctrlKey && e.key.toLowerCase() === 'k' && e.shiftKey === false && editor.selectionStart === editor.selectionEnd) { /* Ctrl+K in editor = link; use Ctrl+Alt+Z or F11 for zen */ } });
COMMANDS_EXTRA = [['Toggle Zen mode', 'focus', 'F11', () => toggleZen()], ['Reset text width', 'layout', '', () => { S.width = DEFAULTS.width; saveS(); applySettings(false); }]];
