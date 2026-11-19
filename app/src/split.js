/* Maddy MD split editor groups (VS Code style): split right / left / down, drag tabs or pages to an edge. */
const SP = { panes: [], n: 0 };
const SIDES = { left: $('#leftGroups'), right: $('#rightGroups'), bottom: $('#bottomGroups') };
const spKey = () => 'ml-splits:' + (state.folder || '');
const spSave = () => store.set(spKey(), SP.panes.map(({ path, side, mode, size }) => ({ path, side, mode, size })));

async function splitOpen(path, side = 'right', mode = 'read', size) {
  path = path || state.file;
  if (!path) return toast('Open a page first');
  if (SP.panes.filter((p) => p.side === side).length >= 3) return toast('Up to 3 panes per side');
  const avail = side === 'bottom' ? $('#centerCol').clientHeight : $('#main').clientWidth;
  const pane = { id: 'sp' + ++SP.n, path, side, mode, size: size || Math.round(side === 'bottom' ? Math.min(340, avail * 0.4) : Math.max(260, Math.min(560, avail / (SP.panes.filter((x) => x.side !== 'bottom').length + 2)))), text: '' };
  try { pane.text = await api.read(path); } catch { return toast('Could not open file'); }
  SP.panes.push(pane); buildPane(pane); spSave();
  requestAnimationFrame(() => window.placeSashes && placeSashes());
}
function closePane(id) {
  const p = SP.panes.find((x) => x.id === id); if (!p) return;
  p.el.classList.add('closing');
  setTimeout(() => { p.el.remove(); SP.panes = SP.panes.filter((x) => x !== p); spSave(); window.placeSashes && placeSashes(); }, 160);
}
function buildPane(p) {
  const el = document.createElement('section');
  el.className = `split-pane sp-${p.side}`; el.dataset.id = p.id; p.el = el;
  el.innerHTML = `<div class="sp-gutter" title="Drag to resize"></div>
    <div class="sp-head">
      <span class="sp-ic"></span><span class="sp-name"></span>
      <div class="sp-seg"><button data-m="read" title="Read">${icon('book', 13)}</button><button data-m="edit" title="Edit">${icon('pen', 13)}</button></div>
      <button class="sp-btn" data-a="main" title="Open in main view">${icon('arrowRight', 13)}</button>
      <button class="sp-btn" data-a="swap" title="Move pane (right → bottom → left)">${icon('layout', 13)}</button>
      <button class="sp-btn" data-a="close" title="Close pane">${icon('x', 13)}</button>
    </div>
    <div class="sp-body"><article class="md sp-md"></article><textarea class="sp-editor" spellcheck="false"></textarea></div>`;
  SIDES[p.side].appendChild(el);
  sizePane(p); renderPane(p);
  el.addEventListener('click', (e) => onPaneClick(e, p));
  const ta = $('.sp-editor', el);
  ta.addEventListener('input', () => { p.text = ta.value; p.dirty = true; savePane(p); });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '  '); } if (e.ctrlKey && e.key === 's') { e.preventDefault(); e.stopPropagation(); savePaneNow(p); } });
  $('.sp-gutter', el).addEventListener('pointerdown', (e) => resizePane(e, p));
  $('.sp-gutter', el).addEventListener('dblclick', () => { p.size = p.side === 'bottom' ? 300 : 460; sizePane(p); spSave(); });
}
function sizePane(p) {
  if (p.side === 'bottom') { p.el.style.height = p.size + 'px'; p.el.style.width = ''; }
  else { p.el.style.width = p.size + 'px'; p.el.style.height = ''; }
}
function renderPane(p) {
  const n = typeof noteOf === 'function' && noteOf(p.path);
  $('.sp-ic', p.el).innerHTML = n?.icon ? esc(n.icon) : icon(isTxt(p.path) ? 'fileText' : 'file', 14);
  $('.sp-name', p.el).textContent = baseName(p.path); $('.sp-name', p.el).title = relOf(p.path);
  p.el.classList.toggle('editing', p.mode === 'edit');
  $$('.sp-seg button', p.el).forEach((b) => b.classList.toggle('on', b.dataset.m === p.mode));
  const ta = $('.sp-editor', p.el);
  if (p.mode === 'edit') { if (ta.value !== p.text) ta.value = p.text; }
  else { const body = $('.sp-body', p.el), y = body.scrollTop; renderCore($('.sp-md', p.el), p.text, isTxt(p.path), p.path); body.scrollTop = y; }
}
const _paneTimers = {};
function savePane(p) { clearTimeout(_paneTimers[p.id]); _paneTimers[p.id] = setTimeout(() => savePaneNow(p), 700); }
async function savePaneNow(p) {
  if (!p.dirty) return; p.dirty = false;
  await api.write(p.path, p.text);
  syncSameFile(p.path, p.text, p);
}
/* keep every view of the same file in step */
function syncSameFile(path, text, from) {
  for (const o of SP.panes) if (o !== from && o.path === path) { o.text = text; renderPane(o); }
  if (from && state.file === path && !state.dirty && editor.value !== text) {
    editor.value = text; state.text = text; const y = previewPane.scrollTop; renderMarkdown(text, isTxt(path)); previewPane.scrollTop = y;
  }
  const n = typeof noteOf === 'function' && noteOf(path); if (n) { n.text = text; analyse(n); }
}
function resizePane(e, p) {
  e.preventDefault(); const z = S.uiScale || 1, start = p.side === 'bottom' ? e.clientY : e.clientX, s0 = p.size;
  document.body.classList.add(p.side === 'bottom' ? 'sp-resizing-v' : 'sp-resizing-h');
  const mv = (ev) => {
    const d = ((p.side === 'bottom' ? ev.clientY : ev.clientX) - start) / z;
    p.size = Math.max(p.side === 'bottom' ? 120 : 240, Math.min(p.side === 'bottom' ? 900 : 1400, s0 + (p.side === 'left' ? d : -d)));
    sizePane(p); window.placeSashes && placeSashes();
  };
  const up = () => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); document.body.classList.remove('sp-resizing-v', 'sp-resizing-h'); spSave(); };
  document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
}
async function onPaneClick(e, p) {
  const m = e.target.closest('[data-m]'); if (m) { if (p.mode === 'edit') await savePaneNow(p); p.mode = m.dataset.m; renderPane(p); spSave(); return; }
  const a = e.target.closest('[data-a]');
  if (a?.dataset.a === 'close') { await savePaneNow(p); return closePane(p.id); }
  if (a?.dataset.a === 'main') { await savePaneNow(p); return openFile(p.path); }
  if (a?.dataset.a === 'swap') { const next = { right: 'bottom', bottom: 'left', left: 'right' }[p.side]; p.side = next; p.size = next === 'bottom' ? 300 : 460; p.el.className = `split-pane sp-${next}${p.mode === 'edit' ? ' editing' : ''}`; SIDES[next].appendChild(p.el); sizePane(p); spSave(); window.placeSashes && placeSashes(); return; }
  if (!e.target.closest('.sp-md')) return;
  const copy = e.target.closest('.copy');
  if (copy) { api.copy(decodeURIComponent(copy.closest('pre').querySelector('code').dataset.raw)); copy.textContent = 'Copied ✓'; setTimeout(() => (copy.textContent = 'Copy'), 1200); return; }
  const cb = e.target.closest('input[type=checkbox][data-idx]');
  if (cb) { let n = -1; p.text = p.text.replace(/^(\s*(?:[-*+]|\d+[.)])\s+)\[( |x|X)\]/gm, (mm, pre) => (++n === +cb.dataset.idx ? `${pre}[${cb.checked ? 'x' : ' '}]` : mm)); p.dirty = true; savePaneNow(p); renderPane(p); return; }
  const mm = e.target.closest('.mermaid-wrap'); if (mm && $('svg', mm)) return openCanvas(mm);
  const wl = e.target.closest('a.wikilink');
  if (wl) { e.preventDefault(); const t = resolveNote(wl.dataset.target); if (!t) return followWikilink(wl.dataset.target, wl.dataset.heading, true); if (e.ctrlKey) return openFile(t, true); p.path = t; p.text = await api.read(t); renderPane(p); spSave(); return; }
  const tg = e.target.closest('a.tag'); if (tg) { e.preventDefault(); return searchFor('#' + tg.dataset.tag); }
  const an = e.target.closest('a[href^="#"]'); if (an) { e.preventDefault(); $(`[id="${CSS.escape(decodeURIComponent(an.getAttribute('href').slice(1)))}"]`, p.el)?.scrollIntoView({ behavior: 'smooth' }); }
}

