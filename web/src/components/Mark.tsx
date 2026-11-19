import { useId } from 'react'

/** The Maddy MD mark: a cut diamond on a violet-to-cyan tile, same as the app icon. */
export function Mark({ size = 28 }: { size?: number }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="mark">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7b5cff" />
          <stop offset="1" stopColor="#25d3f0" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="13" fill={`url(#${id})`} />
      <path d="M32 14 49 32 32 50 15 32Z" fill="#f6f8ff" />
      <path d="M32 24 39.5 32 32 40 24.5 32Z" fill="#7b5cff" />
    </svg>
  )
}
