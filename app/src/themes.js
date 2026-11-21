/* Maddy MD theme engine: OKLCH colour maths, 12 single-colour themes, token derivation. */

/* ---------- colour maths (OKLCH <-> sRGB hex) ---------- */
const Color = (() => {
  const toLin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const toGam = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
  function raw(L, C, H) {
    const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  }
  function hex(L, C, H) {
    let rgb = raw(L, C, H), c = C;
    for (let i = 0; i < 24 && rgb.some((v) => v < -0.0005 || v > 1.0005); i++) { c *= 0.92; rgb = raw(L, c, H); } // pull chroma into gamut
    return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(1, toGam(Math.max(0, Math.min(1, v))))) * 255).toString(16).padStart(2, '0')).join('');
  }
  const parse = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  function toOklch(h) {
    const [r, g, b] = parse(h).map(toLin);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
  }
  const mix = (a, b, t) => { const A = parse(a), B = parse(b); return '#' + A.map((v, i) => Math.round((v + (B[i] - v) * t) * 255).toString(16).padStart(2, '0')).join(''); };
  const lum = (h) => { const [r, g, b] = parse(h).map(toLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  /* walk a colour toward `toward` until it clears `min` contrast against `bg` */
  function ensure(fg, bg, min, toward) { let c = fg; for (let i = 0; i < 20 && contrast(c, bg) < min; i++) c = mix(c, toward, 0.12); return c; }
  return { hex, mix, lum, contrast, ensure, toOklch, o: (a) => hex(a[0], a[1], a[2]) };
})();

/* ---------- themes ----------
   Every theme is one colour: the shell, the reading sheet and the accent all come from a single hue.
   dark: default tone of the reading sheet · h: hue · c: how much colour (0 is pure grey) */
const mono = (id, name, blurb, dark, h, c) => ({
  id, name, blurb, dark, h, c,
  wing: dark ? [0.215, c * 0.35, h] : [0.965, c * 0.1, h],
  deep: dark ? [0.172, c * 0.3, h] : [0.925, c * 0.16, h],
  accent: dark ? [0.78, c, h] : [0.55, c, h],
});
const THEMES = [
  mono('graphite', 'Graphite', 'Neutral dark grey', true, 255, 0.018),
  mono('midnight', 'Midnight', 'Deep blue', true, 258, 0.12),
  mono('ocean', 'Ocean', 'Dark teal', true, 205, 0.09),
  mono('forest', 'Forest', 'Dark green', true, 150, 0.1),
  mono('plum', 'Plum', 'Dark purple', true, 305, 0.12),
  mono('ember', 'Ember', 'Dark amber', true, 60, 0.12),
  mono('crimson', 'Crimson', 'Dark red', true, 20, 0.13),
  mono('paper', 'Paper', 'Neutral light grey', false, 85, 0.012),
  mono('sky', 'Sky', 'Light blue', false, 245, 0.12),
  mono('mint', 'Mint', 'Light green', false, 165, 0.1),
  mono('sand', 'Sand', 'Light warm beige', false, 75, 0.08),
  mono('lilac', 'Lilac', 'Light purple', false, 300, 0.11),
];
const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

