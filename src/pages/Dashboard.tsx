import { motion } from 'framer-motion'
import { Users, Warning, CheckCircle, Cake, type Icon as PhosphorIcon } from '@phosphor-icons/react'
import { useClients } from '../hooks/useClients'
import { calculateAge } from '../utils/age'
import { Skeleton } from '../components/ui/Skeleton'
import { formatMonthYear, formatCurrency } from '../utils/format'
import { getCurrentMonthYear } from '../utils/moroso'
import { useSettings } from '../hooks/useSettings'

function StatCard({ icon: Icon, label, value, color }: {
  icon: PhosphorIcon
  label: string
  value: number | string
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} weight="fill" className="text-current" />
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-zinc-100 tracking-tight">{value}</p>
      </div>
    </motion.div>
  )
}

export function Dashboard() {
  const { clients, loading, activeCount, paidCount, morosos, todayBirthdays } = useClients()
  const { settings } = useSettings()
  const { month, year } = getCurrentMonthYear()

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">Inicio</h1>
        <p className="text-sm text-zinc-500">{formatMonthYear(month, year)}</p>
      </div>

      {todayBirthdays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-5 bg-amber-400/10 border border-amber-400/25 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Cake size={18} weight="fill" className="text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">
              {todayBirthdays.length === 1 ? 'Cumpleaños hoy' : `${todayBirthdays.length} cumpleaños hoy`}
            </span>
          </div>
          <div className="space-y-2">
            {todayBirthdays.map((client) => (
              <div key={client.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-bold text-xs">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{client.name}</p>
                  <p className="text-xs text-zinc-500">Cumple {calculateAge(client.birth_date)} años</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Users}
            label="Miembros activos"
            value={activeCount}
            color="bg-amber-400/10 text-amber-400"
          />
          <StatCard
            icon={CheckCircle}
            label="Pagaron este mes"
            value={paidCount}
            color="bg-emerald-500/10 text-emerald-400"
          />
          <StatCard
            icon={Warning}
            label="Morosos"
            value={morosos.length}
            color="bg-red-500/10 text-red-400"
          />
          <StatCard
            icon={Users}
            label="Total miembros"
            value={clients.length}
            color="bg-zinc-700/50 text-zinc-400"
          />
        </div>
      )}

      {settings && (
        <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 font-medium mb-1">Cuota mensual vigente</p>
          <p className="text-2xl font-bold text-amber-400 tracking-tight">
            {formatCurrency(settings.monthly_price)}
          </p>
        </div>
      )}
    </div>
  )
}
