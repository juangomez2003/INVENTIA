import { useId } from 'react'

interface LogoProps {
  size?: number
  hideText?: boolean
}

export default function Logo({ size = 36, hideText = false }: LogoProps) {
  const uid = useId().replace(/:/g, '')
  const gId = `lg-${uid}`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.3), flexShrink: 0 }}>

      {/* Icon mark */}
      <svg
        width={size} height={size}
        viewBox="0 0 40 40" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0a84ff" />
            <stop offset="100%" stopColor="#30d158" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="40" height="40" rx="11" fill={`url(#${gId})`} />

        {/* 3 ascending bars — inventory / analytics */}
        <rect x="8"    y="27" width="5.5" height="7"  rx="2.75" fill="white" fillOpacity="0.6" />
        <rect x="17.2" y="19" width="5.5" height="15" rx="2.75" fill="white" fillOpacity="0.82" />
        <rect x="26.5" y="11" width="5.5" height="23" rx="2.75" fill="white" />

        {/* Accent sparkle dot — AI / intelligence */}
        <circle cx="31.5" cy="9" r="2.8" fill="white" fillOpacity="0.95" />
        <circle cx="31.5" cy="9" r="1.2" fill={`url(#${gId})`} />
      </svg>

      {/* Wordmark */}
      {!hideText && (
        <span style={{
          fontSize: Math.round(size * 0.44),
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: 'var(--text-1)',
          lineHeight: 1,
          userSelect: 'none',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        }}>
          INVENT<span style={{ color: '#30d158' }}>IA</span>
        </span>
      )}

    </div>
  )
}
