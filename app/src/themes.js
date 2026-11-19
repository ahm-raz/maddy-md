/* Maddy MD theme engine: OKLCH colour maths, 15 paper-theatre themes, token derivation. */

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
   dark: default tone of the reading sheet · h: neutral hue · wing/deep: shell stocks · accent: [L,C,H]
   st: the paper stocks the scene is cut from (see scenes.js) */
const THEMES = [
  { id: 'orbit', name: 'Orbit', blurb: 'Deep space, one small astronaut', dark: true, h: 278, wing: [0.225, 0.05, 280], deep: [0.17, 0.045, 282], accent: [0.8, 0.14, 78],
    st: { sky1: '#0d0b24', sky2: '#251a55', far: '#2c2468', mid: '#3a2f86', near: '#1a1440', star: '#fff3c4', a: '#f5b942', b: '#ef6f8f', c: '#7fd8e8', w: '#f4f1ff', k: '#17122e' } },
  { id: 'lofi', name: 'Night Desk', blurb: 'City lights and a sleeping cat', dark: true, h: 300, wing: [0.235, 0.04, 310], deep: [0.18, 0.04, 312], accent: [0.79, 0.13, 55],
    st: { sky1: '#1a1230', sky2: '#4a2a5a', far: '#3a2450', mid: '#2c1c42', near: '#1d1330', star: '#ffe7a8', a: '#ffb86b', b: '#f27a8a', c: '#8fb7ff', w: '#fff4e0', k: '#150e24' } },
  { id: 'reef', name: 'Deep Reef', blurb: 'A whale and a reading octopus', dark: true, h: 205, wing: [0.25, 0.05, 215], deep: [0.19, 0.045, 220], accent: [0.82, 0.13, 180],
    st: { sky1: '#0b6a86', sky2: '#06283f', far: '#0d4f6b', mid: '#0a3d57', near: '#062a3f', star: '#bff3ff', a: '#ff8f6b', b: '#ffd166', c: '#59d4c6', w: '#eafcff', k: '#04202f' } },
  { id: 'camp', name: 'Forest Camp', blurb: 'Pines, a fire and a fox', dark: true, h: 160, wing: [0.24, 0.04, 165], deep: [0.185, 0.035, 168], accent: [0.8, 0.15, 60],
    st: { sky1: '#1b2440', sky2: '#c9623f', far: '#27484a', mid: '#1c3a38', near: '#11272a', star: '#fff0b8', a: '#f08a3c', b: '#ffd27a', c: '#8fcf9a', w: '#fbf3e2', k: '#0c1a1c' } },
  { id: 'desert', name: 'Desert Dusk', blurb: 'Mesas, cacti and a fennec', dark: true, h: 30, wing: [0.25, 0.045, 25], deep: [0.19, 0.04, 20], accent: [0.8, 0.14, 55],
    st: { sky1: '#3a1c4f', sky2: '#f08a4b', far: '#8a3d55', mid: '#63294a', near: '#3d1a38', star: '#ffe9c2', a: '#ffc15e', b: '#f25c54', c: '#6fbf8f', w: '#fff1dc', k: '#22102a' } },
  { id: 'aurora', name: 'Arctic Aurora', blurb: 'Northern lights and a penguin', dark: true, h: 235, wing: [0.235, 0.045, 240], deep: [0.18, 0.04, 245], accent: [0.83, 0.15, 165],
    st: { sky1: '#071a33', sky2: '#12466a', far: '#7fb6d6', mid: '#b7dcee', near: '#eaf6fb', star: '#eaffff', a: '#5ff0b8', b: '#b08cff', c: '#ff9e5e', w: '#ffffff', k: '#0b1c33' } },
  { id: 'arcade', name: 'Pixel Arcade', blurb: 'Blocky hills and a slime', dark: true, h: 290, wing: [0.23, 0.06, 295], deep: [0.175, 0.055, 297], accent: [0.84, 0.17, 140],
    st: { sky1: '#1b1040', sky2: '#3a1c6e', far: '#4b2a8c', mid: '#2f7d5b', near: '#1f5a43', star: '#ffffff', a: '#7bf09a', b: '#ffcf4a', c: '#ff6ba8', w: '#f7f2ff', k: '#150c33' } },
  { id: 'clouds', name: 'Cloud Friends', blurb: 'A sunny sky with faces', dark: false, h: 235, wing: [0.93, 0.035, 235], deep: [0.875, 0.05, 238], accent: [0.6, 0.17, 255],
    st: { sky1: '#9fd3ff', sky2: '#eaf7ff', far: '#ffffff', mid: '#f3faff', near: '#ffffff', star: '#ffffff', a: '#ffc93c', b: '#ff8fab', c: '#5b8def', w: '#ffffff', k: '#2b3a67' } },
  { id: 'dino', name: 'Dino Valley', blurb: 'A volcano and a gentle giant', dark: false, h: 110, wing: [0.925, 0.05, 115], deep: [0.865, 0.07, 120], accent: [0.56, 0.15, 150],
    st: { sky1: '#ffe2b0', sky2: '#fff6dc', far: '#b9dc8a', mid: '#8cc76a', near: '#5faa55', star: '#ffffff', a: '#3f9d6b', b: '#ff7a59', c: '#ffcf5c', w: '#fffbe9', k: '#274a36' } },
  { id: 'robo', name: 'Robot Workshop', blurb: 'Gears, bulbs and a helper bot', dark: false, h: 195, wing: [0.925, 0.03, 195], deep: [0.865, 0.04, 200], accent: [0.58, 0.15, 30],
    st: { sky1: '#cfe9ea', sky2: '#f1fafa', far: '#a9cfd2', mid: '#7fb3b8', near: '#4f8990', star: '#ffffff', a: '#ff7f50', b: '#ffd166', c: '#2f6f7a', w: '#f7fbfb', k: '#1f3d44' } },
  { id: 'candy', name: 'Candy Hills', blurb: 'Frosted hills and a gummy bear', dark: false, h: 350, wing: [0.935, 0.04, 350], deep: [0.885, 0.06, 352], accent: [0.6, 0.19, 350],
    st: { sky1: '#ffd1e3', sky2: '#fff3f8', far: '#c9b6ff', mid: '#9be3d0', near: '#ff9ec4', star: '#ffffff', a: '#ff5c9a', b: '#ffd45c', c: '#7ad7c4', w: '#fffafc', k: '#5a2748' } },
  { id: 'sakura', name: 'Blossom Evening', blurb: 'Falling petals and a shiba', dark: false, h: 20, wing: [0.935, 0.03, 20], deep: [0.885, 0.045, 18], accent: [0.57, 0.17, 12],
    st: { sky1: '#ffc9b9', sky2: '#fff0e6', far: '#d7a9c4', mid: '#b98bb0', near: '#8f6a96', star: '#ffffff', a: '#ff8fab', b: '#e85d75', c: '#f2a65a', w: '#fff8f3', k: '#4a2f4a' } },
  { id: 'monsters', name: 'Monster Party', blurb: 'Three fuzzy guests and bunting', dark: false, h: 300, wing: [0.93, 0.04, 300], deep: [0.875, 0.06, 302], accent: [0.56, 0.2, 300],
    st: { sky1: '#e6d4ff', sky2: '#fff8e1', far: '#ffd166', mid: '#7bdcb5', near: '#9b7bea', star: '#ffffff', a: '#2bb3a3', b: '#ff8a3c', c: '#8a5cf0', w: '#fffdf5', k: '#3a2466' } },
  { id: 'paper', name: 'Quiet Paper', blurb: 'Plain layered paper, no characters', dark: false, h: 80, wing: [0.94, 0.012, 85], deep: [0.895, 0.016, 85], accent: [0.52, 0.12, 250], quiet: true,
    st: { sky1: '#efe9dc', sky2: '#f8f4ea', far: '#e2dccd', mid: '#d3ccba', near: '#c2baa6', star: '#ffffff', a: '#8a8272', b: '#b0a892', c: '#6f6a5e', w: '#fbf8f1', k: '#3b382f' } },
  { id: 'ink', name: 'Quiet Ink', blurb: 'Dark layered paper, no characters', dark: true, h: 250, wing: [0.24, 0.015, 250], deep: [0.19, 0.015, 250], accent: [0.8, 0.09, 230], quiet: true,
    st: { sky1: '#1b1e27', sky2: '#262a36', far: '#2f3442', mid: '#262a36', near: '#1c1f29', star: '#e8ecf5', a: '#aab4c8', b: '#7f8aa3', c: '#5c667d', w: '#eef1f7', k: '#12141b' } },
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
    '--stage': t.st.sky2, '--dark': sheetDark ? '1' : '0', '--wing-dark': wingDark ? '1' : '0',
  };
}
function applyTheme(S) {
  const t = themeById(S.theme), tok = themeTokens(t, { sheetTone: S.sheetTone, accent: S.accent });
  const r = document.documentElement;
  for (const [k, v] of Object.entries(tok)) r.style.setProperty(k, v);
  r.dataset.theme = t.id; r.dataset.dark = tok['--dark']; r.dataset.wing = tok['--wing-dark'] === '1' ? 'dark' : 'light';
  r.style.colorScheme = tok['--dark'] === '1' ? 'dark' : 'light';
  if (window.buildScene) { buildScene(document.getElementById('stage'), t, S); buildVignette(document.getElementById('vignette'), t, S); }
  return tok;
}
