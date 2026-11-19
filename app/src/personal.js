/* Maddy MD personal layer: To-do, Study list, Sticky notes, Stars, Reading progress & resume.
   Everything here lives only in this PC's local storage (never in your .md files, never synced). */

const P = {
  todos: store.get('ml-todos', []),
  study: store.get('ml-study', []),
  sticky: store.get('ml-sticky', {}),
  stars: store.get('ml-stars', []),
  scroll: store.get('ml-scroll', {}),
  todoFilter: store.get('ml-todo-filter', 'all'),
  studyOpen: store.get('ml-study-open', { todo: true, reading: true, done: false }),
};
const saveP = (k) => store.set({ todos: 'ml-todos', study: 'ml-study', sticky: 'ml-sticky', stars: 'ml-stars', scroll: 'ml-scroll' }[k], P[k]);
const uid = () => Math.random().toString(36).slice(2, 10);
const short = (p) => (p ? baseName(p) : '');
const ago = (t) => { if (!t) return ''; const s = (Date.now() - t) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + 'm ago' : s < 86400 ? Math.floor(s / 3600) + 'h ago' : Math.floor(s / 86400) + 'd ago'; };
const inVault = (p) => !state.folder || p.startsWith(state.folder);

/* ============ Rename migration ============ */
function migratePath(a, b) {
  P.todos.forEach((t) => t.page === a && (t.page = b)); saveP('todos');
  P.study.forEach((s) => s.path === a && (s.path = b)); saveP('study');
  if (P.sticky[a]) { P.sticky[b] = P.sticky[a]; delete P.sticky[a]; saveP('sticky'); }
  P.stars = P.stars.map((s) => (s === a ? b : s)); saveP('stars');
  if (P.scroll[a] != null) { P.scroll[b] = P.scroll[a]; delete P.scroll[a]; saveP('scroll'); }
}

