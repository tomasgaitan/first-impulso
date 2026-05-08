import { NavLink } from 'react-router-dom'
import { House, Users, Warning, ChartBar, Gear, SignOut } from '@phosphor-icons/react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/', icon: House, label: 'Inicio' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/morosos', icon: Warning, label: 'Morosos' },
  { to: '/ingresos', icon: ChartBar, label: 'Ingresos' },
  { to: '/configuracion', icon: Gear, label: 'Configuración' },
]

export function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="hidden md:flex flex-col w-60 bg-zinc-900 border-r border-zinc-800 min-h-screen fixed left-0 top-0 z-30">
      <div className="px-5 py-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
            <span className="text-zinc-950 font-black text-xs">FI</span>
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-100 tracking-tight">First Impulso</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-400/10 text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`
            }
          >
            <Icon size={18} weight="fill" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-800">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <SignOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
