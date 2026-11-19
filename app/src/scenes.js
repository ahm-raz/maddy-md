/* Maddy MD paper-theatre scenes. Everything here is original art drawn in code:
   flat cut-paper shapes, no outlines, one character geometry (round bodies, dot eyes, small mouths). */

const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const svgEl = (w, h, body, attrs = '') => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" ${attrs}>${body}</svg>`;
const mixc = (a, b, t) => Color.mix(a, b, t);

/* ---------- ridge shapes (drawn in a 1000 x 100 box, stretched to the stage width) ---------- */
function ridge(kind, seed, top = 0.5) {
  const r = rng(seed), lo = 100 * (1 - top), span = 100 * top * 0.5; // ridge stays within [lo, lo+span]
  const y = () => lo + r() * span;
  let d = '';
  if (kind === 'hills' || kind === 'dunes' || kind === 'frost') {
    const n = kind === 'dunes' ? 4 : 7, pts = []; for (let i = 0; i <= n; i++) pts.push([(1000 / n) * i, y()]);
    d = `M0 100 L0 ${pts[0][1]}`;
    for (let i = 0; i < n; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], mx = (x0 + x1) / 2; d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`; }
    d += ' L1000 100Z';
  } else if (kind === 'peaks' || kind === 'ice') {
    d = `M0 100 L0 ${y()}`; let x = 0;
    while (x < 1000) { const w = 50 + r() * 90; if (kind === 'ice' && r() > 0.5) { const yy = y(); d += ` L${x + w * 0.3} ${yy} L${x + w} ${yy}`; } else d += ` L${x + w / 2} ${lo + r() * span * 0.5} L${x + w} ${lo + span * 0.6 + r() * span * 0.4}`; x += w; }
    d += ' L1000 100Z';
  } else if (kind === 'mesa') {
    d = 'M0 100'; let x = 0, base = lo + span;
    d += ` L0 ${base}`;
    while (x < 1000) { const gap = 40 + r() * 90, w = 80 + r() * 140, h = lo + r() * span * 0.6; d += ` L${x + gap} ${base} L${x + gap + 12} ${h} L${x + gap + w} ${h} L${x + gap + w + 12} ${base}`; x += gap + w + 12; }
    d += ' L1000 100Z';
  } else if (kind === 'city' || kind === 'pixel') {
    d = 'M0 100'; let x = 0; const step = kind === 'pixel' ? 8 : 6;
    while (x < 1000) { const w = kind === 'pixel' ? 30 + Math.floor(r() * 4) * 15 : 22 + r() * 46, h = Math.round(y() / step) * step; d += ` L${x} ${h} L${x + w} ${h}`; x += w; }
    d += ' L1000 100Z';
  } else if (kind === 'pines') {
    d = `M0 100 L0 ${lo + span}`; let x = 0;
    while (x < 1000) { const w = 16 + r() * 16, h = lo + r() * span * 0.8; d += ` L${x + w / 2} ${h} L${x + w} ${lo + span}`; x += w; }
    d += ' L1000 100Z';
  } else if (kind === 'clouds') {
    let c = ''; let x = -20; while (x < 1020) { const rx = 34 + r() * 46; c += `<ellipse cx="${x + rx}" cy="${lo + span * 0.7 + r() * 8}" rx="${rx}" ry="${span * 0.55 + r() * span * 0.4}"/>`; x += rx * 1.25; }
    return { extra: c, d: `M0 ${lo + span * 0.7} L1000 ${lo + span * 0.7} L1000 100 L0 100Z` };
  }
  return { d };
}

/* ---------- shared character parts ---------- */
const eye = (x, y, r = 3.2, k = '#1d1730') => `<g class="blink"><circle cx="${x}" cy="${y}" r="${r}" fill="${k}"/><circle cx="${x + r * 0.34}" cy="${y - r * 0.36}" r="${r * 0.3}" fill="#fff"/></g>`;
const eyes = (x, y, gap, r, k) => eye(x - gap / 2, y, r, k) + eye(x + gap / 2, y, r, k);
const smile = (x, y, w = 8, k = '#1d1730', sw = 2) => `<path d="M${x - w / 2} ${y} q${w / 2} ${w * 0.6} ${w} 0" fill="none" stroke="${k}" stroke-width="${sw}" stroke-linecap="round"/>`;
const sleepy = (x, y, gap, k = '#1d1730') => [-1, 1].map((s) => `<path d="M${x + (s * gap) / 2 - 4} ${y} q4 4 8 0" fill="none" stroke="${k}" stroke-width="2" stroke-linecap="round"/>`).join('');
const blush = (x, y, gap, col = '#ff8fa3') => [-1, 1].map((s) => `<ellipse cx="${x + (s * gap) / 2}" cy="${y}" rx="4.6" ry="3" fill="${col}" opacity=".55"/>`).join('');
function pixels(rows, pal, s = 8) {
  let o = ''; rows.forEach((row, yy) => [...row].forEach((ch, xx) => { if (pal[ch]) o += `<rect x="${xx * s}" y="${yy * s}" width="${s + 0.4}" height="${s + 0.4}" fill="${pal[ch]}"/>`; }));
  return svgEl(rows[0].length * s, rows.length * s, o, 'shape-rendering="crispEdges"');
}
function gear(col, hole, teeth = 9) {
  let d = ''; for (let i = 0; i < teeth * 2; i++) { const a = (i / (teeth * 2)) * Math.PI * 2, a2 = ((i + 0.5) / (teeth * 2)) * Math.PI * 2, R = i % 2 ? 46 : 36; d += `${i ? 'L' : 'M'}${50 + Math.cos(a) * R} ${50 + Math.sin(a) * R} L${50 + Math.cos(a2) * R} ${50 + Math.sin(a2) * R} `; }
  return svgEl(100, 100, `<path d="${d}Z M50 36 a14 14 0 1 0 0.01 0Z" fill="${col}" fill-rule="evenodd"/><circle cx="50" cy="50" r="6" fill="${hole}"/>`);
}
const blossom = (x, y, s, a, b) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-7" rx="5" ry="7" fill="${a}" transform="rotate(${r})"/>`).join('')}<circle r="3" fill="${b}"/></g>`;

/* ---------- sprites ---------- */
const SPR = {
  /* space */
  astro: (c) => svgEl(120, 150, `
    <rect x="33" y="72" width="54" height="44" rx="13" fill="${mixc(c.w, c.k, 0.3)}"/>
    <rect x="44" y="112" width="14" height="26" rx="7" fill="${c.w}"/><rect x="62" y="112" width="14" height="26" rx="7" fill="${c.w}"/>
    <rect x="42" y="130" width="18" height="10" rx="5" fill="${c.b}"/><rect x="60" y="130" width="18" height="10" rx="5" fill="${c.b}"/>
    <rect x="22" y="78" width="16" height="34" rx="8" fill="${c.w}" transform="rotate(18 30 80)"/>
    <rect x="84" y="54" width="16" height="36" rx="8" fill="${c.w}" transform="rotate(-30 92 88)"/>
    <rect x="38" y="72" width="44" height="46" rx="16" fill="${c.w}"/>
    <rect x="50" y="88" width="20" height="13" rx="3" fill="${c.c}"/><circle cx="55" cy="94.5" r="2.2" fill="${c.a}"/><circle cx="64" cy="94.5" r="2.2" fill="${c.b}"/>
    <rect x="58" y="3" width="4" height="12" fill="${c.w}"/><circle cx="60" cy="5" r="4.5" fill="${c.a}"/>
    <circle cx="60" cy="46" r="34" fill="${c.w}"/><ellipse cx="60" cy="47" rx="25.5" ry="21.5" fill="${c.k}"/>
    <path d="M40 40 q8 -13 22 -13" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".28"/>
    <g class="blink"><circle cx="51" cy="48" r="3.4" fill="#fff"/><circle cx="69" cy="48" r="3.4" fill="#fff"/></g>${smile(60, 54, 8, '#fff')}${blush(60, 55, 30, c.b)}`),
  planet: (c) => svgEl(170, 120, `
    <ellipse cx="85" cy="62" rx="78" ry="17" fill="none" stroke="${c.b}" stroke-width="7"/>
    <circle cx="85" cy="60" r="40" fill="${c.a}"/>
    <g clip-path="url(#plc)" fill="${mixc(c.a, c.k, 0.22)}"><rect x="40" y="38" width="90" height="9" rx="4"/><rect x="40" y="66" width="90" height="12" rx="5"/><rect x="60" y="86" width="60" height="6" rx="3"/></g>
    <clipPath id="plc"><circle cx="85" cy="60" r="40"/></clipPath>
    <path d="M7 62 a78 17 0 0 0 156 0" fill="none" stroke="${c.b}" stroke-width="7" stroke-linecap="round"/>`),
  moon: (c) => svgEl(100, 100, `<path d="M62 8 A44 44 0 1 0 93 66 A36 36 0 1 1 62 8Z" fill="${c.star}"/><circle cx="30" cy="52" r="5" fill="${mixc(c.star, c.k, 0.16)}"/><circle cx="46" cy="76" r="3.5" fill="${mixc(c.star, c.k, 0.16)}"/>`),
  fullmoon: (c) => svgEl(100, 100, `<circle cx="50" cy="50" r="42" fill="${c.star}"/><circle cx="36" cy="40" r="8" fill="${mixc(c.star, c.k, 0.12)}"/><circle cx="62" cy="62" r="11" fill="${mixc(c.star, c.k, 0.12)}"/><circle cx="64" cy="32" r="4" fill="${mixc(c.star, c.k, 0.12)}"/>`),
  rocket: (c) => svgEl(80, 140, `
    <path d="M28 104 L16 128 L32 118Z M52 104 L64 128 L48 118Z" fill="${c.b}"/>
    <path d="M40 6 C58 24 62 60 58 108 L22 108 C18 60 22 24 40 6Z" fill="${c.w}"/><path d="M40 6 C49 15 54 28 56 40 L24 40 C26 28 31 15 40 6Z" fill="${c.b}"/>
    <circle cx="40" cy="62" r="11" fill="${c.c}"/><circle cx="40" cy="62" r="6.5" fill="${c.k}"/>
    <path class="flick" d="M30 108 Q40 142 50 108Z" fill="${c.a}"/><path class="flick" d="M35 108 Q40 128 45 108Z" fill="${c.star}"/>`),
  /* night desk */
  cat: (c) => svgEl(180, 130, `
    <rect x="18" y="100" width="144" height="18" rx="3" fill="${c.b}"/><rect x="150" y="103" width="10" height="12" fill="${c.w}"/>
    <rect x="30" y="84" width="122" height="16" rx="3" fill="${c.c}"/><rect x="34" y="87" width="10" height="10" fill="${c.w}"/>
    <rect x="22" y="68" width="134" height="16" rx="3" fill="${c.a}"/><rect x="144" y="71" width="10" height="10" fill="${c.w}"/>
    <path d="M132 60 C162 60 166 34 148 30" fill="none" stroke="${c.w}" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="92" cy="52" rx="48" ry="20" fill="${c.w}"/>
    <path d="M36 34 L40 10 L56 26Z M76 26 L90 10 L92 36Z" fill="${c.w}"/><path d="M42 28 L43 17 L51 26Z M80 27 L87 17 L88 30Z" fill="${c.b}" opacity=".7"/>
    <circle cx="64" cy="42" r="26" fill="${c.w}"/>
    ${sleepy(64, 44, 22, c.k)}<path d="M61.500 50 h5 l-2.500 3Z" fill="${c.b}"/>${blush(64, 52, 36, c.b)}
    <text x="100" y="20" font-family="Arial,sans-serif" font-weight="700" font-size="15" fill="${c.star}" opacity=".9">z</text><text x="113" y="9" font-family="Arial,sans-serif" font-weight="700" font-size="10" fill="${c.star}" opacity=".7">z</text>`),
  lamp: (c) => svgEl(110, 170, `
    <path d="M34 54 L4 168 L106 168 L76 54Z" fill="${c.star}" opacity=".13"/>
    <ellipse cx="55" cy="160" rx="26" ry="7" fill="${c.k}"/><rect x="52" y="60" width="6" height="100" fill="${c.k}"/>
    <path d="M28 58 L38 18 L72 18 L82 58Z" fill="${c.a}"/><rect x="28" y="54" width="54" height="7" rx="3" fill="${mixc(c.a, c.k, 0.25)}"/>`),
  mug: (c) => svgEl(80, 100, `
    <path class="steam" d="M30 34 q-8 -10 0 -18 q8 -8 0 -16" fill="none" stroke="${c.w}" stroke-width="3.5" stroke-linecap="round" opacity=".45"/>
    <path class="steam" d="M46 36 q-8 -10 0 -18" fill="none" stroke="${c.w}" stroke-width="3.5" stroke-linecap="round" opacity=".35"/>
    <path d="M58 54 a14 14 0 0 1 0 28" fill="none" stroke="${c.b}" stroke-width="7"/><rect x="14" y="44" width="46" height="50" rx="9" fill="${c.b}"/><rect x="14" y="44" width="46" height="9" rx="4" fill="${mixc(c.b, c.w, 0.35)}"/>`),
  /* reef */
  whale: (c) => svgEl(230, 130, `
    <path d="M36 72 C14 62 4 44 8 30 C20 38 30 48 36 58 C34 44 40 30 52 24 C56 42 50 62 36 72Z" fill="${mixc(c.c, c.k, 0.3)}"/>
    <path d="M30 74 C30 32 90 14 140 22 C182 28 208 52 210 76 C212 102 170 114 118 114 C66 114 30 106 30 74Z" fill="${mixc(c.c, c.k, 0.3)}"/>
    <path d="M52 96 C80 110 150 114 200 92 C192 108 160 114 118 114 C86 114 62 110 52 96Z" fill="${c.w}" opacity=".9"/>
    <path d="M112 100 q6 20 26 18 q-6 -10 -4 -20Z" fill="${mixc(c.c, c.k, 0.42)}"/>
    ${eye(170, 64, 4, c.k)}${smile(186, 78, 14, c.k, 2.4)}${blush(176, 78, 0, c.a)}`),
  octo: (c) => svgEl(130, 130, `
    ${[18, 40, 65, 90, 112].map((x, i) => `<path d="M${x} 74 q${i < 2 ? -10 : i > 2 ? 10 : 0} 26 ${i < 2 ? -14 : i > 2 ? 14 : 0} 40" fill="none" stroke="${c.a}" stroke-width="13" stroke-linecap="round"/>`).join('')}
    <path d="M22 70 C22 30 42 10 65 10 C88 10 108 30 108 70 C108 84 94 90 65 90 C36 90 22 84 22 70Z" fill="${c.a}"/>
    <circle cx="40" cy="30" r="5" fill="${mixc(c.a, c.w, 0.35)}"/><circle cx="52" cy="22" r="3" fill="${mixc(c.a, c.w, 0.35)}"/>
    ${eyes(65, 50, 30, 4.2, c.k)}${smile(65, 60, 9, c.k)}${blush(65, 61, 46, c.b)}
    <rect x="44" y="74" width="42" height="26" rx="3" fill="${c.w}"/><rect x="64" y="74" width="2" height="26" fill="${mixc(c.w, c.k, 0.25)}"/><rect x="48" y="80" width="12" height="2" fill="${mixc(c.w, c.k, 0.3)}"/><rect x="70" y="80" width="12" height="2" fill="${mixc(c.w, c.k, 0.3)}"/><rect x="48" y="86" width="12" height="2" fill="${mixc(c.w, c.k, 0.3)}"/><rect x="70" y="86" width="12" height="2" fill="${mixc(c.w, c.k, 0.3)}"/>`),
  fish: (c) => svgEl(60, 34, `<path d="M40 17 L58 4 L58 30Z" fill="${c.b}"/><ellipse cx="26" cy="17" rx="22" ry="13" fill="${c.b}"/><circle cx="14" cy="14" r="2.6" fill="${c.k}"/>`),
  kelp: (c) => svgEl(60, 220, `<path d="M26 220 C6 180 46 150 26 110 C8 74 44 50 28 6 C52 44 22 76 40 112 C58 150 22 182 40 220Z" fill="${c.c}" opacity=".85"/><path d="M40 220 C52 190 30 170 44 140 C54 120 40 104 46 84 C60 110 44 128 54 150 C64 176 46 196 52 220Z" fill="${mixc(c.c, c.k, 0.3)}"/>`),
  coral: (c) => svgEl(110, 100, `<g fill="none" stroke-linecap="round"><path d="M40 98 V52 M40 70 L18 44 M40 60 L62 34 M18 44 V26 M62 34 V16" stroke="${c.a}" stroke-width="11"/><path d="M82 98 V62 M82 76 L100 56 M82 70 L68 54" stroke="${c.b}" stroke-width="9"/></g>`),
  /* forest camp */
  fox: (c) => svgEl(150, 140, `
    <path d="M92 124 C140 124 146 84 124 62 C122 86 110 98 90 104Z" fill="${c.a}"/><path d="M124 62 C134 74 136 88 130 100 C124 92 122 80 124 62Z" fill="${c.w}"/>
    <path d="M40 134 C32 98 46 72 66 72 C86 72 100 98 92 134Z" fill="${c.a}"/><ellipse cx="66" cy="114" rx="14" ry="20" fill="${c.w}"/>
    <ellipse cx="54" cy="134" rx="9" ry="5" fill="${c.k}"/><ellipse cx="78" cy="134" rx="9" ry="5" fill="${c.k}"/>
    <path d="M34 52 L40 12 L60 34 L72 34 L92 12 L98 52 C98 72 82 84 66 84 C50 84 34 72 34 52Z" fill="${c.a}"/>
    <path d="M44 30 L45 20 L54 30Z M88 30 L87 20 L78 30Z" fill="${c.k}" opacity=".55"/>
    <path d="M36 58 C48 64 58 62 66 78 C74 62 84 64 96 58 C94 74 80 84 66 84 C52 84 38 74 36 58Z" fill="${c.w}"/>
    ${eyes(66, 52, 28, 3.4, c.k)}<circle cx="66" cy="74" r="3.2" fill="${c.k}"/>${blush(66, 62, 44, c.b)}`),
  tent: (c) => svgEl(180, 110, `<path d="M90 8 L172 104 L8 104Z" fill="${c.b}"/><path d="M90 8 L172 104 L90 104Z" fill="${mixc(c.b, c.k, 0.22)}"/><path d="M90 46 L114 104 L66 104Z" fill="${c.k}"/><rect x="88" y="0" width="4" height="12" fill="${c.k}"/><path d="M92 1 L108 6 L92 11Z" fill="${c.a}"/>`),
  fire: (c) => svgEl(100, 100, `<circle cx="50" cy="60" r="46" fill="${c.a}" opacity=".16"/>
    <rect x="18" y="82" width="64" height="9" rx="4.5" fill="${mixc(c.a, c.k, 0.62)}" transform="rotate(-12 50 86)"/><rect x="18" y="82" width="64" height="9" rx="4.5" fill="${mixc(c.a, c.k, 0.5)}" transform="rotate(12 50 86)"/>
    <g class="flick"><path d="M50 14 C70 36 76 52 70 68 C66 80 34 80 30 68 C24 52 40 44 50 14Z" fill="${c.a}"/><path d="M50 36 C62 50 64 60 60 68 C56 76 44 76 40 68 C36 60 44 54 50 36Z" fill="${c.b}"/><path d="M50 54 C56 62 55 70 50 72 C45 70 44 62 50 54Z" fill="${c.star}"/></g>`),
  /* clouds */
  sun: (c) => svgEl(150, 150, `<g class="spin">${Array.from({ length: 12 }, (_, i) => `<path d="M75 4 L83 24 L67 24Z" fill="${c.a}" transform="rotate(${i * 30} 75 75)"/>`).join('')}</g>
    <circle cx="75" cy="75" r="42" fill="${mixc(c.a, c.w, 0.2)}"/>${eyes(75, 70, 26, 3.6, c.k)}${smile(75, 80, 12, c.k, 2.4)}${blush(75, 82, 44, c.b)}`),
  cloudy: (c) => svgEl(160, 120, `
    <ellipse cx="62" cy="108" rx="9" ry="6" fill="${c.c}"/><ellipse cx="98" cy="108" rx="9" ry="6" fill="${c.c}"/>
    <g fill="${mixc(c.w, c.k, 0.1)}" transform="translate(0 5)"><circle cx="46" cy="64" r="28"/><circle cx="80" cy="46" r="36"/><circle cx="116" cy="64" r="27"/><rect x="28" y="62" width="104" height="32" rx="16"/></g>
    <g fill="${c.w}"><circle cx="46" cy="64" r="28"/><circle cx="80" cy="46" r="36"/><circle cx="116" cy="64" r="27"/><rect x="28" y="62" width="104" height="32" rx="16"/></g>
    ${eyes(80, 66, 30, 3.8, c.k)}${smile(80, 76, 10, c.k, 2.4)}${blush(80, 78, 48, c.b)}`),
  balloon: (c) => svgEl(110, 170, `
    <path d="M30 104 L44 136 M80 104 L66 136" stroke="${c.k}" stroke-width="2" opacity=".6"/>
    <path d="M55 6 C92 6 104 40 100 62 C96 84 76 100 55 110 C34 100 14 84 10 62 C6 40 18 6 55 6Z" fill="${c.b}"/>
    <path d="M55 6 C70 26 72 76 55 110 C38 76 40 26 55 6Z" fill="${c.w}"/><path d="M55 6 C92 6 104 40 100 62 C96 84 76 100 55 110 C84 76 82 26 55 6Z" fill="${c.a}" opacity=".9"/>
    <rect x="40" y="134" width="30" height="22" rx="4" fill="${mixc(c.a, c.k, 0.45)}"/><rect x="40" y="134" width="30" height="6" rx="3" fill="${mixc(c.a, c.k, 0.3)}"/>`),
  bird: (c) => svgEl(50, 30, `<path d="M2 20 Q14 2 25 18 Q36 2 48 20 Q36 12 25 26 Q14 12 2 20Z" fill="${c.k}" opacity=".7"/>`),
  /* dino */
  dino: (c) => svgEl(230, 180, `
    <path d="M70 116 C40 110 16 124 6 150 C30 140 52 142 72 138Z" fill="${c.a}"/>
    <rect x="86" y="138" width="17" height="34" rx="8" fill="${mixc(c.a, c.k, 0.22)}"/><rect x="138" y="138" width="17" height="34" rx="8" fill="${mixc(c.a, c.k, 0.22)}"/>
    <path d="M158 104 C182 84 184 52 178 36" fill="none" stroke="${c.a}" stroke-width="28" stroke-linecap="round"/>
    <ellipse cx="118" cy="118" rx="58" ry="38" fill="${c.a}"/><ellipse cx="118" cy="136" rx="40" ry="16" fill="${mixc(c.a, c.w, 0.5)}"/>
    <rect x="70" y="140" width="18" height="36" rx="9" fill="${c.a}"/><rect x="152" y="140" width="18" height="36" rx="9" fill="${c.a}"/>
    <ellipse cx="184" cy="30" rx="26" ry="17" fill="${c.a}"/>
    <circle cx="96" cy="100" r="6" fill="${mixc(c.a, c.k, 0.2)}"/><circle cx="118" cy="92" r="8" fill="${mixc(c.a, c.k, 0.2)}"/><circle cx="140" cy="102" r="5" fill="${mixc(c.a, c.k, 0.2)}"/>
    ${eye(188, 26, 3.6, c.k)}${smile(198, 34, 10, c.k, 2.2)}${blush(180, 36, 0, c.b)}`),
  volcano: (c) => svgEl(230, 160, `
    <g fill="${c.w}" opacity=".85"><circle cx="112" cy="30" r="14"/><circle cx="130" cy="18" r="11"/><circle cx="98" cy="14" r="8"/></g>
    <path d="M80 50 L150 50 L224 158 L6 158Z" fill="${mixc(c.b, c.k, 0.55)}"/><path d="M115 50 L150 50 L224 158 L115 158Z" fill="${mixc(c.b, c.k, 0.66)}"/>
    <path d="M80 50 L150 50 L158 62 C150 72 142 60 136 74 C130 86 122 64 114 78 C108 88 100 66 92 74 C86 78 80 64 76 58Z" fill="${c.b}"/>`),
  ptero: (c) => svgEl(110, 60, `<path d="M4 20 C24 6 44 14 54 30 C66 12 88 6 106 18 C88 20 74 30 66 44 L58 36 L50 46 C44 32 26 22 4 20Z" fill="${mixc(c.b, c.k, 0.3)}"/><path d="M54 30 L72 24 L60 36Z" fill="${c.c}"/>`),
  fern: (c) => svgEl(90, 90, `<g fill="${c.a}"><path d="M45 88 C40 60 20 44 4 40 C24 34 42 50 45 70Z"/><path d="M45 88 C50 60 70 44 86 40 C66 34 48 50 45 70Z"/><path d="M45 88 C36 54 40 24 45 6 C50 24 54 54 45 88Z" fill="${mixc(c.a, c.k, 0.2)}"/></g>`),
  /* robots */
  robot: (c) => svgEl(140, 170, `
    <rect x="68" y="4" width="4" height="18" fill="${c.c}"/><circle cx="70" cy="6" r="6" fill="${c.a}"/>
    <rect x="10" y="86" width="16" height="44" rx="8" fill="${mixc(c.w, c.k, 0.2)}"/><rect x="114" y="66" width="16" height="44" rx="8" fill="${mixc(c.w, c.k, 0.2)}" transform="rotate(-34 122 106)"/>
    <rect x="44" y="134" width="18" height="26" rx="5" fill="${c.c}"/><rect x="78" y="134" width="18" height="26" rx="5" fill="${c.c}"/><ellipse cx="53" cy="162" rx="15" ry="6" fill="${c.k}"/><ellipse cx="87" cy="162" rx="15" ry="6" fill="${c.k}"/>
    <rect x="26" y="80" width="88" height="58" rx="13" fill="${c.a}"/><circle cx="52" cy="108" r="14" fill="${c.w}"/><path d="M52 108 L60 99" stroke="${c.k}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="84" cy="100" r="5" fill="${c.b}"/><circle cx="98" cy="100" r="5" fill="${c.w}"/><rect x="78" y="112" width="26" height="6" rx="3" fill="${mixc(c.a, c.k, 0.3)}"/>
    <rect x="60" y="70" width="20" height="12" fill="${c.c}"/>
    <circle cx="26" cy="46" r="7" fill="${c.c}"/><circle cx="114" cy="46" r="7" fill="${c.c}"/>
    <rect x="30" y="20" width="80" height="54" rx="14" fill="${c.w}"/><rect x="40" y="30" width="60" height="34" rx="9" fill="${c.k}"/>
    <g class="blink"><rect x="50" y="38" width="10" height="10" rx="3" fill="${c.b}"/><rect x="80" y="38" width="10" height="10" rx="3" fill="${c.b}"/></g>${smile(70, 54, 12, c.b, 2.4)}`),
  gear: (c) => gear(c.c, c.far),
  gear2: (c) => gear(c.a, c.far, 7),
  bulb: (c) => svgEl(70, 130, `<rect x="33" y="0" width="4" height="56" fill="${c.k}"/><rect x="26" y="52" width="18" height="14" rx="3" fill="${c.c}"/><circle cx="35" cy="86" r="34" fill="${c.b}" opacity=".2"/><circle cx="35" cy="84" r="20" fill="${c.b}"/><path d="M28 80 q7 10 14 0" fill="none" stroke="${c.w}" stroke-width="2.5" stroke-linecap="round"/>`),
  /* candy */
  gummy: (c) => svgEl(130, 150, `
    <circle cx="36" cy="20" r="13" fill="${c.a}"/><circle cx="94" cy="20" r="13" fill="${c.a}"/>
    <ellipse cx="24" cy="92" rx="13" ry="20" fill="${c.a}" transform="rotate(24 24 92)"/><ellipse cx="106" cy="92" rx="13" ry="20" fill="${c.a}" transform="rotate(-24 106 92)"/>
    <ellipse cx="46" cy="136" rx="17" ry="11" fill="${c.a}"/><ellipse cx="84" cy="136" rx="17" ry="11" fill="${c.a}"/>
    <ellipse cx="65" cy="100" rx="36" ry="40" fill="${c.a}"/><ellipse cx="65" cy="106" rx="20" ry="24" fill="${mixc(c.a, c.w, 0.45)}"/>
    <circle cx="65" cy="44" r="32" fill="${c.a}"/><ellipse cx="65" cy="54" rx="13" ry="10" fill="${mixc(c.a, c.w, 0.45)}"/>
    ${eyes(65, 42, 26, 3.6, c.k)}<circle cx="65" cy="51" r="2.6" fill="${c.k}"/>${smile(65, 56, 8, c.k)}${blush(65, 54, 44, c.w)}`),
  lolli: (c) => svgEl(80, 170, `<rect x="37" y="60" width="6" height="108" rx="3" fill="${c.w}"/><circle cx="40" cy="40" r="36" fill="${c.a}"/><circle cx="40" cy="40" r="27" fill="${c.w}"/><circle cx="40" cy="40" r="18" fill="${c.a}"/><circle cx="40" cy="40" r="9" fill="${c.w}"/>`),
  donut: (c) => svgEl(110, 110, `<path d="M55 8 a47 47 0 1 0 0.01 0Z M55 40 a15 15 0 1 1 -0.01 0Z" fill="${mixc(c.b, c.k, 0.2)}" fill-rule="evenodd"/><path d="M55 14 a41 41 0 1 0 0.01 0Z M55 38 a17 17 0 1 1 -0.01 0Z" fill="${c.a}" fill-rule="evenodd"/>
    ${[[30, 34, 20, c.w], [74, 28, -30, c.b], [84, 60, 40, c.c], [64, 84, 10, c.w], [30, 70, -40, c.c], [48, 22, 70, c.b]].map(([x, y, r, f]) => `<rect x="${x}" y="${y}" width="10" height="4" rx="2" fill="${f}" transform="rotate(${r} ${x + 5} ${y + 2})"/>`).join('')}`),
  cupcake: (c) => svgEl(100, 120, `<circle cx="50" cy="16" r="9" fill="${c.a}"/><ellipse cx="50" cy="40" rx="22" ry="14" fill="${c.w}"/><ellipse cx="50" cy="56" rx="32" ry="16" fill="${c.w}"/><ellipse cx="50" cy="70" rx="40" ry="14" fill="${mixc(c.w, c.a, 0.25)}"/><path d="M14 74 L86 74 L76 116 L24 116Z" fill="${c.c}"/><path d="M30 74 L36 116 M50 74 V116 M70 74 L64 116" stroke="${mixc(c.c, c.k, 0.25)}" stroke-width="4"/>`),
  /* blossom evening */
  shiba: (c) => svgEl(150, 140, `
    <circle cx="112" cy="96" r="18" fill="${c.c}"/><circle cx="112" cy="96" r="9" fill="${c.w}"/>
    <path d="M42 134 C34 100 48 74 68 74 C88 74 102 100 94 134Z" fill="${c.c}"/><ellipse cx="68" cy="114" rx="15" ry="20" fill="${c.w}"/>
    <ellipse cx="56" cy="134" rx="9" ry="5" fill="${c.w}"/><ellipse cx="80" cy="134" rx="9" ry="5" fill="${c.w}"/>
    <path d="M38 34 L42 10 L60 26Z M98 34 L94 10 L76 26Z" fill="${c.c}"/><path d="M44 28 L45 17 L54 26Z M92 28 L91 17 L82 26Z" fill="${c.a}"/>
    <circle cx="68" cy="50" r="33" fill="${c.c}"/><path d="M40 52 C50 58 60 54 68 70 C76 54 86 58 96 52 C96 72 84 83 68 83 C52 83 40 72 40 52Z" fill="${c.w}"/>
    ${eyes(68, 46, 28, 3.4, c.k)}<circle cx="68" cy="64" r="3.2" fill="${c.k}"/>${smile(68, 69, 8, c.k)}${blush(68, 60, 46, c.a)}`),
  branch: (c) => svgEl(340, 210, `<g fill="none" stroke="${mixc(c.near, c.k, 0.45)}" stroke-linecap="round"><path d="M340 20 C270 30 220 60 150 70 C110 76 70 100 40 130" stroke-width="9"/><path d="M230 56 C220 90 190 110 170 150" stroke-width="6"/><path d="M150 70 C130 50 110 46 80 40" stroke-width="5"/></g>
    ${[[300, 34, 1.5], [260, 48, 1.2], [214, 70, 1.6], [176, 62, 1.1], [140, 80, 1.5], [96, 104, 1.3], [54, 126, 1.6], [200, 110, 1.3], [180, 140, 1.5], [112, 48, 1.3], [84, 42, 1.1], [320, 16, 1.1]].map(([x, y, s], i) => blossom(x, y, s, i % 3 ? c.a : c.w, c.b)).join('')}`),
  lantern: (c) => svgEl(70, 140, `<rect x="34" y="0" width="2" height="24" fill="${c.k}"/><rect x="22" y="22" width="26" height="8" rx="3" fill="${c.k}"/><ellipse cx="35" cy="66" rx="27" ry="38" fill="${c.b}"/><g fill="none" stroke="${mixc(c.b, c.k, 0.22)}" stroke-width="2"><path d="M35 28 V104"/><path d="M22 32 C12 54 12 78 22 100"/><path d="M48 32 C58 54 58 78 48 100"/></g><rect x="22" y="102" width="26" height="8" rx="3" fill="${c.k}"/><rect x="33" y="110" width="4" height="22" rx="2" fill="${c.c}"/>`),
  petal: (c) => svgEl(20, 14, `<ellipse cx="10" cy="7" rx="9" ry="5" fill="${c.a}" transform="rotate(-20 10 7)"/>`),
  /* desert */
  fennec: (c) => svgEl(150, 150, `
    <path d="M90 136 C132 138 142 104 124 82 C122 104 110 114 90 118Z" fill="${mixc(c.a, c.w, 0.4)}"/>
    <path d="M44 144 C36 110 50 86 68 86 C86 86 100 110 92 144Z" fill="${mixc(c.a, c.w, 0.4)}"/><ellipse cx="68" cy="126" rx="13" ry="18" fill="${c.w}"/>
    <path d="M40 60 L22 6 L62 40Z M96 60 L114 6 L74 40Z" fill="${mixc(c.a, c.w, 0.4)}"/><path d="M40 50 L30 18 L54 40Z M96 50 L106 18 L82 40Z" fill="${c.b}" opacity=".6"/>
    <path d="M38 62 C38 44 52 36 68 36 C84 36 98 44 98 62 C98 82 82 94 68 94 C54 94 38 82 38 62Z" fill="${mixc(c.a, c.w, 0.4)}"/>
    <path d="M42 70 C52 74 60 72 68 86 C76 72 84 74 94 70 C90 86 80 94 68 94 C56 94 46 86 42 70Z" fill="${c.w}"/>
    ${eyes(68, 62, 28, 3.6, c.k)}<circle cx="68" cy="82" r="3" fill="${c.k}"/>${blush(68, 72, 44, c.b)}`),
  cactus: (c) => svgEl(100, 160, `<g fill="none" stroke="${c.c}" stroke-linecap="round"><path d="M50 156 V30" stroke-width="26"/><path d="M50 96 H22 V64" stroke-width="16"/><path d="M50 78 H80 V44" stroke-width="16"/></g><g stroke="${mixc(c.c, c.k, 0.25)}" stroke-width="2" stroke-linecap="round"><path d="M44 40 V150 M56 40 V150"/></g><circle cx="50" cy="16" r="8" fill="${c.b}"/><circle cx="50" cy="16" r="3" fill="${c.a}"/>`),
  bigsun: (c) => svgEl(200, 200, `<circle cx="100" cy="100" r="96" fill="${c.a}" opacity=".35"/><circle cx="100" cy="100" r="72" fill="${c.a}"/><g fill="${c.sky2}" opacity=".55"><rect x="20" y="118" width="160" height="6"/><rect x="20" y="134" width="160" height="8"/><rect x="20" y="152" width="160" height="10"/></g>`),
  /* arctic */
  penguin: (c) => svgEl(120, 150, `
    <ellipse cx="40" cy="142" rx="14" ry="6" fill="${c.c}"/><ellipse cx="80" cy="142" rx="14" ry="6" fill="${c.c}"/>
    <ellipse cx="16" cy="94" rx="10" ry="26" fill="${c.k}" transform="rotate(18 16 94)"/><ellipse cx="104" cy="94" rx="10" ry="26" fill="${c.k}" transform="rotate(-18 104 94)"/>
    <ellipse cx="60" cy="92" rx="40" ry="50" fill="${c.k}"/><ellipse cx="60" cy="100" rx="27" ry="38" fill="${c.w}"/>
    <circle cx="60" cy="44" r="32" fill="${c.k}"/><circle cx="48" cy="46" r="14" fill="${c.w}"/><circle cx="72" cy="46" r="14" fill="${c.w}"/><ellipse cx="60" cy="56" rx="14" ry="10" fill="${c.w}"/>
    ${eyes(60, 44, 24, 3.6, c.k)}<path d="M53 53 h14 l-7 9Z" fill="${c.c}"/>${blush(60, 56, 42, c.b)}
    <rect x="26" y="68" width="68" height="12" rx="6" fill="${c.a}"/><rect x="74" y="74" width="12" height="30" rx="5" fill="${c.a}"/><rect x="74" y="96" width="12" height="4" fill="${mixc(c.a, c.k, 0.3)}"/>`),
  bear: (c) => svgEl(140, 130, `
    <circle cx="42" cy="26" r="13" fill="${c.w}"/><circle cx="98" cy="26" r="13" fill="${c.w}"/><circle cx="42" cy="26" r="6" fill="${mixc(c.w, c.b, 0.35)}"/><circle cx="98" cy="26" r="6" fill="${mixc(c.w, c.b, 0.35)}"/>
    <ellipse cx="70" cy="100" rx="46" ry="30" fill="${c.w}"/><ellipse cx="40" cy="120" rx="16" ry="9" fill="${c.w}"/><ellipse cx="100" cy="120" rx="16" ry="9" fill="${c.w}"/>
    <circle cx="70" cy="54" r="38" fill="${c.w}"/><ellipse cx="70" cy="66" rx="16" ry="12" fill="${mixc(c.w, c.far, 0.35)}"/>
    ${eyes(70, 52, 30, 3.6, c.k)}<ellipse cx="70" cy="62" rx="4.5" ry="3.2" fill="${c.k}"/>${smile(70, 68, 8, c.k)}${blush(70, 64, 50, c.c)}`),
  igloo: (c) => svgEl(170, 100, `<path d="M10 96 A75 75 0 0 1 160 96Z" fill="${c.w}"/><g fill="none" stroke="${mixc(c.w, c.far, 0.55)}" stroke-width="2.5"><path d="M14 74 H156 M26 52 H144 M48 32 H122 M60 74 V96 M110 74 V96 M44 52 V74 M86 52 V74 M128 52 V74 M66 32 V52 M104 32 V52"/></g><path d="M62 96 V72 a23 23 0 0 1 46 0 V96Z" fill="${c.k}"/><path d="M56 96 V72 a29 29 0 0 1 58 0 V96" fill="none" stroke="${mixc(c.w, c.far, 0.4)}" stroke-width="7"/>`),
  /* pixel arcade */
  slime: (c) => pixels(['....GGGG....', '..GGGGGGGG..', '.GGLLGGGGGG.', '.GLGGGGGGGG.', 'GGGGGGGGGGGG', 'GGKWGGGGKWGG', 'GGKKGGGGKKGG', 'GGGGGDDGGGGG', 'GGGGGGGGGGGG', '.DGGGGGGGGD.'], { G: c.a, L: mixc(c.a, '#ffffff', 0.55), K: c.k, W: '#ffffff', D: mixc(c.a, c.k, 0.3) }, 10),
  pcloud: (c) => pixels(['...WWWW.....', '..WWWWWWWW..', '.WWWWWWWWWW.', 'WWWWWWWWWWWW', '.SSSSSSSSSS.'], { W: c.w, S: mixc(c.w, c.k, 0.18) }, 9),
  coin: (c) => pixels(['.YYY.', 'YLYYY', 'YLYYD', 'YLYYD', 'YYYYD', '.DDD.'], { Y: c.b, L: mixc(c.b, '#ffffff', 0.6), D: mixc(c.b, c.k, 0.3) }, 8),
  pheart: (c) => pixels(['.RR.RR.', 'RLRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'], { R: c.c, L: mixc(c.c, '#ffffff', 0.6) }, 8),
  /* monsters */
  mon1: (c) => svgEl(130, 170, `
    <path d="M34 34 L40 4 L54 30Z M96 34 L90 4 L76 30Z" fill="${c.w}"/>
    <path d="M22 96 C6 86 4 70 10 60" fill="none" stroke="${c.a}" stroke-width="11" stroke-linecap="round"/><path d="M108 96 C126 84 128 62 120 50" fill="none" stroke="${c.a}" stroke-width="11" stroke-linecap="round"/>
    <rect x="22" y="24" width="86" height="130" rx="43" fill="${c.a}"/>${[30, 48, 66, 84, 100].map((x) => `<circle cx="${x}" cy="154" r="10" fill="${c.a}"/>`).join('')}
    <circle cx="44" cy="126" r="7" fill="${mixc(c.a, c.k, 0.2)}"/><circle cx="84" cy="134" r="5" fill="${mixc(c.a, c.k, 0.2)}"/>
    ${[42, 65, 88].map((x, i) => `<circle cx="${x}" cy="${i === 1 ? 58 : 64}" r="${i === 1 ? 12 : 10}" fill="#fff"/>${eye(x, i === 1 ? 59 : 65, i === 1 ? 5 : 4, c.k)}`).join('')}
    <path d="M40 92 Q65 118 90 92Z" fill="${c.k}"/><rect x="52" y="92" width="8" height="8" fill="#fff"/><rect x="70" y="92" width="8" height="8" fill="#fff"/>`),
  mon2: (c) => svgEl(140, 140, `
    <path d="M48 40 L40 12 M92 40 L100 12" stroke="${c.b}" stroke-width="6" stroke-linecap="round"/><circle cx="40" cy="12" r="11" fill="#fff"/><circle cx="100" cy="12" r="11" fill="#fff"/>${eye(41, 13, 4.4, c.k)}${eye(101, 13, 4.4, c.k)}
    <ellipse cx="46" cy="128" rx="16" ry="8" fill="${mixc(c.b, c.k, 0.25)}"/><ellipse cx="94" cy="128" rx="16" ry="8" fill="${mixc(c.b, c.k, 0.25)}"/>
    <circle cx="70" cy="82" r="50" fill="${c.b}"/><circle cx="40" cy="64" r="6" fill="${mixc(c.b, c.w, 0.4)}"/><circle cx="102" cy="100" r="8" fill="${mixc(c.b, c.w, 0.4)}"/>
    <path d="M40 84 Q70 122 100 84Z" fill="${c.k}"/><path d="M62 85 h14 l-7 12Z" fill="#fff"/>${blush(70, 80, 78, c.c)}`),
  mon3: (c) => svgEl(150, 100, `
    <path class="flap" d="M52 50 L8 24 L22 52 L6 62 L30 68 L26 86 L56 66Z" fill="${mixc(c.c, c.k, 0.2)}"/><path class="flap r" d="M98 50 L142 24 L128 52 L144 62 L120 68 L124 86 L94 66Z" fill="${mixc(c.c, c.k, 0.2)}"/>
    <circle cx="75" cy="56" r="34" fill="${c.c}"/><circle cx="62" cy="48" r="10" fill="#fff"/><circle cx="88" cy="48" r="10" fill="#fff"/>${eye(63, 49, 4.4, c.k)}${eye(89, 49, 4.4, c.k)}
    ${smile(75, 66, 14, c.k, 2.6)}<path d="M80 68 l3 7 l3 -7Z" fill="#fff"/>`),
  bunting: (c) => svgEl(420, 90, `<path d="M0 8 Q210 70 420 8" fill="none" stroke="${c.k}" stroke-width="2" opacity=".6"/>${Array.from({ length: 9 }, (_, i) => { const t = (i + 0.5) / 9, x = t * 420, y = 8 + 62 * 2 * t * (1 - t); return `<path d="M${x - 18} ${y} L${x + 18} ${y} L${x} ${y + 34}Z" fill="${[c.a, c.b, c.c, c.far][i % 4]}"/>`; }).join('')}`),
};

/* ---------- scenes ---------- */
const sky = (a, b, mid) => `linear-gradient(180deg, ${a}${mid ? `, ${mid} 62%` : ''}, ${b})`;
const SCENES = {
  orbit: (c) => ({ sky: sky(c.sky1, c.sky2), stars: 110, mascot: 'astro', skyObj: 'planet',
    layers: [['hills', c.far, 30, 11], ['peaks', c.mid, 20, 5], ['hills', c.near, 12, 23]],
    sprites: [{ s: 'planet', at: 'tr', x: 30, y: 40, w: 190 }, { s: 'moon', at: 'tl', x: 46, y: 50, w: 74 }, { s: 'astro', at: 'br', x: 30, w: 118, char: 1, float: 1, lift: 60 }, { s: 'rocket', at: 'bl', x: 46, w: 66, rot: -14 }] }),
  lofi: (c) => ({ sky: sky(c.sky1, c.sky2), stars: 60, mascot: 'cat', skyObj: 'fullmoon', lights: c.star,
    layers: [['city', c.far, 44, 4], ['city', c.mid, 30, 9], ['hills', c.near, 9, 2]],
    sprites: [{ s: 'fullmoon', at: 'tr', x: 60, y: 46, w: 110 }, { s: 'cat', at: 'br', x: 18, w: 172, char: 1 }, { s: 'lamp', at: 'bl', x: 22, w: 100 }, { s: 'mug', at: 'bl', x: 124, w: 48 }] }),
  reef: (c) => ({ sky: sky(c.sky1, c.sky2), bubbles: 26, mascot: 'octo', skyObj: 'fish', rays: c.star,
    layers: [['dunes', c.far, 30, 7], ['hills', c.mid, 20, 12], ['dunes', c.near, 11, 31]],
    sprites: [{ s: 'whale', at: 'tr', x: 20, y: 90, w: 210, char: 1, float: 1 }, { s: 'fish', at: 'tl', x: 40, y: 150, w: 44 }, { s: 'fish', at: 'tl', x: 96, y: 190, w: 30 }, { s: 'kelp', at: 'bl', x: 14, w: 52 }, { s: 'kelp', at: 'bl', x: 74, w: 38 }, { s: 'coral', at: 'bl', x: 110, w: 84 }, { s: 'octo', at: 'br', x: 30, w: 118, char: 1 }, { s: 'kelp', at: 'br', x: 150, w: 40 }] }),
  camp: (c) => ({ sky: sky(c.sky1, c.sky2, '#6b3f5e'), stars: 70, mascot: 'fox', skyObj: 'moon', flies: 14,
    layers: [['peaks', c.far, 42, 6], ['pines', c.mid, 30, 14], ['hills', c.near, 12, 8]],
    sprites: [{ s: 'moon', at: 'tr', x: 70, y: 50, w: 70 }, { s: 'tent', at: 'bl', x: 18, w: 168 }, { s: 'fire', at: 'br', x: 150, w: 78 }, { s: 'fox', at: 'br', x: 22, w: 128, char: 1 }] }),
  desert: (c) => ({ sky: sky(c.sky1, c.sky2, '#c2476b'), stars: 40, mascot: 'fennec', skyObj: 'bigsun',
    layers: [['mesa', c.far, 40, 3], ['mesa', c.mid, 26, 17], ['dunes', c.near, 12, 5]],
    sprites: [{ s: 'bigsun', at: 'tr', x: 10, y: 150, w: 210 }, { s: 'cactus', at: 'bl', x: 30, w: 82 }, { s: 'cactus', at: 'bl', x: 128, w: 50 }, { s: 'fennec', at: 'br', x: 28, w: 130, char: 1 }, { s: 'cactus', at: 'br', x: 168, w: 44 }] }),
  aurora: (c) => ({ sky: sky(c.sky1, c.sky2), stars: 90, mascot: 'penguin', skyObj: 'moon', aurora: [c.a, c.b],
    layers: [['ice', c.far, 30, 21], ['ice', c.mid, 20, 4], ['hills', c.near, 11, 13]],
    sprites: [{ s: 'moon', at: 'tl', x: 50, y: 46, w: 62 }, { s: 'igloo', at: 'bl', x: 20, w: 158 }, { s: 'bear', at: 'br', x: 140, w: 104, char: 1 }, { s: 'penguin', at: 'br', x: 28, w: 100, char: 1 }] }),
  arcade: (c) => ({ sky: sky(c.sky1, c.sky2), pstars: 46, mascot: 'slime', skyObj: 'pcloud',
    layers: [['pixel', c.far, 40, 2], ['pixel', c.mid, 26, 8], ['pixel', c.near, 13, 19]],
    sprites: [{ s: 'pcloud', at: 'tl', x: 30, y: 70, w: 120 }, { s: 'pcloud', at: 'tr', x: 60, y: 120, w: 96 }, { s: 'coin', at: 'bl', x: 40, w: 34, lift: 110, float: 1 }, { s: 'coin', at: 'bl', x: 92, w: 34, lift: 150, float: 1 }, { s: 'pheart', at: 'br', x: 150, w: 40, lift: 130, float: 1 }, { s: 'slime', at: 'br', x: 34, w: 112, char: 1, hop: 1 }] }),
  clouds: (c) => ({ sky: sky(c.sky1, c.sky2), mascot: 'cloudy', skyObj: 'sun',
    layers: [['clouds', c.far, 30, 5], ['clouds', c.mid, 20, 11], ['clouds', c.near, 12, 3]],
    sprites: [{ s: 'sun', at: 'tr', x: 34, y: 34, w: 140, char: 1 }, { s: 'balloon', at: 'tl', x: 44, y: 70, w: 92, float: 1 }, { s: 'bird', at: 'tl', x: 150, y: 60, w: 34 }, { s: 'bird', at: 'tr', x: 190, y: 150, w: 26 }, { s: 'cloudy', at: 'br', x: 24, w: 148, char: 1, float: 1, lift: 30 }] }),
  dino: (c) => ({ sky: sky(c.sky1, c.sky2), mascot: 'dino', skyObj: 'ptero',
    layers: [['hills', c.far, 38, 9], ['hills', c.mid, 25, 2], ['dunes', c.near, 12, 14]],
    sprites: [{ s: 'ptero', at: 'tr', x: 60, y: 80, w: 100, float: 1 }, { s: 'volcano', at: 'bl', x: -10, w: 220, back: 1 }, { s: 'fern', at: 'bl', x: 150, w: 70 }, { s: 'dino', at: 'br', x: 6, w: 196, char: 1 }] }),
  robo: (c) => ({ sky: sky(c.sky1, c.sky2), mascot: 'robot', skyObj: 'gear',
    layers: [['city', c.far, 38, 13], ['city', c.mid, 24, 6], ['hills', c.near, 9, 4]],
    sprites: [{ s: 'bulb', at: 'tl', x: 60, y: 0, w: 60 }, { s: 'bulb', at: 'tr', x: 150, y: 0, w: 46 }, { s: 'gear', at: 'bl', x: 20, w: 110, spin: 1, lift: 20 }, { s: 'gear2', at: 'bl', x: 104, w: 70, spin: -1, lift: 70 }, { s: 'robot', at: 'br', x: 30, w: 126, char: 1 }] }),
  candy: (c) => ({ sky: sky(c.sky1, c.sky2), mascot: 'gummy', skyObj: 'donut', frost: c.w,
    layers: [['frost', c.far, 38, 6], ['frost', c.mid, 25, 15], ['frost', c.near, 13, 9]],
    sprites: [{ s: 'donut', at: 'tr', x: 60, y: 60, w: 100, float: 1 }, { s: 'lolli', at: 'bl', x: 30, w: 66 }, { s: 'lolli', at: 'bl', x: 108, w: 46 }, { s: 'cupcake', at: 'br', x: 150, w: 78 }, { s: 'gummy', at: 'br', x: 26, w: 116, char: 1 }] }),
  sakura: (c) => ({ sky: sky(c.sky1, c.sky2), mascot: 'shiba', skyObj: 'lantern', petals: 12,
    layers: [['peaks', c.far, 40, 12], ['hills', c.mid, 25, 7], ['hills', c.near, 12, 1]],
    sprites: [{ s: 'branch', at: 'tr', x: -10, y: 0, w: 320 }, { s: 'lantern', at: 'tl', x: 60, y: 0, w: 56 }, { s: 'lantern', at: 'tl', x: 138, y: 0, w: 40 }, { s: 'shiba', at: 'br', x: 26, w: 128, char: 1 }] }),
  monsters: (c) => ({ sky: sky(c.sky1, c.sky2), mascot: 'mon1', skyObj: 'mon3',
    layers: [['hills', c.far, 36, 16], ['hills', c.mid, 24, 3], ['dunes', c.near, 12, 10]],
    sprites: [{ s: 'bunting', at: 'tl', x: 0, y: 0, w: 380 }, { s: 'bunting', at: 'tr', x: 0, y: 0, w: 380 }, { s: 'mon3', at: 'tr', x: 70, y: 120, w: 120, char: 1, float: 1 }, { s: 'mon2', at: 'bl', x: 24, w: 126, char: 1 }, { s: 'mon1', at: 'br', x: 30, w: 118, char: 1 }] }),
  paper: (c) => ({ sky: sky(c.sky1, c.sky2), layers: [['hills', c.far, 44, 5], ['dunes', c.mid, 30, 9], ['hills', c.near, 16, 2]], sprites: [] }),
  ink: (c) => ({ sky: sky(c.sky1, c.sky2), stars: 30, layers: [['peaks', c.far, 44, 5], ['hills', c.mid, 30, 9], ['dunes', c.near, 16, 2]], sprites: [] }),
};

/* ---------- builders ---------- */
function layerHtml(kind, col, h, seed, spec, cls = '') {
  const r = ridge(kind, seed, 0.62);
  let extra = r.extra ? `<g fill="${col}">${r.extra}</g>` : '';
  if (kind === 'frost' && spec.frost) extra += `<path d="${r.d.replace(/^M0 100 L0 /, 'M0 ').replace(/ L1000 100Z$/, '')}" fill="none" stroke="${spec.frost}" stroke-width="9" stroke-linecap="round" opacity=".95"/>`;
  if (kind === 'city' && spec.lights) { const rr = rng(seed * 7); for (let i = 0; i < 70; i++) extra += `<rect x="${rr() * 990}" y="${52 + rr() * 44}" width="3.200" height="4.500" fill="${spec.lights}" opacity="${0.25 + rr() * 0.6}"/>`; }
  return `<div class="sc-layer ${cls}" style="height:${h}%"><svg viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="${r.d}" fill="${col}"/>${extra}</svg></div>`;
}
function skyBits(spec, c, n = 1) {
  const r = rng(77); let o = '';
  if (spec.stars) { let s = ''; for (let i = 0; i < spec.stars * n; i++) { const big = r() > 0.86; s += `<circle class="${r() > 0.7 ? 'tw' : ''}" style="animation-delay:${(r() * 5).toFixed(1)}s" cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 620).toFixed(0)}" r="${big ? 2.4 : 1 + r()}" fill="${c.star}" opacity="${(0.35 + r() * 0.65).toFixed(2)}"/>`; } o += `<svg class="sc-fill" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMin slice">${s}</svg>`; }
  if (spec.pstars) { let s = ''; for (let i = 0; i < spec.pstars; i++) { const x = Math.round((r() * 1600) / 8) * 8, y = Math.round((r() * 560) / 8) * 8, big = r() > 0.8; s += big ? `<path class="tw" style="animation-delay:${(r() * 4).toFixed(1)}s" d="M${x} ${y - 8}h8v8h8v8h-8v8h-8v-8h-8v-8h8z" fill="${c.star}" opacity=".9"/>` : `<rect x="${x}" y="${y}" width="6" height="6" fill="${c.star}" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`; } o += `<svg class="sc-fill" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMin slice" shape-rendering="crispEdges">${s}</svg>`; }
  if (spec.aurora) o += `<svg class="sc-fill aur" viewBox="0 0 1000 400" preserveAspectRatio="none"><path d="M0 120 C200 40 320 200 520 110 C700 30 820 160 1000 80 L1000 150 C820 230 700 110 520 190 C320 280 200 120 0 200Z" fill="${spec.aurora[0]}" opacity=".42"/><path d="M0 200 C240 130 360 280 560 200 C740 130 860 240 1000 170 L1000 215 C860 290 740 180 560 250 C360 330 240 180 0 250Z" fill="${spec.aurora[1]}" opacity=".34"/></svg>`;
  if (spec.rays) o += `<svg class="sc-fill" viewBox="0 0 1000 600" preserveAspectRatio="none"><g fill="${spec.rays}" opacity=".07"><path d="M120 0 L260 0 L80 600 L-80 600Z"/><path d="M430 0 L520 0 L460 600 L330 600Z"/><path d="M760 0 L900 0 L1040 600 L880 600Z"/></g></svg>`;
  const float = (k, count, html) => { let s = ''; for (let i = 0; i < count; i++) s += html(i); return `<div class="sc-fill sc-${k}">${s}</div>`; };
  if (spec.bubbles) o += float('bubbles', spec.bubbles, () => { const s = 5 + r() * 14; return `<i style="left:${(r() * 100).toFixed(1)}%;width:${s}px;height:${s}px;animation-duration:${(9 + r() * 12).toFixed(1)}s;animation-delay:-${(r() * 20).toFixed(1)}s;background:${c.w}"></i>`; });
  if (spec.petals) o += float('petals', spec.petals, () => `<i style="left:${(r() * 100).toFixed(1)}%;animation-duration:${(11 + r() * 10).toFixed(1)}s;animation-delay:-${(r() * 20).toFixed(1)}s;background:${r() > 0.5 ? c.a : c.w}"></i>`);
  if (spec.flies) o += float('flies', spec.flies, () => `<i style="left:${(4 + r() * 92).toFixed(1)}%;bottom:${(8 + r() * 34).toFixed(1)}%;animation-delay:-${(r() * 6).toFixed(1)}s;background:${c.b}"></i>`);
  return o;
}
function spriteHtml(sp, c, nearH) {
  const svg = SPR[sp.s](c); const side = sp.at[1] === 'l' ? 'left' : 'right';
  const vert = sp.at[0] === 't' ? `top:${sp.y}px` : `bottom:calc(${(nearH * 0.36).toFixed(2)}% + ${sp.lift || 0}px)`;
  const cls = ['sc-sprite', side === 'left' ? 'l' : 'r', sp.char && 'sc-char', sp.float && 'float', sp.hop && 'hop', sp.spin && (sp.spin > 0 ? 'spin' : 'spin rev'), sp.at[0] === 't' ? 'sky' : 'ground'].filter(Boolean).join(' ');
  return `<div class="${cls}" data-x="${sp.x}" data-w="${sp.w}" style="${side}:${sp.x}px;${vert};width:${sp.w}px${sp.rot ? `;rotate:${sp.rot}deg` : ''}">${svg}</div>`;
}
function buildScene(root, t, S) {
  if (!root) return;
  const c = t.st, spec = SCENES[t.id](c), mode = S.scene || 'full';
  root.className = `scene-${mode}`; root.style.background = spec.sky;
  if (mode === 'off') { root.style.background = Color.mix(c.sky2, c.sky1, 0.5); root.innerHTML = ''; return; }
  const sprites = (spec.sprites || []).filter((s) => S.chars !== false || !s.char);
  const L = spec.layers, nearH = L[L.length - 1][2];
  const lay = (i, cls) => layerHtml(L[i][0], L[i][1], L[i][2], L[i][3], spec, cls);
  root.innerHTML = skyBits(spec, c)
    + sprites.filter((s) => s.at[0] === 't').map((s) => spriteHtml(s, c, nearH)).join('')
    + sprites.filter((s) => s.back).map((s) => spriteHtml(s, c, L[1][2] * 1.6)).join('')
    + lay(0, 'd1') + lay(1, 'd2')
    + sprites.filter((s) => s.at[0] === 'b' && !s.back).map((s) => spriteHtml(s, c, nearH)).join('')
    + lay(2, 'd3') + '<div class="sc-veil"></div>';
  requestAnimationFrame(sceneFit);
}
function buildVignette(el, t, S) {
  if (!el) return;
  const c = t.st, spec = SCENES[t.id](c), L = spec.layers;
  const showChar = S.chars !== false && spec.mascot && (S.scene || 'full') !== 'off';
  el.innerHTML = `<div class="vg-scene" style="background:${spec.sky}">
      ${spec.stars || spec.pstars ? `<svg class="sc-fill" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice">${Array.from({ length: 16 }, (_, i) => { const r = rng(i * 13 + 5); return `<circle cx="${r() * 300}" cy="${r() * 70}" r="${0.8 + r()}" fill="${c.star}" opacity="${0.4 + r() * 0.6}"/>`; }).join('')}</svg>` : ''}
      ${showChar && spec.skyObj ? `<div class="vg-sky">${SPR[spec.skyObj](c)}</div>` : ''}
      ${layerHtml(L[0][0], L[0][1], 62, L[0][3] + 1, spec)}${layerHtml(L[1][0], L[1][1], 44, L[1][3] + 1, spec)}
      ${showChar ? `<div class="vg-char sc-char">${SPR[spec.mascot](c)}</div>` : ''}
      ${layerHtml(L[2][0], L[2][1], 22, L[2][3] + 1, spec)}
    </div><button class="vg-sign" id="vgSign" title="Open the study list"><b id="vgTitle"></b><span id="vgSub"></span></button>`;
  if (window.updateVignette) updateVignette();
}
/* small preview used in the theme gallery */
function themeThumb(t) {
  const c = t.st, spec = SCENES[t.id](c), L = spec.layers;
  return `<div class="th-scene" style="background:${spec.sky}">${spec.stars || spec.pstars ? `<svg class="sc-fill" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice">${Array.from({ length: 12 }, (_, i) => { const r = rng(i * 7 + 3); return `<circle cx="${r() * 160}" cy="${r() * 50}" r="${0.6 + r() * 0.8}" fill="${c.star}"/>`; }).join('')}</svg>` : ''}
    ${layerHtml(L[0][0], L[0][1], 58, L[0][3], spec)}${layerHtml(L[1][0], L[1][1], 40, L[1][3], spec)}
    ${spec.mascot ? `<div class="th-char">${SPR[spec.mascot](c)}</div>` : ''}${layerHtml(L[2][0], L[2][1], 20, L[2][3], spec)}</div>`;
}
/* The stage adapts to the room the sheet leaves.
   Wide gutters: props stand beside the sheet, shrunk if needed so none is cut by its edge.
   Narrow gutters: a floor strip opens under the sheet and the cast stands there, fully visible. */
function sceneFit() {
  const root = document.getElementById('stage'); if (!root || typeof S === 'undefined') return;
  const z = S.uiScale || 1, sr = root.getBoundingClientRect(); if (!sr.width) return;
  const covers = [document.getElementById('preview'), document.getElementById('editor'), ...document.querySelectorAll('.split-pane .sp-body')].map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0);
  let gL = sr.width / z, gR = sr.width / z;
  if (covers.length) { gL = (Math.min(...covers.map((r) => r.left)) - sr.left) / z; gR = (sr.right - Math.max(...covers.map((r) => r.right))) / z; }
  const floor = S.scene !== 'off' && Math.min(gL, gR) < 140;
  document.body.classList.toggle('floor', floor);
  root.querySelectorAll('.sc-sprite').forEach((el) => {
    const left = el.classList.contains('l'), skyEl = el.classList.contains('sky'), ext = +el.dataset.x + +el.dataset.w * 1.12;
    let k = floor ? (skyEl ? 0 : innerHeight / z < 780 ? 0.42 : 0.62) : Math.min(1, ((left ? gL : gR) - 14) / ext);
    if (k < 0.42) { el.style.display = 'none'; return; }
    el.style.display = ''; el.style.scale = k.toFixed(3); el.style.transformOrigin = `${left ? 'left' : 'right'} ${skyEl ? 'top' : 'bottom'}`;
  });
}
window.addEventListener('DOMContentLoaded', () => {
  const fit = () => requestAnimationFrame(sceneFit), ro = new ResizeObserver(fit);
  ['main', 'previewPane', 'editorPane', 'preview', 'rightGroups', 'leftGroups'].forEach((id) => { const el = document.getElementById(id); if (el) ro.observe(el); });
  window.addEventListener('resize', fit);
});
/* page covers: the active theme's own paper, cut into a small landscape */
const COVER_VARIANTS = { aurora: [11, 0.95, 0], sunset: [23, 0.8, 1], ocean: [37, 0.7, 0], forest: [41, 1, 1], peach: [53, 0.86, 0], night: [67, 0.74, 1], mono: [79, 0.92, 0], candy: [97, 0.82, 1] };
function coverArt(name) {
  const v = COVER_VARIANTS[name]; if (!v || typeof S === 'undefined') return null;
  const t = themeById(S.theme), c = t.st, spec = SCENES[t.id](c), L = spec.layers;
  return `<div class="cover-art" style="background:${v[2] ? c.sky2 : c.sky1}">${layerHtml(L[0][0], L[0][1], 80 * v[1], v[0], spec)}${layerHtml(L[1][0], L[1][1], 56 * v[1], v[0] + 1, spec)}${layerHtml(L[2][0], L[2][1], 30 * v[1], v[0] + 2, spec)}</div>`;
}
/* depth: layers drift a few pixels as the page scrolls */
function sceneParallax(p) {
  const root = document.getElementById('stage'); if (!root || root.classList.contains('scene-off')) return;
  const set = (sel, k) => root.querySelectorAll(sel).forEach((el) => { el.style.translate = `0 ${(-p * k).toFixed(1)}px`; });
  set('.d1', 6); set('.d2', 12); set('.d3', 20); set('.sc-sprite.ground', 15); set('.sc-sprite.sky', 4);
}
/* one authored moment: the character hops when a page is marked studied */
function sceneCheer() {
  document.querySelectorAll('.sc-char').forEach((el, i) => el.animate(
    [{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-26px) rotate(-5deg)', offset: 0.3 }, { transform: 'translateY(0) rotate(0)', offset: 0.55 }, { transform: 'translateY(-12px) rotate(4deg)', offset: 0.75 }, { transform: 'translateY(0) rotate(0)' }],
    { duration: 900, delay: i * 70, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }));
}