/* ---------- tokens ---------- */
function themeTokens(t, opts = {}) {
  const { hex, mix, ensure, lum, o, toOklch } = Color;
  const wingDark = t.wing[0] < 0.5;
  const sheetDark = opts.sheetTone === 'dark' ? true : opts.sheetTone === 'light' ? false : t.dark;
  const wing = o(t.wing), deep = o(t.deep);
  const wingInk = wingDark ? hex(0.94, 0.015, t.h) : hex(0.26, 0.03, t.h);
  const sheet = sheetDark ? hex(0.212, 0.02, t.h) : hex(0.987, 0.006, t.h);
  const ink = sheetDark ? hex(0.925, 0.012, t.h) : hex(0.25, 0.025, t.h);
  let [aL, aC, aH] = t.accent;
  if (opts.accent) { const c = toOklch(opts.accent); aC = Math.max(0.06, c[1]); aH = c[2]; aL = c[0]; }
  let fill = opts.accent || hex(sheetDark ? Math.max(aL, 0.7) : Math.min(aL, 0.62), aC, aH);
  const fillInk = lum(fill) > 0.36 ? hex(0.2, 0.03, aH) : '#ffffff';
  fill = ensure(fill, fillInk, 4.6, fillInk === '#ffffff' ? '#000000' : '#ffffff'); // text on the accent always clears AA
  const link = ensure(hex(sheetDark ? 0.82 : 0.47, Math.min(aC, sheetDark ? 0.14 : 0.19), aH), sheet, 5, ink);
  const wingAccent = ensure(hex(wingDark ? 0.82 : 0.47, Math.min(aC, wingDark ? 0.14 : 0.19), aH), wing, 4.6, wingInk);
  const sem = (H) => ensure(hex(sheetDark ? 0.78 : 0.5, 0.15, H), sheet, 4.5, ink);
  return {
    '--deep': deep, '--wing': wing, '--wing-ink': wingInk,
    '--wing-muted': ensure(mix(wingInk, wing, 0.36), wing, 4.6, wingInk), '--wing-faint': ensure(mix(wingInk, deep, 0.36), deep, 4.6, wingInk),
    '--wing-line': mix(wing, wingInk, 0.13), '--wing-hover': mix(wing, wingInk, 0.07), '--wing-press': mix(wing, wingInk, 0.12),
    '--wing-sel': mix(wing, wingAccent, 0.2), '--wing-accent': wingAccent, '--wing-field': mix(wing, wingDark ? '#000000' : '#ffffff', wingDark ? 0.22 : 0.55),
    '--bg': sheet, '--text': ink, '--muted': ensure(mix(ink, sheet, 0.36), sheet, 4.8, ink), '--border': mix(sheet, ink, 0.13), '--border-strong': mix(sheet, ink, 0.24),
    '--panel': mix(sheet, ink, 0.045), '--panel2': mix(sheet, ink, 0.09), '--bg2': mix(sheet, ink, 0.045), '--code': mix(sheet, ink, sheetDark ? 0.07 : 0.04),
    '--accent': link, '--accent-fill': fill, '--accent-ink': fillInk, '--accent-soft': mix(sheet, link, 0.14), '--sel': mix(sheet, link, 0.3),
    '--ok': sem(150), '--warn': sem(75), '--err': sem(25), '--info': sem(245), '--note': sem(300),
    '--shadow': sheetDark || wingDark ? 'rgba(0,0,0,.5)' : 'rgba(46,34,72,.22)', '--shadow-soft': sheetDark || wingDark ? 'rgba(0,0,0,.32)' : 'rgba(46,34,72,.12)',
    '--stage': wingDark ? hex(0.155, t.c * 0.28, t.h) : hex(0.905, t.c * 0.18, t.h), '--dark': sheetDark ? '1' : '0', '--wing-dark': wingDark ? '1' : '0',
  };
}
function applyTheme(S) {
  const t = themeById(S.theme), tok = themeTokens(t, { sheetTone: S.sheetTone, accent: S.accent });
  const r = document.documentElement;
  for (const [k, v] of Object.entries(tok)) r.style.setProperty(k, v);
  r.dataset.theme = t.id; r.dataset.dark = tok['--dark']; r.dataset.wing = tok['--wing-dark'] === '1' ? 'dark' : 'light';
  r.style.colorScheme = tok['--dark'] === '1' ? 'dark' : 'light';
  return tok;
}

/* ---------- theme gallery swatch: a tiny flat window in the theme's colours ---------- */
function themeThumb(t) {
  const k = themeTokens(t);
  return `<div class="th-swatch" style="background:${k['--deep']}">
    <i class="th-side" style="background:${k['--wing']}"><b style="background:${k['--wing-accent']}"></b><b style="background:${k['--wing-line']}"></b><b style="background:${k['--wing-line']}"></b></i>
    <i class="th-sheet" style="background:${k['--bg']}"><b style="background:${k['--text']}"></b><b style="background:${k['--border-strong']}"></b><b style="background:${k['--border-strong']}"></b><b style="background:${k['--accent']}"></b></i>
  </div>`;
}

