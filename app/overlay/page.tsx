'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Flame } from 'lucide-react'

// Live OBS stream overlay with transparent background and auto-updating ticker
export default function ObsOverlayPage() {
  const [tickerIndex, setTickerIndex] = useState(0)

  const teams = [
    { rank: 1, name: 'EVOS Divine', kills: 32, points: 61, delta: '—' },
    { rank: 2, name: 'RRQ Kazu', kills: 26, points: 54, delta: '▲ +1' },
    { rank: 3, name: 'ONIC Olympus', kills: 24, points: 47, delta: '▼ -1' },
    { rank: 4, name: 'Bigetron RA', kills: 23, points: 48, delta: '▲ +2' },
    { rank: 5, name: 'Alter Ego', kills: 20, points: 41, delta: '—' },
    { rank: 6, name: 'Dewa United', kills: 10, points: 23, delta: '—' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % teams.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [teams.length])

  return (
    <div className="min-h-screen bg-transparent p-6 font-sans text-white select-none flex flex-col justify-end">
      {/* Stream Lower Third Ticker */}
      <div className="w-full max-w-4xl mx-auto rounded-2xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-md shadow-2xl p-4 flex items-center justify-between gap-6">
        {/* Brand tag */}
        <div className="flex items-center gap-3 border-r border-zinc-800 pr-4">
          <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-sm text-white">
            GP
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-bold block">
              ● LIVE STANDINGS
            </span>
            <span className="text-xs font-extrabold tracking-tight text-white uppercase">
              GRIDPLAY CUP
            </span>
          </div>
        </div>

        {/* Current Active Team Highlight */}
        <div className="flex-1 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <span className="font-mono font-extrabold text-amber-400 text-lg">
              #{teams[tickerIndex].rank}
            </span>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                {teams[tickerIndex].name}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 block">
                {teams[tickerIndex].kills} KILLS
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono font-extrabold text-lg text-emerald-400">
              {teams[tickerIndex].points} PTS
            </span>
            <span className="text-[10px] font-mono text-zinc-400 block">
              DELTA: {teams[tickerIndex].delta}
            </span>
          </div>
        </div>

        {/* Mini indicator */}
        <div className="border-l border-zinc-800 pl-4 text-[10px] font-mono text-zinc-500">
          MATCH 3 / 6 · BERMUDA
        </div>
      </div>
    </div>
  )
}
