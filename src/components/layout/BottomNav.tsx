import { NavLink } from 'react-router-dom'
import { House, Users, Warning, ChartBar, Gear } from '@phosphor-icons/react'

const navItems = [
  { to: '/', icon: House, label: 'Inicio' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/morosos', icon: Warning, label: 'Morosos' },
  { to: '/ingresos', icon: ChartBar, label: 'Ingresos' },
  { to: '/configuracion', icon: Gear, label: 'Config' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
                isActive ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            <Icon size={22} weight="fill" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