/* ============ TO-DO ============ */
let todoLinkPage = false;
function drawTodos() {
  const box = $('#todoPane'); const f = P.todoFilter;
  const list = P.todos.filter((t) => (f === 'done' ? t.done : f === 'page' ? t.page === state.file && !t.done : !t.done));
  const open = P.todos.filter((t) => !t.done).length;
  $('#todoBadge').textContent = open || ''; updateVignette();
  box.innerHTML = `
    <div class="pane-head"><b>${icon('todo', 15)} To-Do</b><span class="muted">${open} open</span></div>
    <div class="todo-add">
      <input id="todoInput" aria-label="New task" placeholder="Add a task…" spellcheck="false" autocomplete="off" />
      <button id="todoLink" class="${todoLinkPage ? 'on' : ''}" title="Link the task to the current page">${icon('link', 14)}</button>
    </div>
    <div class="chips">${[['all', 'Open'], ['page', 'This page'], ['done', 'Done']].map(([k, l]) => `<button data-tf="${k}" class="${f === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <ul class="todos">${list.map((t) => `
      <li class="todo${t.done ? ' done' : ''}${t.pri ? ' pri' : ''}" data-id="${t.id}" draggable="true">
        <button class="tcheck" data-a="done">${t.done ? icon('check', 12) : ''}</button>
        <div class="tbody"><span class="ttext" data-a="edit">${esc(t.text)}</span>
          ${t.page ? `<span class="tpage" data-a="page">${icon('file', 11)} ${esc(short(t.page))}</span>` : ''}
          <span class="tmeta">${ago(t.created)}</span></div>
        <button class="tbtn${t.pri ? ' on' : ''}" data-a="pri" title="Important">!</button>
        <button class="tbtn" data-a="del" title="Delete">${icon('x', 12)}</button>
      </li>`).join('') || `<li class="empty-note">${f === 'done' ? 'Nothing finished yet.' : 'All clear ✨'}</li>`}</ul>
    ${P.todos.some((t) => t.done) ? '<button class="ghost small" id="todoClear">Clear Finished</button>' : ''}`;
  const inp = $('#todoInput');
  inp.onkeydown = (e) => {
    if (e.key !== 'Enter' || !inp.value.trim()) return;
    P.todos.unshift({ id: uid(), text: inp.value.trim(), done: false, created: Date.now(), page: todoLinkPage && state.file ? state.file : null, pri: false });
    saveP('todos'); drawTodos(); $('#todoInput').focus();
  };
  $('#todoLink').onclick = () => { todoLinkPage = !todoLinkPage; drawTodos(); $('#todoInput').focus(); if (todoLinkPage && !state.file) toast('Open a page to link tasks to it'); };
  const clr = $('#todoClear'); if (clr) clr.onclick = () => { P.todos = P.todos.filter((t) => !t.done); saveP('todos'); drawTodos(); };
}
$('#todoPane').addEventListener('click', (e) => {
  const tf = e.target.closest('[data-tf]'); if (tf) { P.todoFilter = tf.dataset.tf; store.set('ml-todo-filter', P.todoFilter); return drawTodos(); }
  const a = e.target.closest('[data-a]'); if (!a) return;
  const li = a.closest('.todo'); const t = P.todos.find((x) => x.id === li?.dataset.id); if (!t) return;
  const act = a.dataset.a;
  if (act === 'done') { t.done = !t.done; t.doneAt = Date.now(); if (t.done) { li.classList.add('just-done'); setTimeout(() => { saveP('todos'); drawTodos(); }, 380); return; } }
  if (act === 'pri') t.pri = !t.pri;
  if (act === 'del') { li.classList.add('removing'); setTimeout(() => { P.todos = P.todos.filter((x) => x !== t); saveP('todos'); drawTodos(); }, 200); return; }
  if (act === 'page') return openFile(t.page, true);
  if (act === 'edit') {
    a.contentEditable = 'true'; a.focus(); document.getSelection().selectAllChildren(a);
    const done = () => { a.contentEditable = 'false'; const v = a.textContent.trim(); if (v) t.text = v; saveP('todos'); drawTodos(); };
    a.onblur = done; a.onkeydown = (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); a.blur(); } if (ev.key === 'Escape') { a.textContent = t.text; a.blur(); } };
    return;
  }
  saveP('todos'); drawTodos();
});
let dragTodo = null;
$('#todoPane').addEventListener('dragstart', (e) => { dragTodo = e.target.closest('.todo')?.dataset.id; e.target.closest('.todo')?.classList.add('dragging'); });
$('#todoPane').addEventListener('dragover', (e) => {
  e.preventDefault(); const li = e.target.closest('.todo'); if (!li || !dragTodo || li.dataset.id === dragTodo) return;
  const from = P.todos.findIndex((t) => t.id === dragTodo), to = P.todos.findIndex((t) => t.id === li.dataset.id);
  const [m] = P.todos.splice(from, 1); P.todos.splice(to, 0, m);
  const el = $(`.todo[data-id="${dragTodo}"]`); from < to ? li.after(el) : li.before(el);
});
$('#todoPane').addEventListener('dragend', () => { dragTodo = null; saveP('todos'); drawTodos(); });

