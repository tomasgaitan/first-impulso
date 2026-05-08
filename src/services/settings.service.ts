import { supabase } from '../lib/supabase'
import type { Settings } from '../types'

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateMonthlyPrice(id: string, price: number): Promise<Settings> {
  const { data, error } = await supabase
    .from('settings')
    .update({ monthly_price: price, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