/* main view saved → refresh panes showing that file */
const _saveMain = save;
save = async function () { await _saveMain(); if (state.file) syncSameFile(state.file, editor.value, null); };

/* restore panes when a vault opens */
async function restoreSplits() {
  Object.values(SIDES).forEach((s) => (s.innerHTML = '')); SP.panes = [];
  for (const p of store.get(spKey(), [])) if (await api.exists(p.path)) await splitOpen(p.path, p.side, p.mode, p.size);
}
const _openFolder = openFolder;
openFolder = async function (dir, booting) { await _openFolder(dir, booting); restoreSplits(); };
if (state.folder) restoreSplits();

/* external changes */
api.onFsChanged(debounce(async () => {
  for (const p of SP.panes) {
    if (p.dirty || document.activeElement === $('.sp-editor', p.el)) continue;
    if (!(await api.exists(p.path))) continue;
    const t = await api.read(p.path); if (t !== p.text) { p.text = t; renderPane(p); }
  }
}, 400));

/* ===== Split button menu, shortcuts, tab/tree menus ===== */
const splitMenu = (x, y, path) => ctxMenu(x, y, [
  ['⇥  Split right', () => splitOpen(path, 'right')],
  ['⇤  Split left', () => splitOpen(path, 'left')],
  ['⤓  Split down', () => splitOpen(path, 'bottom')],
  ...(SP.panes.length ? [['✕  Close all split panes', () => SP.panes.slice().forEach((p) => closePane(p.id))]] : []),
]);
$('#splitBtn').onclick = (e) => { const r = $('#splitBtn').getBoundingClientRect(), z = S.uiScale || 1; splitMenu(r.left / z - 140, r.bottom / z + 6, state.file); e.stopPropagation(); };
document.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey && e.altKey)) return;
  const side = { ArrowRight: 'right', ArrowLeft: 'left', ArrowDown: 'bottom' }[e.key];
  if (side) { e.preventDefault(); e.stopImmediatePropagation(); splitOpen(state.file, side); }
}, true);
$('#tabs').addEventListener('contextmenu', (e) => {
  const t = e.target.closest('.tab'); const m = $('.ctx'); if (!t || !m) return;
  [['⤓ Split down', 'bottom'], ['⇤ Split left', 'left'], ['⇥ Split right', 'right']].forEach(([l, s]) => m.prepend(ctxItem(l, () => splitOpen(t.dataset.p, s))));
});
$('#tree').addEventListener('contextmenu', (e) => {
  const f = e.target.closest('[data-file]'); const m = $('.ctx'); if (!f || !m) return;
  m.prepend(ctxItem('Open to the side', () => splitOpen(f.dataset.file, 'right')));
});
$('#tree').addEventListener('click', (e) => { const f = e.target.closest('[data-file]'); if (f && e.altKey) { e.stopImmediatePropagation(); splitOpen(f.dataset.file, 'right'); } }, true);
COMMANDS_EXTRA.push(
  ['Split right', 'split', 'Ctrl+Alt+→', () => splitOpen(state.file, 'right')],
  ['Split left', 'split', 'Ctrl+Alt+←', () => splitOpen(state.file, 'left')],
  ['Split down', 'split', 'Ctrl+Alt+↓', () => splitOpen(state.file, 'bottom')],
  ['Close all split panes', 'x', '', () => SP.panes.slice().forEach((p) => closePane(p.id))],
);

