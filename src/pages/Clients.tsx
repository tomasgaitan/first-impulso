import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, Plus, WhatsappLogo, Warning } from '@phosphor-icons/react'
import { useClients } from '../hooks/useClients'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ClientCardSkeleton } from '../components/ui/Skeleton'
import { calculateAge } from '../utils/age'
import { formatPhoneForWhatsApp } from '../utils/format'
import type { ClientWithStatus } from '../types'

function ClientRow({ client }: { client: ClientWithStatus }) {
  const navigate = useNavigate()
  const initial = client.name.charAt(0).toUpperCase()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      onClick={() => navigate(`/clientes/${client.id}`)}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-zinc-700 active:scale-[0.99] transition-all"
    >
      <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
        <span className="text-zinc-300 font-bold text-sm">{initial}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-100 truncate">{client.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-zinc-500">DNI {client.dni}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-500">{calculateAge(client.birth_date)} años</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {client.is_moroso && (
          <Badge variant="moroso">
            <Warning size={11} weight="fill" />
            {client.days_moroso} {client.days_moroso === 1 ? 'día' : 'días'}
          </Badge>
        )}
        {client.status === 'inactive' && <Badge variant="inactive">Inactivo</Badge>}
        {client.status === 'active' && !client.is_moroso && (
          <Badge variant="active">Al día</Badge>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            window.open(`https://wa.me/${formatPhoneForWhatsApp(client.phone)}`, '_blank')
          }}
          className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors"
        >
          <WhatsappLogo size={16} weight="fill" />
        </button>
      </div>
    </motion.div>
  )
}

type FilterType = 'all' | 'active' | 'inactive' | 'morosos'

export function Clients() {
  const navigate = useNavigate()
  const { clients, loading, error, morosos } = useClients()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dni.includes(search) ||
      c.phone.includes(search)

    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && c.status === 'active' && !c.is_moroso) ||
      (filter === 'inactive' && c.status === 'inactive') ||
      (filter === 'morosos' && c.is_moroso)

    return matchesSearch && matchesFilter
  })

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'active', label: 'Al día' },
    { key: 'morosos', label: `Morosos ${morosos.length > 0 ? `(${morosos.length})` : ''}` },
    { key: 'inactive', label: 'Inactivos' },
  ]

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Clientes</h1>
          <p className="text-sm text-zinc-500">{clients.length} registrados</p>
        </div>
        <Button onClick={() => navigate('/clientes/nuevo')} size="sm">
          <Plus size={15} weight="bold" />
          Nuevo
        </Button>
      </div>

      <div className="relative mb-4">
        <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre, DNI o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-colors"
        />
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              filter === key
                ? 'bg-amber-400 text-zinc-950'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <ClientCardSkeleton key={i} />)}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-zinc-600 text-sm">Sin resultados</p>
              </motion.div>
            ) : (
              filtered.map((client) => <ClientRow key={client.id} client={client} />)
            )}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
