import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}
import { TrendUp, TrendDown } from '@phosphor-icons/react'
import { getMonthlyRevenueLast3, getPaymentsForMonth } from '../services/payment.service'
import { formatCurrency, formatMonthYear, getMonthLabel } from '../utils/format'
import { getCurrentMonthYear } from '../utils/moroso'
import { Skeleton } from '../components/ui/Skeleton'
import type { Payment } from '../types'

interface MonthData {
  month: number
  year: number
  total: number
  label: string
}

export function Ingresos() {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([])
  const [currentPayments, setCurrentPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { month, year } = getCurrentMonthYear()
      const [revenue, payments] = await Promise.all([
        getMonthlyRevenueLast3(),
        getPaymentsForMonth(month, year),
      ])
      const labeled = revenue.map((r) => ({
        ...r,
        label: getMonthLabel(r.month).slice(0, 3),
      }))
      setMonthlyData(labeled)
      setCurrentPayments(payments)
      setLoading(false)
    }
    load()
  }, [])

  const { month, year } = getCurrentMonthYear()
  const currentTotal = monthlyData.find((m) => m.month === month && m.year === year)?.total ?? 0
  const prevTotal = monthlyData[monthlyData.length - 2]?.total ?? 0
  const diff = currentTotal - prevTotal
  const diffPct = prevTotal > 0 ? ((diff / prevTotal) * 100).toFixed(1) : null

  const customTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload?.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm">
          <p className="text-zinc-400">{label}</p>
          <p className="text-amber-400 font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">Ingresos</h1>
        <p className="text-sm text-zinc-500">{formatMonthYear(month, year)}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Total del mes actual */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4"
          >
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">Total este mes</p>
            <p className="text-4xl font-bold text-amber-400 tracking-tight">{formatCurrency(currentTotal)}</p>
            {diffPct !== null && (
              <div className={`flex items-center gap-1.5 mt-2 text-sm ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {diff >= 0
                  ? <TrendUp size={16} weight="bold" />
                  : <TrendDown size={16} weight="bold" />
                }
                <span className="font-medium">
                  {diff >= 0 ? '+' : ''}{diffPct}% vs mes anterior
                </span>
              </div>
            )}
          </motion.div>

          {/* Gráfico */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4"
          >
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-4">Últimos 3 meses</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={40}
                />
                <Tooltip content={customTooltip as never} cursor={{ fill: '#27272a' }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((entry) => (
                    <Cell
                      key={`${entry.month}-${entry.year}`}
                      fill={entry.month === month && entry.year === year ? '#f59e0b' : '#3f3f46'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Números por mes */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {monthlyData.map((m) => (
                <div
                  key={`${m.month}-${m.year}`}
                  className={`rounded-xl p-3 text-center ${
                    m.month === month && m.year === year
                      ? 'bg-amber-400/10 border border-amber-400/20'
                      : 'bg-zinc-800/50'
                  }`}
                >
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{m.label}</p>
                  <p className={`text-sm font-bold mt-1 ${m.month === month && m.year === year ? 'text-amber-400' : 'text-zinc-300'}`}>
                    {formatCurrency(m.total)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Detalle de pagos del mes */}
          <div>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3">
              Pagos del mes ({currentPayments.length})
            </p>
            {currentPayments.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
                <p className="text-sm text-zinc-600">Sin pagos registrados este mes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {(payment.client as { name: string } | undefined)?.name ?? 'Cliente'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {payment.plan_type === 'monthly' ? 'Cuota mensual' : 'Plan personalizado'}
                        {' · '}
                        {payment.payment_method === 'cash' ? 'Efectivo' : 'Transferencia'}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
