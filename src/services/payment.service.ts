import { supabase } from '../lib/supabase'
import type { Payment } from '../types'

export async function getPaymentsByClient(clientId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', clientId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
  if (error) throw error
  return data
}

export async function createPayment(payment: Omit<Payment, 'id' | 'paid_at' | 'client' | 'personal_plan'>): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPaymentsForMonth(month: number, year: number): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, client:clients(name)')
    .eq('month', month)
    .eq('year', year)
  if (error) throw error
  return data
}

export async function clientPaidMonth(clientId: string, month: number, year: number): Promise<boolean> {
  const { count, error } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('month', month)
    .eq('year', year)
    .eq('plan_type', 'monthly')
  if (error) throw error
  return (count ?? 0) > 0
}

export async function getMonthlyRevenueLast3(): Promise<{ month: number; year: number; total: number }[]> {
  const now = new Date()
  const months: { month: number; year: number }[] = []

  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ month: d.getMonth() + 1, year: d.getFullYear() })
  }

  const results = await Promise.all(
    months.map(async ({ month, year }) => {
      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('month', month)
        .eq('year', year)
      if (error) throw error
      const total = (data ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
      return { month, year, total }
    })
  )

  return results
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) throw error
}
