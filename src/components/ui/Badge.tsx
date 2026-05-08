interface BadgeProps {
  variant: 'moroso' | 'active' | 'inactive' | 'gold' | 'neutral'
  children: React.ReactNode
}

const variants = {
  moroso: 'bg-red-500/15 text-red-400 border border-red-500/30',
  active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  inactive: 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30',
  gold: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  neutral: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium tracking-wide ${variants[variant]}`}>
      {children}
    </span>
  )
}
