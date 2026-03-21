'use client'

import type { LeaderboardEntry, TimeWindow } from '@/lib/types'
import { fmt } from '@/components/LeaderboardTable'
import { ipColor } from '@/lib/ip-colors'
import PlatformIcon from '@/components/PlatformIcon'
import { IPLogo } from '@/components/IPLogo'

interface Props {
  entries: Record<TimeWindow, LeaderboardEntry[]>
}

const WINDOWS: { window: TimeWindow; label: string }[] = [
  { window: '24h', label: 'Last 24 Hours' },
  { window: '7d',  label: 'Last 7 Days'   },
  { window: '30d', label: 'Last 30 Days'  },
]

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

function EntryCard({ entry, delay }: { entry: LeaderboardEntry; delay: number }) {
  const v     = entry.video
  const ip    = v?.ip
  const color = ipColor(ip?.color)

  return (
    <div
      className="row-in flex items-center gap-4 px-5 py-3 overflow-hidden"
      style={{
        background:  `linear-gradient(135deg, ${color}25 0%, ${color}10 60%, transparent 100%)`,
        border:      `1px solid ${color}33`,
        borderLeft:  `5px solid ${color}`,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Left: rank + IP */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base font-black uppercase tracking-widest text-[#666]">
            {ordinal(entry.rank)} place
          </span>
          <PlatformIcon platform={v?.platform} size="sm" />
        </div>
        <div
          className="f1-skew px-2 py-[2px] self-start flex items-center gap-1.5"
          style={{ background: `${color}20`, border: `1px solid ${color}44` }}
        >
          <IPLogo logoUrl={ip?.logo_url ?? null} name={ip?.name ?? ''} size={16} />
          <span className="text-base font-black uppercase tracking-wider" style={{ color }}>
            {ip?.name ?? '??'}
          </span>
        </div>
        <p className="text-lg text-[#999] truncate leading-tight">{v?.title ?? '—'}</p>
      </div>

      {/* Right: view count */}
      <span className="text-3xl font-black tabular-nums text-white shrink-0">
        {fmt(v?.views ?? entry.score)}
      </span>
    </div>
  )
}

export default function MostViewed({ entries }: Props) {
  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 flex items-center gap-4 px-8 py-4 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div
          className="f1-skew px-3 py-[3px]"
          style={{ background: '#e1060018', border: '1px solid #e1060040' }}
        >
          <span className="text-sm font-black uppercase tracking-[0.22em] text-[#e10600]">
            Leaderboard
          </span>
        </div>
        <h1 className="text-5xl font-black italic uppercase tracking-wide text-white">Most Viewed</h1>
        <span className="text-base font-bold text-[#555] uppercase tracking-widest ml-auto">
          Top 12 Videos
        </span>
      </div>

      {/* Three stacked sections (portrait-first layout) */}
      <div className="flex-1 flex flex-col overflow-hidden divide-y divide-[#1a1a1a]">
        {WINDOWS.map(({ window, label }, i) => (
          <div
            key={window}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Section header */}
            <div className="shrink-0 px-8 py-4 bg-[#0d0d0d] border-b border-[#1a1a1a]">
              <span className="text-xl font-black uppercase tracking-wide text-white">{label}</span>
            </div>

            {/* 2-column grid of cards */}
            <div className="flex-1 grid grid-cols-2 gap-2 p-3 overflow-hidden content-start">
              {(entries[window] ?? []).slice(0, 12).map((entry, idx) => (
                <EntryCard key={entry.id} entry={entry} delay={idx * 40} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
