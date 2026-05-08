import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createPersonalPlan } from '../../services/personal-plan.service'
import { Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'

const schema = z.object({
  days_per_week: z.number().min(1).max(7),
  objective: z.string().min(2, 'Ingresá el objetivo'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  start_date: z.string().min(1, 'Ingresá la fecha de inicio'),
  end_date: z.string().min(1, 'Ingresá la fecha de fin'),
}).refine((d) => new Date(d.end_date) > new Date(d.start_date), {
  message: 'La fecha de fin debe ser posterior al inicio',
  path: ['end_date'],
})

type FormValues = z.infer<typeof schema>

interface PersonalPlanFormProps {
  clientId: string
  onSuccess: () => void
}

export function PersonalPlanForm({ clientId, onSuccess }: PersonalPlanFormProps) {
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { days_per_week: 3 },
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await createPersonalPlan({
        client_id: clientId,
        days_per_week: values.days_per_week,
        objective: values.objective,
        price: values.price,
        start_date: values.start_date,
        end_date: values.end_date,
        status: 'active',
      })
      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear plan')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Objetivo"
        placeholder="Ej: Pérdida de peso, ganancia muscular..."
        error={errors.objective?.message}
        {...register('objective')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Días / semana" error={errors.days_per_week?.message} {...register('days_per_week', { valueAsNumber: true })}>
          {[1,2,3,4,5,6,7].map((d) => (
            <option key={d} value={d}>{d} {d === 1 ? 'día' : 'días'}</option>
          ))}
        </Select>
        <Input
          label="Precio ($)"
          type="number"
          step="0.01"
          error={errors.price?.message}
          {...register('price', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Inicio"
          type="date"
          error={errors.start_date?.message}
          {...register('start_date')}
        />
        <Input
          label="Fin"
          type="date"
          error={errors.end_date?.message}
          {...register('end_date')}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Crear plan
      </Button>
    </form>
  )
}
