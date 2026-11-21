import { useState } from 'react'

const THEMES = [
  { id: 'graphite', name: 'Graphite', blurb: 'Neutral dark grey' },
  { id: 'midnight', name: 'Midnight', blurb: 'Deep blue' },
  { id: 'ocean', name: 'Ocean', blurb: 'Dark teal' },
  { id: 'forest', name: 'Forest', blurb: 'Dark green' },
  { id: 'plum', name: 'Plum', blurb: 'Dark purple' },
  { id: 'ember', name: 'Ember', blurb: 'Dark amber' },
  { id: 'crimson', name: 'Crimson', blurb: 'Dark red' },
  { id: 'paper', name: 'Paper', blurb: 'Neutral light grey' },
  { id: 'sky', name: 'Sky', blurb: 'Light blue' },
  { id: 'mint', name: 'Mint', blurb: 'Light green' },
  { id: 'sand', name: 'Sand', blurb: 'Light warm beige' },
  { id: 'lilac', name: 'Lilac', blurb: 'Light purple' },
] as const

const shot = (id: string) => `/shots/${id}.webp`

export function Themes() {
  const [current, setCurrent] = useState<string>('graphite')
  const theme = THEMES.find((t) => t.id === current) ?? THEMES[0]

  const preload = (id: string) => {
    const img = new Image()
    img.src = shot(id)
  }

  return (
    <div className="themes">
      <figure className="frame themes-shot">
        <img
          key={theme.id}
          src={shot(theme.id)}
          width={1366}
          height={768}
          loading="lazy"
          decoding="async"
          alt={`Maddy MD with the ${theme.name} theme: ${theme.blurb.toLowerCase()}.`}
        />
        <figcaption>
          <b>{theme.name}</b> · {theme.blurb}
        </figcaption>
      </figure>
      <div className="theme-list" role="radiogroup" aria-label="Theme">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={t.id === current}
            className="theme-chip"
            onClick={() => setCurrent(t.id)}
            onPointerEnter={() => preload(t.id)}
            onFocus={() => preload(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  )
}
