import { useCallback, useEffect, useState } from 'react'
import type { ClientWithStatus } from '../types'
import { getClients } from '../services/client.service'
import { clientPaidMonth } from '../services/payment.service'
import { getMorosoInfo, getCurrentMonthYear } from '../utils/moroso'
import { isBirthdayToday } from '../utils/age'

export function useClients() {
  const [clients, setClients] = useState<ClientWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const raw = await getClients()
      const { month, year } = getCurrentMonthYear()

      const enriched = await Promise.all(
        raw.map(async (client) => {
          if (client.status === 'inactive') {
            return { ...client, is_moroso: false, days_moroso: 0, paid_current_month: false }
          }
          const paid = await clientPaidMonth(client.id, month, year)
          const { isMoroso, daysMoroso } = getMorosoInfo(paid)
          return { ...client, is_moroso: isMoroso, days_moroso: daysMoroso, paid_current_month: paid }
        })
      )

      setClients(enriched)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const todayBirthdays = clients.filter(
    (c) => c.status === 'active' && isBirthdayToday(c.birth_date)
  )

  const morosos = clients.filter((c) => c.is_moroso)
  const activeCount = clients.filter((c) => c.status === 'active').length
  const paidCount = clients.filter((c) => c.paid_current_month).length

  return { clients, loading, error, reload: load, todayBirthdays, morosos, activeCount, paidCount }
}
