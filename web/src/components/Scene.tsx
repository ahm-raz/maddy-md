/**
 * A cut-paper night scene in the style of the app's "Orbit" theme: a sky,
 * stars and three ridges. Ridges come from a seeded generator so the scene is
 * identical on every load, the same trick the desktop app uses.
 */

const W = 1600
const H = 520

function rand(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function ridge(seed: number, base: number, amp: number, step: number) {
  const r = rand(seed)
  let d = `M0 ${H} L0 ${base}`
  for (let x = 0; x <= W + step; x += step) {
    const y = base - r() * amp
    const cx = x - step / 2
    d += ` Q${cx} ${y - amp * 0.35} ${x} ${y}`
  }
  return d + ` L${W} ${H} Z`
}

const stars = (() => {
  const r = rand(7)
  return Array.from({ length: 70 }, () => ({ x: r() * W, y: r() * H * 0.62, s: 0.6 + r() * 1.6, o: 0.35 + r() * 0.6 }))
})()

const FAR = ridge(11, 330, 70, 180)
const MID = ridge(23, 395, 60, 140)
const NEAR = ridge(5, 460, 40, 110)

export function Scene() {
  return (
    <svg className="scene" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d0c22" />
          <stop offset="1" stopColor="#2b1f62" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sky)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff4d6" opacity={s.o} className={i % 5 === 0 ? 'twinkle' : undefined} />
      ))}
      <g className="planet">
        <circle cx="1310" cy="120" r="46" fill="#f6b84d" />
        <circle cx="1294" cy="108" r="9" fill="#e19b33" />
        <circle cx="1325" cy="135" r="6" fill="#e19b33" />
        <ellipse cx="1310" cy="122" rx="82" ry="14" fill="none" stroke="#ffd98f" strokeWidth="5" opacity=".75" transform="rotate(-14 1310 122)" />
      </g>
      <path d={FAR} fill="#3a2f7a" />
      <path d={MID} fill="#2a2160" />
      <path d={NEAR} fill="#1a1640" />
    </svg>
  )
}
