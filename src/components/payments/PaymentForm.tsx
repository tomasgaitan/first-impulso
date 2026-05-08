import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createPayment } from '../../services/payment.service'
import { useSettings } from '../../hooks/useSettings'
import { Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { getCurrentMonthYear } from '../../utils/moroso'
import type { PersonalPlan } from '../../types'

const MONTHS = [
  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
]

const schema = z.object({
  mode: z.enum(['monthly', 'both']),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  plan_amount: z.number().optional(),
  payment_method: z.enum(['cash', 'transfer']),
  notes: z.string().optional(),
}).refine(
  (d) => d.mode === 'monthly' || (d.plan_amount !== undefined && d.plan_amount > 0),
  { message: 'Ingresá el monto del plan', path: ['plan_amount'] }
)

type FormValues = z.infer<typeof schema>

interface PaymentFormProps {
  clientId: string
  activePlan: PersonalPlan | null
  onSuccess: () => void
}

export function PaymentForm({ clientId, activePlan, onSuccess }: PaymentFormProps) {
  const { settings } = useSettings()
  const { month, year } = getCurrentMonthYear()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: 'monthly',
      month,
      year,
      plan_amount: activePlan?.price ?? 0,
      payment_method: 'cash',
    },
  })

  const mode = watch('mode')

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await createPayment({
        client_id: clientId,
        plan_type: 'monthly',
        personal_plan_id: null,
        month: values.month,
        year: values.year,
        amount: settings?.monthly_price ?? 0,
        payment_method: values.payment_method,
        notes: values.notes ?? null,
      })

      if (values.mode === 'both' && activePlan && values.plan_amount) {
        await createPayment({
          client_id: clientId,
          plan_type: 'personal',
          personal_plan_id: activePlan.id,
          month: values.month,
          year: values.year,
          amount: values.plan_amount,
          payment_method: values.payment_method,
          notes: values.notes ?? null,
        })
      }

      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrar pago')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Selector de modo */}
      <div>
        <p className="text-sm font-medium text-zinc-300 mb-2">¿Qué cobrás?</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'monthly', label: 'Cuota' },
            { value: 'both', label: 'Cuota + Plan', disabled: !activePlan },
          ].map(({ value, label, disabled }) => (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => setValue('mode', value as 'monthly' | 'both')}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                mode === value
                  ? 'bg-amber-400 text-zinc-950 border-amber-400'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {!activePlan && (
          <p className="text-xs text-zinc-600 mt-1.5">Sin plan activo asignado</p>
        )}
      </div>

      {/* Mes y año */}
      <div className="grid grid-cols-2 gap-3">
        <Select label="Mes" error={errors.month?.message} {...register('month', { valueAsNumber: true })}>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </Select>
        <Input
          label="Año"
          type="number"
          error={errors.year?.message}
          {...register('year', { valueAsNumber: true })}
        />
      </div>

      {/* Monto cuota — solo lectura, tomado de configuración */}
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-zinc-300">Monto cuota</p>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <span className="text-zinc-400 text-sm">Cuota vigente</span>
          <span className="text-amber-400 font-semibold text-sm">
            ${settings?.monthly_price ?? '—'}
          </span>
        </div>
      </div>

      {/* Monto plan (solo si mode === 'both') */}
      {mode === 'both' && (
        <Input
          label="Monto plan personalizado ($)"
          type="number"
          step="0.01"
          error={errors.plan_amount?.message}
          helper={activePlan ? `Precio del plan: $${activePlan.price}` : undefined}
          {...register('plan_amount', { valueAsNumber: true })}
        />
      )}

      {/* Método de pago */}
      <Select label="Método de pago" error={errors.payment_method?.message} {...register('payment_method')}>
        <option value="cash">Efectivo</option>
        <option value="transfer">Transferencia</option>
      </Select>

      <Input
        label="Notas (opcional)"
        placeholder="Ej: pago de deuda diciembre"
        {...register('notes')}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Registrar pago
      </Button>
    </form>
  )
}