/* ===== Drag a tab or a sidebar page onto an edge (VS Code drop zones) ===== */
const dz = $('#dropZones'), dzLabel = $('#dropLabel');
let dragPath = null, dzSide = null;
document.addEventListener('dragstart', (e) => {
  const t = e.target.closest?.('.tab, #tree [data-file], #pinned [data-file]'); if (!t) return;
  dragPath = t.dataset.p || t.dataset.file;
  try { e.dataTransfer.setData('text/plain', dragPath); e.dataTransfer.effectAllowed = 'copyMove'; } catch {}
  setTimeout(() => dz.classList.add('on'), 0);
});
document.addEventListener('dragend', () => { dz.classList.remove('on'); dz.dataset.side = ''; dragPath = null; });
dz.addEventListener('dragover', (e) => {
  if (!dragPath) return; e.preventDefault();
  const r = dz.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  dzSide = x < 0.25 ? 'left' : x > 0.75 ? 'right' : y > 0.7 ? 'bottom' : 'center';
  dz.dataset.side = dzSide;
  dzLabel.textContent = { left: 'Split left', right: 'Split right', bottom: 'Split down', center: 'Open here' }[dzSide];
});
dz.addEventListener('dragleave', (e) => { if (!dz.contains(e.relatedTarget)) dz.dataset.side = ''; });
dz.addEventListener('drop', (e) => {
  e.preventDefault(); e.stopPropagation(); const p = dragPath; dz.classList.remove('on'); dz.dataset.side = '';
  if (!p) return; if (dzSide === 'center') openFile(p); else splitOpen(p, dzSide);
});
/* make sidebar pages draggable */
const _drawTree3 = drawTree; drawTree = function () { _drawTree3(); $$('#tree [data-file], #pinned [data-file]').forEach((n) => (n.draggable = true)); };
const _drawPinned = drawPinned; drawPinned = function () { _drawPinned(); $$('#pinned [data-file]').forEach((n) => (n.draggable = true)); };
drawTree();
