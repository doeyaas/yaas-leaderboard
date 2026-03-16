'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import CompanyOverview from './screens/CompanyOverview'
import MostViewed from './screens/MostViewed'
import IPGrowth from './screens/IPGrowth'
import type { CompanyStats, LeaderboardEntry, IPGrowthEntry, TimeWindow } from '@/lib/types'

const SCREEN_DURATION_MS = 5 * 60 * 1000

interface Props {
  stats: CompanyStats
  topVideos: LeaderboardEntry[]
  viewedEntries: Record<TimeWindow, LeaderboardEntry[]>
  ipGrowthEntries: IPGrowthEntry[]
  lastUpdated: Date
}

const SCREENS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'most-viewed', label: 'Most Viewed' },
  { id: 'ip-growth',   label: 'IP Growth' },
]

export default function ScreenRotator({
  stats, topVideos, viewedEntries, ipGrowthEntries, lastUpdated
}: Props) {
  const [current, setCurrent]   = useState(0)
  const [progress, setProgress] = useState(0)
  const [clock, setClock]       = useState('')

  const advance = useCallback(() => {
    setCurrent((s) => (s + 1) % SCREENS.length)
    setProgress(0)
  }, [])

  useEffect(() => {
    const t = setInterval(advance, SCREEN_DURATION_MS)
    return () => clearInterval(t)
  }, [advance])

  useEffect(() => {
    const tick = setInterval(() => {
      setProgress((p) => Math.min(p + (1000 / SCREEN_DURATION_MS) * 100, 100))
    }, 1000)
    return () => clearInterval(tick)
  }, [current])

  useEffect(() => {
    setClock(format(new Date(), 'HH:mm:ss'))
    const t = setInterval(() => setClock(format(new Date(), 'HH:mm:ss')), 1000)
    return () => clearInterval(t)
  }, [])

  const monthLabel = format(new Date(), 'MMMM yyyy')

  return (
    <div className="scanlines flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden">

      {/* ── Top nav bar ─────────────────────────────── */}
      <div className="shrink-0 flex items-stretch h-14 bg-[#0d0d0d] border-b border-[#1a1a1a]">

        {/* Brand mark with angled right edge */}
        <div
          className="flex items-center px-5 shrink-0"
          style={{
            background: '#e10600',
            clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)',
            paddingRight: '2rem',
          }}
        >
          <span className="text-white text-sm font-black uppercase tracking-[0.15em] italic">
            LEADERBOARD
          </span>
        </div>

        {/* LIVE indicator */}
        <div className="flex items-center gap-2 px-5 shrink-0 border-r border-[#1a1a1a]">
          <span className="live-dot w-2 h-2 rounded-full bg-[#e10600]" />
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#e10600]">Live</span>
        </div>

        {/* Screen tabs */}
        <div className="flex items-stretch flex-1">
          {SCREENS.map((screen, i) => {
            const active = i === current
            return (
              <button
                key={screen.id}
                onClick={() => { setCurrent(i); setProgress(0) }}
                className="relative flex items-center px-6 text-sm font-black uppercase tracking-[0.12em] transition-colors shrink-0 cursor-pointer"
                style={{ color: active ? '#ffffff' : '#2a2a2a' }}
              >
                {screen.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#e10600]" />
                )}
              </button>
            )
          })}
        </div>

        {/* Clock + last update */}
        <div className="shrink-0 flex items-center gap-4 px-5 border-l border-[#1a1a1a]">
          <span className="text-[10px] text-[#2a2a2a] uppercase tracking-wider hidden xl:block">
            Upd. {format(lastUpdated, 'HH:mm')}
          </span>
          <span className="text-sm font-black tabular-nums text-[#444] tracking-widest">
            {clock}
          </span>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────── */}
      <div className="h-[2px] bg-[#111] shrink-0">
        <div
          className="h-full transition-all duration-1000 ease-linear bg-[#e10600]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Screen content ───────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {current === 0 && <CompanyOverview stats={stats} topVideos={topVideos} />}
        {current === 1 && <MostViewed entries={viewedEntries} />}
        {current === 2 && <IPGrowth entries={ipGrowthEntries} month={monthLabel} />}
      </div>
    </div>
  )
}
