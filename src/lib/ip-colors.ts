/**
 * Team livery colors for each IP — styled like F1 constructor colors.
 */
export const IP_COLORS: Record<string, string> = {
  'ip-1':  '#e10600', // Ferrari red    — ReactionTest
  'ip-2':  '#0090ff', // Williams blue  — TechToday
  'ip-3':  '#ff8000', // McLaren orange — BuildIndia
  'ip-4':  '#00d2be', // Mercedes teal  — SpaceHunt
  'ip-5':  '#dc143c', // Alfa crimson   — FoodieIndia
  'ip-6':  '#9b0000', // Dark red       — HistoryUnboxed
  'ip-7':  '#005aff', // Alpine blue    — ScienceBurst
  'ip-8':  '#39b54a', // Kick green     — SportsPulse
  'ip-9':  '#b6babd', // Haas silver   — CrimeFiles
  'ip-10': '#229c3c', // Sauber green   — EcoWatch
}

export function ipColor(ipId: string | undefined): string {
  return ipId ? (IP_COLORS[ipId] ?? '#666666') : '#666666'
}

/** P1=gold P2=silver P3=bronze P4+=white */
export const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']

export function podiumColor(rank: number): string {
  return PODIUM_COLORS[rank - 1] ?? '#ffffff'
}

/** Left-bar color for timing rows */
export function rankBarColor(rank: number): string {
  if (rank === 1) return '#FFD700'
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return '#CD7F32'
  if (rank <= 6) return '#e10600'
  return '#333333'
}
