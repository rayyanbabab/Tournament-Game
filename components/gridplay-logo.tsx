import React from 'react'
import Link from 'next/link'

interface GridPlayLogoProps {
  className?: string
  showBadge?: boolean
  badgeText?: string
  href?: string
}

export function GridPlayLogo({
  className = '',
  showBadge = false,
  badgeText,
  href = '/',
}: GridPlayLogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 group cursor-pointer select-none ${className}`}>
      {/* Clean Grid + Play Mark (Not AI) */}
      <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-foreground text-background shrink-0 transition-transform group-hover:scale-105 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4.5 w-4.5"
        >
          {/* Top-Left Cell */}
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.75" fill="currentColor" />
          {/* Bottom-Left Cell */}
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.75" fill="currentColor" />
          {/* Bottom-Right Cell */}
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.75" fill="currentColor" />
          {/* Top-Right Cell: Crisp Play Triangle */}
          <polygon points="14,3.5 20.5,7 14,10.5" fill="currentColor" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex items-center gap-2">
        <span className="font-bold tracking-tight text-[17px] text-foreground font-sans">
          GridPlay
        </span>

        {showBadge && badgeText && (
          <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground px-1.5 py-0.5 rounded bg-muted border border-border/60 font-medium">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
