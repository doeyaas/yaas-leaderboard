/**
 * IP colors are stored in the database (ips.color).
 * These helpers operate on the color value passed in from the DB row.
 */

export function ipColor(color: string | undefined): string {
  return color && color !== '' ? color : '#666666'
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
  if (rank <= 6)  return '#e10600'
  return '#333333'
}
