import { cn } from '@/lib/utils'

interface NexusDialLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-7',
  md: 'h-9',
  lg: 'h-12',
}

export function NexusDialLogo({ className, size = 'md' }: NexusDialLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="NexusDial"
      className={cn(sizes[size], 'w-auto object-contain select-none', className)}
      draggable={false}
    />
  )
}
