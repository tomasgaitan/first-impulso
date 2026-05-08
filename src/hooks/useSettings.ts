import { useCallback, useEffect, useState } from 'react'
import type { Settings } from '../types'
import { getSettings, updateMonthlyPrice } from '../services/settings.service'

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSettings()
      setSettings(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const savePrice = async (price: number) => {
    if (!settings) return
    const updated = await updateMonthlyPrice(settings.id, price)
    setSettings(updated)
  }

  return { settings, loading, error, savePrice, reload: load }
}
