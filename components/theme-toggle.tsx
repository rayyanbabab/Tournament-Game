'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md'
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className={cn(
        'rounded-md border border-border/60 bg-background text-muted-foreground',
        size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
        className
      )} />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'flex items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-all',
        size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
        className
      )}
      title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
    >
      {isDark ? (
        <Sun className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      ) : (
        <Moon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      )}
    </button>
  )
}
