import { Youtube, Instagram } from 'lucide-react'
import type { Platform } from '@/lib/types'

interface Props {
  platform: Platform | undefined
  size?: 'sm' | 'md'
}

const SIZES = { sm: 'w-3 h-3', md: 'w-4 h-4' }

export default function PlatformIcon({ platform, size = 'md' }: Props) {
  const cls = `${SIZES[size]} shrink-0`
  return platform === 'youtube'
    ? <Youtube className={`${cls} text-[#ff0000]`} />
    : <Instagram className={`${cls} text-[#e1306c]`} />
}
