import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Barbell, LockSimple, EnvelopeSimple } from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const { signIn } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginForm) => {
    setServerError(null)
    try {
      await signIn(values.email, values.password)
    } catch {
      setServerError('Email o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 mb-5">
            <Barbell size={28} weight="fill" className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">First Impulso</h1>
          <p className="text-sm text-zinc-500 mt-1">Panel de administración</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                label="Email"
                type="email"
                placeholder="admin@firstimpulso.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <EnvelopeSimple
                size={16}
                className="absolute right-3.5 top-9 text-zinc-500 pointer-events-none"
              />
            </div>

            <div className="relative">
              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <LockSimple
                size={16}
                className="absolute right-3.5 top-9 text-zinc-500 pointer-events-none"
              />
            </div>

            {serverError && (
              <p className="text-sm text-red-400 text-center">{serverError}</p>
            )}

            <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
