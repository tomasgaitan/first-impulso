import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from '@phosphor-icons/react'
import { getClientById, updateClient } from '../services/client.service'
import { Input, Select } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import type { Client } from '../types'

const schema = z.object({
  name: z.string().min(2, 'Ingresá el nombre completo'),
  dni: z.string().min(7, 'DNI inválido').max(9, 'DNI inválido'),
  phone: z.string().min(8, 'Teléfono inválido'),
  birth_date: z.string().min(1, 'Ingresá la fecha de nacimiento'),
  join_date: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type FormValues = z.infer<typeof schema>

export function ClientEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!id) return
    getClientById(id)
      .then((c) => {
        setClient(c)
        reset({
          name: c.name,
          dni: c.dni,
          phone: c.phone,
          birth_date: c.birth_date,
          join_date: c.join_date ?? '',
          status: c.status,
        })
      })
      .finally(() => setLoading(false))
  }, [id, reset])

  const onSubmit = async (values: FormValues) => {
    if (!id) return
    setError(null)
    try {
      await updateClient(id, {
        name: values.name,
        dni: values.dni,
        phone: values.phone,
        birth_date: values.birth_date,
        join_date: values.join_date || null,
        status: values.status,
      })
      navigate(`/clientes/${id}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al actualizar'
      if (msg.includes('unique') || msg.includes('duplicate')) {
        setError('Ya existe otro cliente con ese DNI')
      } else {
        setError(msg)
      }
    }
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors mb-5 text-sm"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <h1 className="text-xl font-bold tracking-tight text-zinc-100 mb-6">Editar cliente</h1>

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
          Guardar cambios
        </Button>
      </form>
    </div>
  )
}
