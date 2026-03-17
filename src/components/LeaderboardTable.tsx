'use client'

import { Youtube, Instagram } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/types'
import { ipColor, podiumColor, rankBarColor } from '@/lib/ip-colors'

export function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

interface Props {
  entries: LeaderboardEntry[]
  showVelocity?: boolean
  showEngagement?: boolean
  compact?: boolean
}

export default function LeaderboardTable({ entries, showVelocity, showEngagement, compact }: Props) {
  const rowPy      = compact ? 'py-[5px]' : 'py-[9px]'
  const titleSize  = compact ? 'text-sm'  : 'text-base'
  const metricSize = compact ? 'text-lg'  : 'text-xl'
  const rankSize   = compact ? 'text-xl'  : 'text-2xl'

  return (
    <div className="w-full">
      {/* Column header */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-[#1c1c1c]">
        <div className="w-1 shrink-0" />
        <span className="w-9 text-[10px] uppercase tracking-widest text-[#555] font-bold">P</span>
        <span className="flex-1 text-[10px] uppercase tracking-widest text-[#555] font-bold">Content</span>
        <span className="w-16 text-right text-[10px] uppercase tracking-widest text-[#555] font-bold">
          {showEngagement ? 'Engage' : 'Views'}
        </span>
        {showVelocity && (
          <span className="w-20 text-right text-[10px] uppercase tracking-widest text-[#555] font-bold">
            /hr
          </span>
        )}
      </div>

      {/* Timing rows */}
      <div>
        {entries.map((entry, idx) => {
          const video      = entry.video
          const ip         = video?.ip
          const color      = ipColor(ip?.color)
          const barColor   = rankBarColor(entry.rank)
          const numColor   = podiumColor(entry.rank)
          const engagement = (video?.likes ?? 0) + (video?.comments ?? 0)

          return (
            <div
              key={entry.id}
              className={`timing-row row-in flex items-center gap-3 px-3 ${rowPy} border-b border-[#111]`}
              style={{ animationDelay: `${idx * 35}ms` }}
            >
              {/* Position bar */}
              <div
                className="w-[3px] self-stretch shrink-0 rounded-full"
                style={{ background: barColor, minHeight: 32 }}
              />

              {/* Rank number */}
              <span
                className={`${rankSize} font-black italic tabular-nums w-9 shrink-0 leading-none`}
                style={{ color: numColor }}
              >
                {entry.rank}
              </span>

              {/* IP + title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {/* IP badge — skewed like F1 timing */}
                  <div
                    className="f1-skew px-1.5 py-[1px] shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}44` }}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>
                      {ip?.name ?? '??'}
                    </span>
                  </div>

                  {/* Platform */}
                  {video?.platform === 'youtube'
                    ? <Youtube className="w-3 h-3 text-[#ff0000] shrink-0" />
                    : <Instagram className="w-3 h-3 text-[#e1306c] shrink-0" />
                  }
                </div>

                <p className={`${titleSize} font-bold leading-tight text-white truncate`}>
                  {video?.title ?? '—'}
                </p>
                {((video?.likes ?? 0) > 0 || (video?.comments ?? 0) > 0) && (
                  <p className="text-[10px] text-[#555] leading-none mt-0.5 tabular-nums">
                    ♥ {fmt(video?.likes ?? 0)} · 💬 {fmt(video?.comments ?? 0)}
                  </p>
                )}
              </div>

              {/* Metric value */}
              <span className={`${metricSize} font-black tabular-nums w-16 text-right leading-none text-white`}>
                {showEngagement ? fmt(engagement) : fmt(video?.views ?? entry.score)}
              </span>

              {/* Velocity */}
              {showVelocity && (
                <span
                  className="text-base font-black tabular-nums w-20 text-right leading-none"
                  style={{ color: '#00d2be' }}
                >
                  {fmt(video?.velocity ?? 0)}/h
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
