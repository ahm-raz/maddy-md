import { useState } from 'react'

const THEMES = [
  { id: 'orbit', name: 'Orbit', blurb: 'Deep space, one small astronaut' },
  { id: 'lofi', name: 'Night Desk', blurb: 'City lights and a sleeping cat' },
  { id: 'reef', name: 'Deep Reef', blurb: 'A whale and a reading octopus' },
  { id: 'camp', name: 'Forest Camp', blurb: 'Pines, a fire and a fox' },
  { id: 'desert', name: 'Desert Dusk', blurb: 'Mesas, cacti and a fennec' },
  { id: 'aurora', name: 'Arctic Aurora', blurb: 'Northern lights and a penguin' },
  { id: 'arcade', name: 'Pixel Arcade', blurb: 'Blocky hills and a slime' },
  { id: 'clouds', name: 'Cloud Friends', blurb: 'A sunny sky with faces' },
  { id: 'dino', name: 'Dino Valley', blurb: 'A volcano and a gentle giant' },
  { id: 'robo', name: 'Robot Workshop', blurb: 'Gears, bulbs and a helper bot' },
  { id: 'candy', name: 'Candy Hills', blurb: 'Frosted hills and a gummy bear' },
  { id: 'sakura', name: 'Blossom Evening', blurb: 'Falling petals and a shiba' },
  { id: 'monsters', name: 'Monster Party', blurb: 'Three fuzzy guests and bunting' },
  { id: 'paper', name: 'Quiet Paper', blurb: 'Plain layered paper, no characters' },
  { id: 'ink', name: 'Quiet Ink', blurb: 'Dark layered paper, no characters' },
] as const

const shot = (id: string) => `/shots/${id}.webp`

export function Themes() {
  const [current, setCurrent] = useState<string>('reef')
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