/* ============ STUDY LIST ============ */
const studyOf = (p) => P.study.find((s) => s.path === p);
const STATUS = { todo: ['Up next', '#94a3b8'], reading: ['Studying', '#f59e0b'], done: ['Studied', '#10b981'] };
function addStudy(paths, quiet) {
  let n = 0;
  for (const p of [].concat(paths)) if (!studyOf(p)) { P.study.push({ path: p, added: Date.now(), status: 'todo', progress: 0, lastRead: 0 }); n++; }
  saveP('study'); drawStudy(); decorate();
  if (!quiet) toast(n ? `Added ${n} page${n > 1 ? 's' : ''} to your study list 📚` : 'Already in your study list');
}
function removeStudy(p) { P.study = P.study.filter((s) => s.path !== p); saveP('study'); drawStudy(); decorate(); }
function setStudy(p, status) {
  const s = studyOf(p); if (!s) return; s.status = status;
  if (status === 'done') { s.doneAt = Date.now(); s.progress = Math.max(s.progress, 100); if (window.sceneCheer && S.motion === 'full') sceneCheer(); }
  saveP('study'); drawStudy(); decorate(); updateFinishBar();
}
function nextStudy(exceptPath) {
  const list = P.study.filter((s) => inVault(s.path) && s.status !== 'done' && s.path !== exceptPath);
  return list.find((s) => s.status === 'reading') || list[0];
}
function drawStudy() {
  const all = P.study.filter((s) => inVault(s.path));
  const done = all.filter((s) => s.status === 'done').length, left = all.length - done;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  $('#studyBadge').textContent = left || '';
  let st = $('#stStudy'); if (!st) { st = document.createElement('span'); st.id = 'stStudy'; st.style.cursor = 'pointer'; st.onclick = () => openRight('study'); $('#stSync').before(st); }
  st.textContent = left ? `${left} left to study` : all.length ? 'Study list complete' : '';
  const next = nextStudy();
  const group = (key) => {
    const items = all.filter((s) => s.status === key); if (!items.length) return '';
    const open = P.studyOpen[key] !== false;
    return `<div class="sgroup${open ? ' open' : ''}" data-g="${key}">
      <div class="sg-head" data-toggle="${key}"><span class="sg-dot" data-st="${key}"></span>${STATUS[key][0]} <span class="muted">${items.length}</span><span class="sg-chev">${icon('chevron', 12)}</span></div>
      <div class="sg-body">${items.map((s) => {
        const n = noteOf(s.path), rel = relOf(s.path), dir = rel.includes(api.sep) ? rel.slice(0, rel.lastIndexOf(api.sep)) : '';
        return `<div class="sitem${s.path === state.file ? ' cur' : ''}" data-p="${esc(s.path)}" draggable="true">
          <span class="si-ic">${n?.icon ? esc(n.icon) : icon('file', 14)}</span>
          <div class="si-body"><b>${esc(short(s.path))}</b><small>${esc(dir)}${s.lastRead ? (dir ? ' · ' : '') + 'read ' + ago(s.lastRead) : ''}</small>
            <div class="si-bar"><i style="width:${Math.round(s.progress)}%"></i></div></div>
          <button class="tbtn" data-s="cycle" title="Change status">${icon(s.status === 'done' ? 'bookmarkCheck' : s.status === 'reading' ? 'play' : 'bookmarkPlus', 13)}</button>
          <button class="tbtn" data-s="del" title="Remove from list">${icon('x', 12)}</button></div>`;
      }).join('')}</div></div>`;
  };
  $('#studyPane').innerHTML = `
    <div class="pane-head"><b>${icon('study', 15)} Study List</b><span class="muted">${done}/${all.length}</span></div>
    ${all.length ? `<div class="study-sum"><b>${done} of ${all.length} studied</b><span>${left ? `${left} page${left > 1 ? 's' : ''} still waiting` : 'Everything in the list is studied.'}</span><div class="marks">${all.slice(0, 72).map((s) => `<i class="mk s-${s.status}" title="${esc(short(s.path))}"></i>`).join('')}</div></div>` : ''}
    ${next ? `<button class="primary wide" id="studyNext">${icon('play', 13)} ${next.status === 'reading' ? 'Continue' : 'Start'}: ${esc(short(next.path))}</button>` : ''}
    <button class="wide" id="studyAddCur" ${!state.file || studyOf(state.file) ? 'disabled' : ''}>${icon('bookmarkPlus', 14)} ${state.file && studyOf(state.file) ? 'This Page Is in the List' : 'Add This Page'}</button>
    ${group('reading')}${group('todo')}${group('done')}
    ${all.length ? '' : '<div class="empty-note">Queue the pages you need to study so none get skipped. Use the bookmark button in the toolbar, or right-click a page or a whole folder in the sidebar. Queued pages carry a mark in the sidebar until they are studied</div>'}`;
  const nb = $('#studyNext'); if (nb) nb.onclick = () => openFile(next.path, true);
  $('#studyAddCur').onclick = () => state.file && addStudy(state.file);
  updateDocbar(); updateVignette();
}
$('#studyPane').addEventListener('click', (e) => {
  const tg = e.target.closest('[data-toggle]'); if (tg) { const k = tg.dataset.toggle; P.studyOpen[k] = P.studyOpen[k] === false; store.set('ml-study-open', P.studyOpen); return drawStudy(); }
  const it = e.target.closest('.sitem'); if (!it) return; const p = it.dataset.p;
  const b = e.target.closest('[data-s]');
  if (b?.dataset.s === 'del') return removeStudy(p);
  if (b?.dataset.s === 'cycle') { const s = studyOf(p); return setStudy(p, { todo: 'reading', reading: 'done', done: 'todo' }[s.status]); }
  openFile(p, e.ctrlKey);
});
let dragStudy = null;
$('#studyPane').addEventListener('dragstart', (e) => { dragStudy = e.target.closest('.sitem')?.dataset.p; });
$('#studyPane').addEventListener('dragover', (e) => {
  e.preventDefault(); const it = e.target.closest('.sitem'); if (!it || !dragStudy || it.dataset.p === dragStudy) return;
  const from = P.study.findIndex((s) => s.path === dragStudy), to = P.study.findIndex((s) => s.path === it.dataset.p);
  const [m] = P.study.splice(from, 1); P.study.splice(to, 0, m); m.status = studyOf(it.dataset.p).status;
  const el = $(`.sitem[data-p="${CSS.escape(dragStudy)}"]`); if (el) (from < to ? it.after(el) : it.before(el));
});
$('#studyPane').addEventListener('dragend', () => { dragStudy = null; saveP('study'); drawStudy(); decorate(); });

