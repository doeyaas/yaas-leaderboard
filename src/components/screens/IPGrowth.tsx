'use client'

import type { IPGrowthEntry } from '@/lib/types'
import { fmt } from '@/components/LeaderboardTable'
import { ipColor, podiumColor, rankBarColor } from '@/lib/ip-colors'

interface Props {
  entries: IPGrowthEntry[]
  month: string
}

export default function IPGrowth({ entries, month }: Props) {
  const maxGrowth = Math.max(...entries.map((e) => Math.abs(e.growth_percentage)), 1)

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 flex items-center gap-4 px-8 py-4 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div
          className="f1-skew px-3 py-[3px]"
          style={{ background: '#e1060018', border: '1px solid #e1060040' }}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e10600]">
            IP Performance
          </span>
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-wide text-white">
          Constructor Standings
        </h1>
        <span className="text-sm font-bold text-[#2a2a2a] uppercase tracking-widest ml-auto">
          {month} vs previous month
        </span>
      </div>

      {/* Column headers */}
      <div className="shrink-0 grid grid-cols-[4px_52px_1fr_140px_140px_160px] gap-x-4 items-center px-8 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2e2e2e]">P</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2e2e2e]">IP / Team</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2e2e2e] text-right">This Month</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2e2e2e] text-right">Last Month</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2e2e2e] text-right">Growth</span>
      </div>

      {/* Rows */}
      <div className="flex-1 flex flex-col justify-around">
        {entries.map((entry) => {
          const positive  = entry.growth_percentage >= 0
          const color     = ipColor(entry.ip.id)
          const barCol    = rankBarColor(entry.rank)
          const numCol    = podiumColor(entry.rank)
          const barWidth  = Math.abs(entry.growth_percentage) / maxGrowth

          return (
            <div
              key={entry.ip.id}
              className="timing-row row-in grid grid-cols-[4px_52px_1fr_140px_140px_160px] gap-x-4 items-center px-8 py-4 border-b border-[#0f0f0f] last:border-0"
              style={{ animationDelay: `${(entry.rank - 1) * 60}ms` }}
            >
              {/* Left position bar */}
              <div className="h-full rounded-full w-[3px]" style={{ background: barCol, minHeight: 40 }} />

              {/* Rank */}
              <span
                className="text-3xl font-black italic tabular-nums leading-none"
                style={{ color: numCol }}
              >
                {entry.rank}
              </span>

              {/* IP name + team color bar */}
              <div className="min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-white shrink-0"
                    style={{ background: `${color}30`, border: `1px solid ${color}60` }}
                  >
                    {entry.ip.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xl font-black uppercase tracking-wide text-white truncate">
                    {entry.ip.name}
                  </span>
                </div>

                {/* Growth bar */}
                <div className="h-[3px] bg-[#1a1a1a] rounded-full overflow-hidden w-full">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${barWidth * 100}%`,
                      background: positive ? '#39b54a' : '#e10600',
                    }}
                  />
                </div>
              </div>

              {/* This month */}
              <span className="text-2xl font-black tabular-nums text-white text-right leading-none">
                {fmt(entry.current_month_views)}
              </span>

              {/* Last month */}
              <span className="text-xl font-bold tabular-nums text-[#3a3a3a] text-right leading-none">
                {fmt(entry.previous_month_views)}
              </span>

              {/* Growth % */}
              <div className="flex items-center justify-end gap-2">
                <span
                  className="text-3xl font-black italic tabular-nums leading-none"
                  style={{ color: positive ? '#39b54a' : '#e10600' }}
                >
                  {positive ? '+' : ''}{entry.growth_percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
