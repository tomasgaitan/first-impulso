import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Gear, CheckCircle } from '@phosphor-icons/react'
import { useSettings } from '../hooks/useSettings'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { formatCurrency } from '../utils/format'

const schema = z.object({
  monthly_price: z.number({ message: 'El precio no puede ser negativo' }).min(0),
})

type FormValues = z.infer<typeof schema>

export function Settings() {
  const { settings, loading, savePrice } = useSettings()
  const { signOut, user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { monthly_price: settings?.monthly_price ?? 0 },
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await savePrice(values.monthly_price)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    }
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Gear size={20} weight="fill" className="text-zinc-500" />
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">Configuración</h1>
      </div>

      <div className="space-y-4">
        {/* Precio mensual */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-1">Cuota mensual</h2>
          <p className="text-xs text-zinc-600 mb-4">
            Este precio se usa como referencia al registrar pagos. Los cambios aplican a partir del próximo cobro.
          </p>

          {loading ? (
            <Skeleton className="h-20" />
          ) : (
            <>
              {settings && (
                <div className="mb-4">
                  <p className="text-xs text-zinc-600 mb-0.5">Precio vigente</p>
                  <p className="text-2xl font-bold text-amber-400">{formatCurrency(settings.monthly_price)}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Nuevo precio ($)"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  error={errors.monthly_price?.message}
                  {...register('monthly_price', { valueAsNumber: true })}
                />

                {error && <p className="text-sm text-red-400">{error}</p>}

                <Button type="submit" className="w-full" loading={isSubmitting}>
                  {saved ? (
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle size={16} weight="fill" />
                      Guardado
                    </motion.span>
                  ) : (
                    'Guardar precio'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Cuenta */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-1">Cuenta</h2>
          <p className="text-xs text-zinc-600 mb-4">{user?.email}</p>
          <Button variant="danger" onClick={signOut} className="w-full">
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