/* finish bar + reading progress */
function updateFinishBar() {
  const fb = $('#finishBar'), s = state.file && studyOf(state.file);
  if (!s || s.status === 'done' || (P.cur ?? 0) < 97) { fb.classList.remove('show'); return; }
  const nx = nextStudy(state.file);
  fb.innerHTML = `<span>You reached the end of <b>${esc(short(state.file))}</b></span>
    <button class="primary small" id="fbDone">${icon('check', 13)} Mark as Studied</button>
    ${nx ? `<button class="small" id="fbNext">Next: ${esc(short(nx.path))} ${icon('arrowRight', 13)}</button>` : ''}`;
  fb.classList.add('show');
  $('#fbDone').onclick = () => { setStudy(state.file, 'done'); toast('Marked as studied ✓'); };
  const n = $('#fbNext'); if (n) n.onclick = () => { setStudy(state.file, 'done'); openFile(nx.path); };
}
const saveScroll = debounce(() => { saveP('scroll'); saveP('study'); drawStudy(); }, 700);
previewPane.addEventListener('scroll', () => {
  if (!state.file) return;
  const max = previewPane.scrollHeight - previewPane.clientHeight;
  const pct = max > 0 ? Math.min(100, (previewPane.scrollTop / max) * 100) : 100;
  $('#readBar').style.width = pct + '%';
  if (S.parallax !== false && S.motion === 'full' && window.sceneParallax) sceneParallax(pct / 100);
  P.scroll[state.file] = Math.round(previewPane.scrollTop);
  const s = studyOf(state.file); P.cur = pct;
  if (s && pct > s.progress) { s.progress = pct; if (s.status === 'todo' && pct > 3) s.status = 'reading'; }
  updateFinishBar();
  saveScroll();
});

