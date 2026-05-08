import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from '@phosphor-icons/react'
import { createClient } from '../services/client.service'
import { Input, Select } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const schema = z.object({
  name: z.string().min(2, 'Ingresá el nombre completo'),
  dni: z.string().min(7, 'DNI inválido').max(9, 'DNI inválido'),
  phone: z.string().min(8, 'Teléfono inválido'),
  birth_date: z.string().min(1, 'Ingresá la fecha de nacimiento'),
  join_date: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof schema>

export function ClientNew() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      const client = await createClient({
        name: values.name,
        dni: values.dni,
        phone: values.phone,
        birth_date: values.birth_date,
        join_date: values.join_date || null,
        status: values.status,
      })
      navigate(`/clientes/${client.id}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al crear cliente'
      if (msg.includes('unique') || msg.includes('duplicate')) {
        setError('Ya existe un cliente con ese DNI')
      } else {
        setError(msg)
      }
    }
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors mb-5 text-sm"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <h1 className="text-xl font-bold tracking-tight text-zinc-100 mb-6">Nuevo cliente</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nombre completo"
          placeholder="Juan Pérez"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="DNI"
            placeholder="12345678"
            error={errors.dni?.message}
            {...register('dni')}
          />
          <Input
            label="Teléfono"
            placeholder="1123456789"
            type="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <Input
          label="Fecha de nacimiento"
          type="date"
          error={errors.birth_date?.message}
          {...register('birth_date')}
        />

        <Input
          label="Fecha de ingreso (opcional)"
          type="date"
          error={errors.join_date?.message}
          {...register('join_date')}
        />

        <Select label="Estado" error={errors.status?.message} {...register('status')}>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </Select>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Crear cliente
        </Button>
      </form>
    </div>
  )
}
