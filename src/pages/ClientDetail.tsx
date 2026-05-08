import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, WhatsappLogo, Warning, PencilSimple, Plus,
  CalendarBlank, CurrencyCircleDollar, Barbell
} from '@phosphor-icons/react'
import type { Client, Payment, PersonalPlan } from '../types'
import { getClientById, updateClientStatus } from '../services/client.service'
import { getPaymentsByClient, deletePayment } from '../services/payment.service'
import { getActivePlanByClient, getPlanHistoryByClient, updatePlanStatus } from '../services/personal-plan.service'
import { clientPaidMonth } from '../services/payment.service'
import { getMorosoInfo, getCurrentMonthYear } from '../utils/moroso'
import { calculateAge } from '../utils/age'
import { formatCurrency, formatMonthYear, formatDate, formatPhoneForWhatsApp } from '../utils/format'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { PaymentForm } from '../components/payments/PaymentForm'
import { PersonalPlanForm } from '../components/plans/PersonalPlanForm'

export function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [client, setClient] = useState<Client | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [activePlan, setActivePlan] = useState<PersonalPlan | null>(null)
  const [planHistory, setPlanHistory] = useState<PersonalPlan[]>([])
  const [isMoroso, setIsMoroso] = useState(false)
  const [daysMoroso, setDaysMoroso] = useState(0)
  const [loading, setLoading] = useState(true)

  const [paymentModal, setPaymentModal] = useState(false)
  const [planModal, setPlanModal] = useState(false)

  const load = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [c, p, plan, history] = await Promise.all([
        getClientById(id),
        getPaymentsByClient(id),
        getActivePlanByClient(id),
        getPlanHistoryByClient(id),
      ])
      setClient(c)
      setPayments(p)
      setActivePlan(plan)
      setPlanHistory(history)

      if (c.status === 'active') {
        const { month, year } = getCurrentMonthYear()
        const paid = await clientPaidMonth(id, month, year)
        const { isMoroso: m, daysMoroso: d } = getMorosoInfo(paid)
        setIsMoroso(m)
        setDaysMoroso(d)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const toggleStatus = async () => {
    if (!client) return
    const next = client.status === 'active' ? 'inactive' : 'active'
    await updateClientStatus(client.id, next)
    setClient({ ...client, status: next })
  }

  const handleDeletePayment = async (paymentId: string) => {
    await deletePayment(paymentId)
    setPayments(payments.filter((p) => p.id !== paymentId))
  }

  const handleDeactivatePlan = async (planId: string) => {
    await updatePlanStatus(planId, 'inactive')
    await load()
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors mb-5 text-sm"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      {/* Header del cliente */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
              <span className="text-zinc-300 font-bold text-xl">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-100 tracking-tight">{client.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {isMoroso ? (
                  <Badge variant="moroso">
                    <Warning size={11} weight="fill" />
                    Deudor · {daysMoroso} {daysMoroso === 1 ? 'día' : 'días'}
                  </Badge>
                ) : client.status === 'inactive' ? (
                  <Badge variant="inactive">Inactivo</Badge>
                ) : (
                  <Badge variant="active">Al día</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.open(`https://wa.me/${formatPhoneForWhatsApp(client.phone)}`, '_blank')}
              className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <WhatsappLogo size={18} weight="fill" />
            </button>
            <button
              onClick={() => navigate(`/clientes/${id}/editar`)}
              className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              <PencilSimple size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-500 text-xs mb-0.5">DNI</p>
            <p className="text-zinc-200 font-medium">{client.dni}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-0.5">Teléfono</p>
            <p className="text-zinc-200 font-medium">{client.phone}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-0.5">Edad</p>
            <p className="text-zinc-200 font-medium">{calculateAge(client.birth_date)} años</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-0.5">Miembro desde</p>
            <p className="text-zinc-200 font-medium">
              {client.join_date ? formatDate(client.join_date) : 'No especificado'}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
          <Button
            variant={client.status === 'active' ? 'danger' : 'secondary'}
            size="sm"
            onClick={toggleStatus}
          >
            {client.status === 'active' ? 'Dar de baja' : 'Reactivar'}
          </Button>
        </div>
      </motion.div>

      {/* Plan personalizado */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Barbell size={16} className="text-amber-400" weight="fill" />
            <h2 className="text-sm font-semibold text-zinc-300">Plan personalizado</h2>
          </div>
          {!activePlan && (
            <Button variant="ghost" size="sm" onClick={() => setPlanModal(true)}>
              <Plus size={14} />
              Asignar
            </Button>
          )}
        </div>

        {activePlan ? (
          <div className="bg-zinc-900 border border-amber-400/20 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="grid grid-cols-2 gap-3 text-sm flex-1">
                <div>
                  <p className="text-zinc-500 text-xs mb-0.5">Objetivo</p>
                  <p className="text-zinc-200">{activePlan.objective}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-0.5">Días/semana</p>
                  <p className="text-zinc-200">{activePlan.days_per_week}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-0.5">Precio</p>
                  <p className="text-amber-400 font-semibold">{formatCurrency(activePlan.price)}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-0.5">Vigencia</p>
                  <p className="text-zinc-200 text-xs">
                    {formatDate(activePlan.start_date)} – {formatDate(activePlan.end_date)}
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                className="ml-3"
                onClick={() => handleDeactivatePlan(activePlan.id)}
              >
                Dar de baja
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-sm text-zinc-600">Sin plan personalizado activo</p>
          </div>
        )}

        {planHistory.filter((p) => p.status === 'inactive').length > 0 && (
          <details className="mt-2">
            <summary className="text-xs text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors px-1">
              Ver historial de planes ({planHistory.filter(p => p.status === 'inactive').length})
            </summary>
            <div className="mt-2 space-y-2">
              {planHistory.filter(p => p.status === 'inactive').map((plan) => (
                <div key={plan.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-400">{plan.objective}</span>
                  {' — '}{plan.days_per_week}d/sem · {formatCurrency(plan.price)}
                  <span className="block mt-0.5">{formatDate(plan.start_date)} – {formatDate(plan.end_date)}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Historial de pagos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CurrencyCircleDollar size={16} className="text-amber-400" weight="fill" />
            <h2 className="text-sm font-semibold text-zinc-300">Pagos</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setPaymentModal(true)}>
            <Plus size={14} />
            Registrar
          </Button>
        </div>

        {payments.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <CalendarBlank size={28} className="text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-600">Sin pagos registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {formatMonthYear(payment.month, payment.year)}
                    {payment.plan_type === 'personal' && (
                      <span className="ml-2 text-xs text-amber-400 font-normal">Personalizado</span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {payment.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}
                    {payment.notes && ` · ${payment.notes}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-emerald-400">
                    {formatCurrency(payment.amount)}
                  </span>
                  <button
                    onClick={() => handleDeletePayment(payment.id)}
                    className="text-zinc-700 hover:text-red-400 transition-colors text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title="Registrar pago">
        <PaymentForm
          clientId={client.id}
          activePlan={activePlan}
          onSuccess={() => { setPaymentModal(false); load() }}
        />
      </Modal>

      <Modal open={planModal} onClose={() => setPlanModal(false)} title="Asignar plan personalizado">
        <PersonalPlanForm
          clientId={client.id}
          onSuccess={() => { setPlanModal(false); load() }}
        />
      </Modal>
    </div>
  )
}