/* ============ STICKY NOTES ============ */
const COLORS = { yellow: '#fde68a', pink: '#fbcfe8', blue: '#bfdbfe', green: '#bbf7d0', purple: '#ddd6fe', orange: '#fed7aa' };
const layer = $('#stickyLayer');
const notesHere = () => (state.file && P.sticky[state.file]) || [];
const saveSticky = debounce(() => saveP('sticky'), 300);
function addSticky(x, y, text = '') {
  if (!state.file) return toast('Open a page first');
  if (S.mode === 'edit') setMode('split');
  if (S.hideStickies) { S.hideStickies = false; saveS(); }
  const pw = previewPane.clientWidth;
  const ar = preview.getBoundingClientRect(), pr = previewPane.getBoundingClientRect(), z = S.uiScale || 1;
  const defX = Math.min(pw - 250, (ar.right - pr.left) / z + 16);
  const n = { id: uid(), x: (x ?? Math.max(16, defX)) / pw, y: y ?? previewPane.scrollTop + 90, w: 230, h: 170, color: store.get('ml-sticky-color', 'yellow'), text, created: Date.now(), collapsed: false };
  (P.sticky[state.file] = P.sticky[state.file] || []).push(n); saveP('sticky');
  drawStickies(n.id); drawNotesPane();
}
function drawStickies(focusId) {
  layer.innerHTML = '';
  layer.classList.toggle('hidden', !!S.hideStickies);
  const pw = previewPane.clientWidth;
  for (const n of notesHere()) {
    const el = document.createElement('div');
    el.className = `sticky${n.collapsed ? ' collapsed' : ''}${n.id === focusId ? ' born' : ''}`; el.dataset.id = n.id;
    el.style.cssText = `left:${Math.max(0, Math.min(n.x * pw, pw - 120))}px;top:${n.y}px;width:${n.w}px;height:${n.collapsed ? 'auto' : n.h + 'px'};--sc:${COLORS[n.color] || COLORS.yellow}`;
    el.innerHTML = `<div class="st-head"><span class="st-grip">${icon('sticky', 12)}</span>
      <span class="st-dots">${Object.entries(COLORS).map(([k, c]) => `<i data-c="${k}" style="background:${c}" class="${n.color === k ? 'on' : ''}"></i>`).join('')}</span>
      <span class="st-time">${ago(n.created)}</span>
      <button data-st="collapse" title="${n.collapsed ? 'Expand' : 'Collapse'}">${icon(n.collapsed ? 'plus' : 'minus', 12)}</button>
      <button data-st="del" title="Delete note">${icon('x', 12)}</button></div>
      ${n.collapsed ? `<div class="st-peek">${esc((n.text || 'Empty note').split('\n')[0].slice(0, 40))}</div>` : `<textarea aria-label="Sticky note" placeholder="Write a note…" spellcheck="false">${esc(n.text)}</textarea>`}`;
    layer.appendChild(el);
    const ta = $('textarea', el);
    if (ta) {
      ta.addEventListener('input', () => { n.text = ta.value; saveSticky(); drawNotesPane(); });
      ta.addEventListener('keydown', (e) => e.stopPropagation());
      if (n.id === focusId) setTimeout(() => ta.focus(), 50);
      new ResizeObserver(() => { if (el.offsetWidth && !n.collapsed) { n.w = el.offsetWidth; n.h = el.offsetHeight; saveSticky(); } }).observe(el);
    }
  }
  $('#notesBadge').textContent = notesHere().length || '';
}
layer.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.sticky'); if (!el) return;
  $$('.sticky', layer).forEach((s) => (s.style.zIndex = '')); el.style.zIndex = 5;
  const n = notesHere().find((x) => x.id === el.dataset.id);
  const dot = e.target.closest('[data-c]');
  if (dot) { n.color = dot.dataset.c; store.set('ml-sticky-color', n.color); saveP('sticky'); el.style.setProperty('--sc', COLORS[n.color]); $$('[data-c]', el).forEach((d) => d.classList.toggle('on', d === dot)); drawNotesPane(); return; }
  const b = e.target.closest('[data-st]');
  if (b?.dataset.st === 'del') { if (n.text.trim() && !confirm('Delete this note? This cannot be undone.')) return; el.classList.add('dying'); setTimeout(() => { P.sticky[state.file] = notesHere().filter((x) => x !== n); if (!P.sticky[state.file].length) delete P.sticky[state.file]; saveP('sticky'); drawStickies(); drawNotesPane(); }, 220); return; }
  if (b?.dataset.st === 'collapse') { n.collapsed = !n.collapsed; saveP('sticky'); drawStickies(); return; }
  if (!e.target.closest('.st-head')) return;
  e.preventDefault(); el.classList.add('lifted');
  const z = S.uiScale || 1, sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
  const mv = (ev) => { el.style.left = Math.max(0, ox + (ev.clientX - sx) / z) + 'px'; el.style.top = Math.max(0, oy + (ev.clientY - sy) / z) + 'px'; };
  const up = () => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); el.classList.remove('lifted');
    n.x = el.offsetLeft / previewPane.clientWidth; n.y = el.offsetTop; saveP('sticky'); };
  document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
});
preview.addEventListener('click', (e) => {
  if (!e.altKey || !state.file) return;
  const pr = previewPane.getBoundingClientRect(), z = S.uiScale || 1;
  addSticky((e.clientX - pr.left) / z, (e.clientY - pr.top) / z + previewPane.scrollTop - 14);
});
new ResizeObserver(() => drawStickies()).observe(previewPane);

