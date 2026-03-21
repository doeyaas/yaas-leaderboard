'use client'

import type { CompanyStats, LeaderboardEntry } from '@/lib/types'
import { fmt } from '@/components/LeaderboardTable'
import { ipColor, rankBarColor, podiumColor } from '@/lib/ip-colors'
import PlatformIcon from '@/components/PlatformIcon'
import { IPLogo } from '@/components/IPLogo'

interface Props {
  stats: CompanyStats
  topVideos: LeaderboardEntry[]
}

const PODIUM_HEIGHT: Record<1 | 2 | 3, string> = { 1: 'h-full', 2: 'h-3/4', 3: 'h-2/3' }

function PodiumCard({ entry, rank }: { entry: LeaderboardEntry; rank: 1 | 2 | 3 }) {
  const v = entry.video
  const ip = v?.ip
  const color = ipColor(ip?.color)
  const numCol = podiumColor(rank)
  const isFirst = rank === 1
  const heightClass = PODIUM_HEIGHT[rank]

  return (
    <div
      className={`relative flex flex-col overflow-hidden flex-1 ${heightClass}`}
      style={{
        background: `linear-gradient(180deg, ${color}22 0%, #0a0a0a 100%)`,
        border: `1px solid ${color}44`,
        ...(isFirst && { borderTop: `3px solid ${color}` }),
      }}
    >
      {/* Rank number */}
      <div
        className="shrink-0 flex items-center justify-center py-4"
        style={{ background: `${color}15`, borderBottom: `1px solid ${color}30` }}
      >
        <span
          className="font-black italic tabular-nums leading-none"
          style={{ color: numCol, fontSize: isFirst ? '7rem' : '5rem' }}
        >
          {rank}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1 overflow-hidden">
        <div
          className="f1-skew px-2 py-[3px] self-start shrink-0 flex items-center gap-1.5"
          style={{ background: `${color}18`, border: `1px solid ${color}50` }}
        >
          <IPLogo logoUrl={ip?.logo_url ?? null} name={ip?.name ?? ''} size={16} />
          <span className="text-base font-black uppercase tracking-wider" style={{ color }}>
            {ip?.name ?? '??'}
          </span>
        </div>
        <p className="text-xl font-bold text-white leading-snug line-clamp-2 flex-1">
          {v?.title ?? '—'}
        </p>
        <div className="flex items-center gap-2 shrink-0 mt-auto">
          <PlatformIcon platform={v?.platform} />
          <span className="text-4xl font-black italic tabular-nums text-white">
            {fmt(v?.views ?? entry.score)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CompanyOverview({ stats, topVideos }: Props) {
  const p1   = topVideos.find(e => e.rank === 1)
  const p2   = topVideos.find(e => e.rank === 2)
  const p3   = topVideos.find(e => e.rank === 3)
  const rest = topVideos.filter(e => e.rank >= 4 && e.rank <= 15)

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 flex items-center gap-4 px-8 py-4 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div
          className="f1-skew px-3 py-[3px]"
          style={{ background: '#e1060018', border: '1px solid #e1060040' }}
        >
          <span className="text-sm font-black uppercase tracking-[0.22em] text-[#e10600]">
            Company Performance
          </span>
        </div>
        <h1 className="text-5xl font-black italic uppercase tracking-wide text-white">Total Reach</h1>
      </div>

      {/* Compact 6-column stats bar */}
      <div className="shrink-0 grid grid-cols-6 border-b border-[#1a1a1a]">
        {[
          { label: '24H Views',    value: fmt(stats.views_24h),              accent: true },
          { label: '7D Views',     value: fmt(stats.views_7d) },
          { label: '30D Views',    value: fmt(stats.views_30d) },
          { label: 'Interactions', value: fmt(stats.total_interactions) },
          { label: 'Videos',       value: stats.total_videos.toLocaleString() },
          { label: 'Active IPs',   value: stats.total_active_ips.toString() },
        ].map(({ label, value, accent }, i) => (
          <div
            key={label}
            className="relative flex flex-col gap-0.5 px-4 py-4 bg-[#0f0f0f]"
            style={{ borderRight: i < 5 ? '1px solid #1a1a1a' : 'none' }}
          >
            {accent && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#e10600]" />}
            <span className="text-sm font-black uppercase tracking-[0.22em] text-[#555]">{label}</span>
            <span className="text-4xl font-black italic tabular-nums text-white leading-none">{value}</span>
          </div>
        ))}
      </div>

      {/* Podium — P2 | P1 | P3, aligned to bottom */}
      <div
        className="shrink-0 flex items-end gap-2 px-8 py-4 h-80"
        style={{ background: '#080808', borderBottom: '1px solid #1a1a1a' }}
      >
        {p2 && <PodiumCard entry={p2} rank={2} />}
        {p1 && <PodiumCard entry={p1} rank={1} />}
        {p3 && <PodiumCard entry={p3} rank={3} />}
      </div>

      {/* Race Results P4–P15 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="shrink-0 px-8 py-2 bg-[#0d0d0d] border-b border-[#1a1a1a]">
          <span className="text-sm font-black uppercase tracking-[0.22em] text-[#666]">
            Race Results — Last 24 Hours
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-around overflow-hidden">
          {rest.map((entry) => {
            const v      = entry.video
            const ip     = v?.ip
            const color  = ipColor(ip?.color)
            const barCol = rankBarColor(entry.rank)
            const numCol = podiumColor(entry.rank)

            return (
              <div
                key={entry.id}
                className="timing-row row-in flex items-center gap-4 px-8 py-3 border-b border-[#111] last:border-0"
                style={{ animationDelay: `${(entry.rank - 4) * 50}ms` }}
              >
                <div className="w-1 h-8 rounded-full shrink-0" style={{ background: barCol }} />
                <span
                  className="text-4xl font-black italic tabular-nums w-12 shrink-0 leading-none"
                  style={{ color: numCol }}
                >
                  {entry.rank}
                </span>
                <div
                  className="f1-skew px-2 py-[2px] shrink-0 flex items-center gap-1.5"
                  style={{ background: `${color}18`, border: `1px solid ${color}44` }}
                >
                  <IPLogo logoUrl={ip?.logo_url ?? null} name={ip?.name ?? ''} size={16} />
                  <span className="text-sm font-black uppercase tracking-wider" style={{ color }}>
                    {ip?.name ?? '??'}
                  </span>
                </div>
                <PlatformIcon platform={v?.platform} />
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-white truncate leading-tight">{v?.title ?? '—'}</p>
                </div>
                <span className="text-3xl font-black tabular-nums text-white shrink-0">
                  {fmt(v?.views ?? entry.score)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
