import Image from 'next/image'

export function RadarLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        className="absolute inset-0"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="18.5" stroke="#00D4AA" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="20" cy="20" r="13.5" stroke="#00D4AA" strokeOpacity="0.5" strokeWidth="1" />
      </svg>
      <Image
        src="/brand/logo-dot.png"
        alt="지원금 레이더 로고"
        width={size}
        height={size}
        className="relative"
        style={{ width: size * 0.5, height: size * 0.5 }}
        priority
      />
    </span>
  )
}

/** 배경 장식용 대형 레이더 글로우 (히어로 섹션 우측 등에 사용) */
export function RadarGlow({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <Image
        src="/brand/glow-sphere.png"
        alt=""
        fill
        className="object-contain"
        priority
      />
      <svg viewBox="0 0 600 600" fill="none" className="absolute inset-0 h-full w-full">
        <circle cx="300" cy="300" r="280" stroke="#00D4AA" strokeOpacity="0.1" />
        <circle cx="300" cy="300" r="205" stroke="#00D4AA" strokeOpacity="0.16" />
        <circle cx="300" cy="300" r="130" stroke="#00D4AA" strokeOpacity="0.22" />
      </svg>
    </div>
  )
}