function drawNotesPane() {
  const here = notesHere();
  const others = Object.entries(P.sticky).filter(([p, l]) => p !== state.file && l.length && inVault(p));
  $('#notesPane').innerHTML = `
    <div class="pane-head"><b>${icon('sticky', 15)} Sticky Notes</b><span class="muted">${here.length} here</span></div>
    <button class="primary wide" id="npAdd" ${state.file ? '' : 'disabled'}>${icon('plus', 13)} New Note on This Page</button>
    <label class="row np-toggle">Show notes on the page <input type="checkbox" id="npShow" ${S.hideStickies ? '' : 'checked'}></label>
    <div class="np-list">${here.map((n) => `<div class="np-item" data-id="${n.id}" style="--sc:${COLORS[n.color]}"><span>${esc((n.text || 'Empty note').slice(0, 120))}</span><small>${ago(n.created)}</small></div>`).join('') || '<div class="empty-note">No notes on this page yet.<br>Tip: <b>Alt + click</b> anywhere in the text to drop a note right there, or press <b>Alt+N</b>.</div>'}</div>
    ${others.length ? `<div class="toc-title" style="margin-top:16px">Other pages</div>${others.map(([p, l]) => `<div class="np-page" data-p="${esc(p)}">${icon('file', 13)} ${esc(short(p))}<span class="muted">${l.length}</span></div>`).join('')}` : ''}`;
  $('#npAdd').onclick = () => addSticky();
  $('#npShow').onchange = (e) => { S.hideStickies = !e.target.checked; saveS(); drawStickies(); };
  $('#notesBadge').textContent = here.length || '';
}
$('#notesPane').addEventListener('click', (e) => {
  const it = e.target.closest('.np-item');
  if (it) { const el = $(`.sticky[data-id="${it.dataset.id}"]`, layer); if (el) { previewPane.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' }); el.classList.remove('flash-note'); void el.offsetWidth; el.classList.add('flash-note'); } return; }
  const pg = e.target.closest('.np-page'); if (pg) openFile(pg.dataset.p, true);
});

/* ============ STARS + docbar + sidebar decoration ============ */
function toggleStar(p = state.file) {
  if (!p) return; const on = P.stars.includes(p);
  P.stars = on ? P.stars.filter((x) => x !== p) : [...P.stars, p]; saveP('stars');
  toast(on ? 'Removed from starred' : 'Starred ⭐'); updateDocbar(); drawPinned(); decorate();
}
function drawPinned() {
  const list = P.stars.filter(inVault);
  $('#pinned').innerHTML = list.length ? `<div class="side-label">Starred</div>${list.map((p) => `<div class="node file${p === state.file ? ' active' : ''}" data-file="${esc(p)}"><span class="ic star-ic">${icon('star', 14)}</span><span class="nm">${esc(short(p))}</span></div>`).join('')}` : '';
}
$('#pinned').addEventListener('click', (e) => { const f = e.target.closest('[data-file]'); if (f) openFile(f.dataset.file, e.ctrlKey); });
function updateDocbar() {
  const p = state.file, s = p && studyOf(p);
  $('#starBtn').classList.toggle('lit', !!p && P.stars.includes(p));
  const sb = $('#studyBtn'); sb.classList.toggle('lit', !!s);
  sb.innerHTML = icon(s?.status === 'done' ? 'bookmarkCheck' : 'bookmarkPlus', 16);
  sb.title = s ? `In study list (${STATUS[s.status][0]}). Click to change` : 'Add to study list';
}
function decorate() {
  $$('#tree [data-file]').forEach((el) => {
    const p = el.dataset.file, s = studyOf(p);
    $('.deco', el)?.remove();
    const d = document.createElement('span'); d.className = 'deco';
    if (P.stars.includes(p)) d.innerHTML += `<span class="d-star">${icon('star', 11)}</span>`;
    if ((P.sticky[p] || []).length) d.innerHTML += `<span class="d-note" title="Has sticky notes">${icon('sticky', 11)}</span>`;
    if (s) d.innerHTML += `<span class="d-study" data-st="${s.status}" title="${STATUS[s.status][0]}"></span>`;
    if (d.innerHTML) el.appendChild(d);
  });
}
$('#starBtn').onclick = () => toggleStar();
$('#studyBtn').onclick = () => {
  if (!state.file) return toast('Open a page first');
  const s = studyOf(state.file);
  if (!s) { addStudy(state.file); openRight('study'); }
  else ctxMenu($('#studyBtn').getBoundingClientRect().left - 150, $('#studyBtn').getBoundingClientRect().bottom + 6, [
    ['⏳ Mark as up next', () => setStudy(state.file, 'todo')], ['▶ Mark as studying', () => setStudy(state.file, 'reading')],
    ['✅ Mark as studied', () => setStudy(state.file, 'done')], ['✕ Remove from study list', () => removeStudy(state.file)], ['📚 Open study list', () => openRight('study')],
  ]);
};
$('#stickyBtn').onclick = () => addSticky();
function openRight(tab) { if (innerWidth < 1100) document.body.classList.add('toc-peek'); if (!S.showToc) { S.showToc = true; $('#showToc').checked = true; saveS(); applyClasses(); } setRightTab(tab); }

/* tree context menu additions */
$('#tree').addEventListener('contextmenu', (e) => {
  const f = e.target.closest('[data-file]'), d = e.target.closest('[data-dir]');
  if (f) {
    const p = f.dataset.file; const m = $('.ctx'); if (!m) return;
    const extra = [
      [studyOf(p) ? '📚 Remove from study list' : '📚 Add to study list', () => (studyOf(p) ? removeStudy(p) : addStudy(p))],
      [P.stars.includes(p) ? '☆ Unstar' : '⭐ Star', () => toggleStar(p)],
    ];
    extra.reverse().forEach(([label, fn]) => m.prepend(ctxItem(label, fn)));
  } else if (d) {
    e.preventDefault();
    const files = flatFiles(findDir(state.tree, d.dataset.dir)?.children || []).map((x) => x.path);
    ctxMenu(e.clientX, e.clientY, [
      [`📚 Add all ${files.length} pages to study list`, () => addStudy(files)],
      ['📂 Show in Explorer', () => api.reveal(d.dataset.dir)],
    ]);
  }
});
function findDir(nodes, p) { for (const n of nodes) if (n.type === 'dir') { if (n.path === p) return n; const r = findDir(n.children, p); if (r) return r; } return null; }

/* ============ hooks into the app ============ */
const _drawTree2 = drawTree; drawTree = function () { _drawTree2(); decorate(); };
const _openFile2 = openFile;
openFile = async function (p, nt) {
  await _openFile2(p, nt);
  if (state.file !== p) return;
  const s = studyOf(p); if (s) { s.lastRead = Date.now(); if (s.status === 'todo') s.status = 'reading'; saveP('study'); }
  drawStickies(); drawNotesPane(); drawTodos(); drawStudy(); drawPinned(); updateDocbar(); decorate();
  const y = P.scroll[p];
  if (y > 40) {
    const go = () => { previewPane.style.scrollBehavior = 'auto'; previewPane.scrollTop = y; previewPane.style.scrollBehavior = ''; };
    go(); setTimeout(go, 450);
    showResumeFlag(y);
  } else { $('#readBar').style.width = '0%'; showResumeFlag(null); }
  { const max = previewPane.scrollHeight - previewPane.clientHeight; P.cur = max > 0 ? (previewPane.scrollTop / max) * 100 : 100; }
  updateFinishBar();
};
document.addEventListener('keydown', (e) => {
  if (e.altKey && !e.ctrlKey && e.key.toLowerCase() === 'n') { e.preventDefault(); addSticky(); }
  if (e.altKey && !e.ctrlKey && e.key.toLowerCase() === 's' && state.file) { e.preventDefault(); studyOf(state.file) ? setStudy(state.file, 'done') : addStudy(state.file); }
}, true);
COMMANDS_EXTRA.push(
  ['Add sticky note', 'sticky', 'Alt+N', () => addSticky()],
  ['Add page to study list', 'bookmarkPlus', 'Alt+S', () => state.file && addStudy(state.file)],
  ['Mark page as studied', 'bookmarkCheck', '', () => state.file && setStudy(state.file, 'done')],
  ['Continue studying (next page)', 'play', '', () => { const n = nextStudy(); n ? openFile(n.path, true) : toast('Study list is empty'); }],
  ['Open study list', 'study', '', () => openRight('study')], ['Open to-do list', 'todo', '', () => openRight('todo')], ['Open sticky notes', 'sticky', '', () => openRight('notes')],
  ['Star / unstar this page', 'star', '', () => toggleStar()],
);
window.addEventListener('DOMContentLoaded', () => { drawTodos(); drawStudy(); drawNotesPane(); drawPinned(); updateDocbar(); setTimeout(decorate, 800); });
/* the theme's character reports what is left */
function updateVignette() {
  const t = $('#vgTitle'), s = $('#vgSub'); if (!t) return;
  const all = P.study.filter((x) => inVault(x.path)), left = all.filter((x) => x.status !== 'done').length, open = P.todos.filter((x) => !x.done).length;
  t.textContent = !all.length ? 'Nothing queued' : left ? `${left} to study` : 'All studied';
  s.textContent = !all.length ? 'Add pages to your study list' : open ? `${open} task${open > 1 ? 's' : ''} open` : left ? 'Pick up where you stopped' : 'The list is clear';
}
document.addEventListener('click', (e) => { if (e.target.closest('#vgSign')) openRight('study'); });
/* a folded flag marks where you stopped reading */
function showResumeFlag(y) {
  const f = $('#resumeFlag'); if (!f) return;
  if (y == null) { f.classList.remove('show'); return; }
  f.textContent = 'Stopped'; f.style.top = y + 100 + 'px'; f.style.left = Math.max(0, preview.offsetLeft - 10) + 'px'; f.classList.add('show');
}
$('#resumeFlag').onclick = () => showResumeFlag(null);
/* the flag stays pinned to the sheet's edge when the layout changes (Zen, resizing, panels) */
new ResizeObserver(() => { const f = $('#resumeFlag'); if (f.classList.contains('show')) f.style.left = Math.max(0, preview.offsetLeft - 10) + 'px'; }).observe(previewPane);
