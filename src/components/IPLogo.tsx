interface Props {
  logoUrl: string | null
  name: string
  size?: number
}

export function IPLogo({ logoUrl, name, size = 20 }: Props) {
  if (!logoUrl) return null
  return (
    <img
      src={logoUrl}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover shrink-0"
    />
  )
}
