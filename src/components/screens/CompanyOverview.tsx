'use client'

import { Youtube, Instagram } from 'lucide-react'
import type { CompanyStats, LeaderboardEntry } from '@/lib/types'
import { fmt } from '@/components/LeaderboardTable'
import { ipColor, rankBarColor, podiumColor } from '@/lib/ip-colors'

interface Props {
  stats: CompanyStats
  topVideos: LeaderboardEntry[]
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="relative flex flex-col gap-1 p-5 overflow-hidden"
      style={{ background: '#0f0f0f', borderRight: '1px solid #1a1a1a' }}
    >
      {accent && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#e10600]" />}
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#383838]">{label}</span>
      <span className="text-5xl font-black italic tabular-nums text-white leading-none">{value}</span>
    </div>
  )
}

export default function CompanyOverview({ stats, topVideos }: Props) {
  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 flex items-center gap-4 px-8 py-4 bg-[#0d0d0d] border-b border-[#1a1a1a]">
        <div
          className="f1-skew px-3 py-[3px]"
          style={{ background: '#e1060018', border: '1px solid #e1060040' }}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e10600]">
            Company Performance
          </span>
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-wide text-white">Total Reach</h1>
      </div>

      {/* Big view counters */}
      <div className="shrink-0 grid grid-cols-3 border-b border-[#1a1a1a]">
        <StatCard label="24H Views" value={fmt(stats.views_24h)} accent />
        <StatCard label="7D Views"  value={fmt(stats.views_7d)} />
        <StatCard label="30D Views" value={fmt(stats.views_30d)} />
      </div>

      {/* Secondary counters */}
      <div className="shrink-0 grid grid-cols-3 border-b border-[#1a1a1a]">
        {[
          { label: 'Total Interactions', value: fmt(stats.total_interactions) },
          { label: 'Videos Posted',      value: stats.total_videos.toLocaleString() },
          { label: 'Active IPs',         value: stats.total_active_ips.toString() },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            className="flex items-center gap-4 px-5 py-3 bg-[#0a0a0a]"
            style={{ borderRight: i < 2 ? '1px solid #1a1a1a' : 'none' }}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2e2e2e]">{label}</p>
              <p className="text-3xl font-black italic tabular-nums text-white leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top 5 timing board */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="shrink-0 px-8 py-3 bg-[#0d0d0d] border-b border-[#1a1a1a]">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2e2e2e]">
            Top 5 — Last 24 Hours
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-around">
          {topVideos.slice(0, 5).map((entry) => {
            const v      = entry.video
            const ip     = v?.ip
            const color  = ipColor(ip?.id)
            const barCol = rankBarColor(entry.rank)
            const numCol = podiumColor(entry.rank)

            return (
              <div
                key={entry.id}
                className="timing-row row-in flex items-center gap-4 px-8 py-3 border-b border-[#111] last:border-0"
                style={{ animationDelay: `${(entry.rank - 1) * 60}ms` }}
              >
                <div className="w-[3px] h-8 rounded-full shrink-0" style={{ background: barCol }} />
                <span
                  className="text-3xl font-black italic tabular-nums w-10 shrink-0 leading-none"
                  style={{ color: numCol }}
                >
                  {entry.rank}
                </span>
                <div
                  className="f1-skew px-2 py-[2px] shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}44` }}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>
                    {ip?.name ?? '??'}
                  </span>
                </div>
                {v?.platform === 'youtube'
                  ? <Youtube className="w-4 h-4 text-[#ff0000] shrink-0" />
                  : <Instagram className="w-4 h-4 text-[#e1306c] shrink-0" />
                }
                <span className="flex-1 text-lg font-bold text-white truncate">{v?.title ?? '—'}</span>
                <span className="text-2xl font-black tabular-nums text-white w-24 text-right shrink-0">
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
