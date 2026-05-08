import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Warning, WhatsappLogo } from '@phosphor-icons/react'
import { useClients } from '../hooks/useClients'
import { Skeleton } from '../components/ui/Skeleton'
import { formatPhoneForWhatsApp } from '../utils/format'

export function Morosos() {
  const navigate = useNavigate()
  const { morosos, loading } = useClients()

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Warning size={20} weight="fill" className="text-red-400" />
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Morosos</h1>
        </div>
        <p className="text-sm text-zinc-500">
          {morosos.length === 0
            ? 'Sin clientes con deuda'
            : `${morosos.length} cliente${morosos.length === 1 ? '' : 's'} sin pagar`}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : morosos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Warning size={28} className="text-emerald-400" weight="fill" />
          </div>
          <p className="text-zinc-400 font-medium">Todo al día</p>
          <p className="text-sm text-zinc-600 mt-1">Todos los clientes activos pagaron este mes</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {morosos
              .sort((a, b) => b.days_moroso - a.days_moroso)
              .map((client) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  onClick={() => navigate(`/clientes/${client.id}`)}
                  className="bg-zinc-900 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-red-500/40 active:scale-[0.99] transition-all"
                >
                  <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-400 font-bold text-sm">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{client.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">DNI {client.dni} · {client.phone}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-400 leading-none">{client.days_moroso}</p>
                      <p className="text-[10px] text-red-400/70 uppercase tracking-wider">
                        {client.days_moroso === 1 ? 'día' : 'días'}
                      </p>
                    </div>
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
              ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
