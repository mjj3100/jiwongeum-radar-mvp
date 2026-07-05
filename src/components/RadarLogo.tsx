export function RadarLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="18" stroke="#00D4AA" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="20" cy="20" r="12.5" stroke="#00D4AA" strokeOpacity="0.55" strokeWidth="1" />
      <circle cx="20" cy="20" r="7" stroke="#00D4AA" strokeOpacity="0.8" strokeWidth="1" />
      <path
        d="M20 20 L20 4 A16 16 0 0 1 33 12 Z"
        fill="#00D4AA"
        fillOpacity="0.25"
      />
      <line x1="20" y1="20" x2="20" y2="4" stroke="#00D4AA" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="2.5" fill="#00D4AA" />
    </svg>
  )
}

/** 배경 장식용 대형 레이더 글로우 (히어로 섹션 우측 등에 사용) */
export function RadarGlow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="radar-glow-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00D4AA" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#00A884" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00A884" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="420" cy="220" r="260" stroke="#00D4AA" strokeOpacity="0.12" />
      <circle cx="420" cy="220" r="190" stroke="#00D4AA" strokeOpacity="0.18" />
      <circle cx="420" cy="220" r="120" stroke="#00D4AA" strokeOpacity="0.25" />
      <circle cx="420" cy="220" r="60" fill="url(#radar-glow-core)" />
    </svg>
  )
}
