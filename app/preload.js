const { contextBridge, ipcRenderer, clipboard, webUtils } = require('electron');
const fs = require('fs');
const path = require('path');
const hljs = require('highlight.js');
const TurndownService = require('turndown');
const { gfm } = require('turndown-plugin-gfm');

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '*', hr: '---' });
td.use(gfm);
td.addRule('codeLang', {
  filter: (n) => n.nodeName === 'PRE',
  replacement: (_c, n) => {
    const code = n.querySelector ? n.querySelector('code') : null;
    const cls = (code && code.getAttribute('class')) || '';
    const m = cls.match(/language-([\w+#-]+)/);
    const text = (code || n).textContent.replace(/\n$/, '');
    return '\n\n```' + (m ? m[1] : '') + '\n' + text + '\n```\n\n';
  },
});
td.addRule('details', {
  filter: ['details'],
  replacement: (c, n) => '\n\n<details>\n' + c.trim() + '\n</details>\n\n',
});
td.addRule('summary', { filter: ['summary'], replacement: (c) => '<summary>' + c.trim() + '</summary>\n\n' });
td.remove(['script', 'style', 'meta', 'button']);

const inv = (ch, ...a) => ipcRenderer.invoke(ch, ...a);
contextBridge.exposeInMainWorld('api', {
  pickFolder: () => inv('pick-folder'),
  pickFile: () => inv('pick-file'),
  list: (d) => inv('list', d),
  read: (p) => inv('read', p),
  index: (d) => inv('index', d),
  mkdir: (p) => inv('mkdir', p),
  findAsset: (d, n) => inv('find-asset', d, n),
  fileUrl: (p) => require('url').pathToFileURL(p).href,
  write: (p, c) => inv('write', p, c),
  exists: (p) => inv('exists', p),
  rename: (a, b) => inv('rename', a, b),
  trash: (p) => inv('trash', p),
  reveal: (p) => inv('reveal', p),
  watch: (d) => inv('watch', d),
  titlebar: (c, s) => inv('titlebar', c, s),
  fullscreen: (on) => inv('fullscreen', on),
  shot: (p) => inv('shot', p),
  saveDialog: (n, e) => inv('save-dialog', n, e),
  pdf: (o) => inv('pdf', o),
  syncTest: (t) => inv('sync-test', t),
  syncPush: (o) => inv('sync-push', o),
  syncPull: (o) => inv('sync-pull', o),
  onOpenPath: (cb) => ipcRenderer.on('open-path', (_e, p) => cb(p)),
  onFsChanged: (cb) => ipcRenderer.on('fs-changed', (_e, p) => cb(p)),
  highlight: (code, lang) => {
    try { return lang && hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value; }
    catch { return null; }
  },
  htmlToMd: (html) => td.turndown(html),
  clipHtml: () => clipboard.readHTML(),
  clipText: () => clipboard.readText(),
  copy: (t) => clipboard.writeText(t),
  pathFor: (file) => { try { return webUtils.getPathForFile(file); } catch { return null; } },
  cssText: () => fs.readFileSync(path.join(__dirname, 'src', 'ui.css'), 'utf8'),
  defaultVault: () => inv('default-vault'),
  sep: process.platform === 'win32' ? '\\' : '/',
});
