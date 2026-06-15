"use client"

type Props = {
  className?: string
  size?: number
}

/**
 * CloudSketchLogo
 * Minimal logo: cloud outline with small connected nodes (IAC sketch).
 * Colors:
 * - Outline/edges: black
 * - Nodes: dark blue (#0B3B8C)
 */
export function CloudSketchLogo({ className, size = 32 }: Props) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" role="img" aria-label="CloudSketch logo" className={className}>
      {/* cloud outline */}
      <path
        d="M22 42H48a8 8 0 0 0 0-16 11 11 0 0 0-21.3-3.7A10 10 0 0 0 22 42Z"
        fill="none"
        stroke="#000000"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* iac nodes + edges */}
      <line x1="20" y1="34" x2="30" y2="26" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="26" x2="42" y2="30" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="30" x2="50" y2="24" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

      <circle cx="20" cy="34" r="3" fill="#0B3B8C" />
      <circle cx="30" cy="26" r="3" fill="#0B3B8C" />
      <circle cx="42" cy="30" r="3" fill="#0B3B8C" />
      <circle cx="50" cy="24" r="3" fill="#0B3B8C" />
    </svg>
  )
}

export default CloudSketchLogo
