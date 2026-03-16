'use client'

import LeaderboardTable from '@/components/LeaderboardTable'
import type { LeaderboardEntry, TimeWindow } from '@/lib/types'

interface Props {
  entries: Record<TimeWindow, LeaderboardEntry[]>
}

const SECTORS: { window: TimeWindow; label: string; sub: string }[] = [
  { window: '24h', label: 'Sector 1', sub: 'Last 24 Hours' },
  { window: '7d',  label: 'Sector 2', sub: 'Last 7 Days'   },
  { window: '30d', label: 'Sector 3', sub: 'Last 30 Days'  },
]

export default function MostViewed({ entries }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-4 px-8 py-4 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div
          className="f1-skew px-3 py-[3px]"
          style={{ background: '#e1060018', border: '1px solid #e1060040' }}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e10600]">
            Leaderboard
          </span>
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-wide text-white">Most Viewed</h1>
        <span className="text-sm font-bold text-[#2a2a2a] uppercase tracking-widest ml-auto">
          Top 10 Videos
        </span>
      </div>

      {/* Three-column sector grid */}
      <div className="flex-1 grid grid-cols-3 overflow-hidden">
        {SECTORS.map(({ window, label, sub }, i) => (
          <div
            key={window}
            className="flex flex-col overflow-hidden"
            style={{ borderRight: i < 2 ? '1px solid #1a1a1a' : 'none' }}
          >
            {/* Sector label */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-[#0d0d0d] border-b border-[#1a1a1a]">
              <div
                className="f1-skew px-2 py-[2px]"
                style={{ background: '#ffffff0a', border: '1px solid #ffffff15' }}
              >
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#555]">{label}</span>
              </div>
              <span className="text-sm font-black uppercase tracking-wide text-white">{sub}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <LeaderboardTable entries={entries[window] ?? []} compact />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
