import { supabase } from '../lib/supabase'
import type { PersonalPlan, PlanStatus } from '../types'

export async function getActivePlanByClient(clientId: string): Promise<PersonalPlan | null> {
  const { data, error } = await supabase
    .from('personal_plans')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getPlanHistoryByClient(clientId: string): Promise<PersonalPlan[]> {
  const { data, error } = await supabase
    .from('personal_plans')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createPersonalPlan(plan: Omit<PersonalPlan, 'id' | 'created_at' | 'client'>): Promise<PersonalPlan> {
  const { data, error } = await supabase
    .from('personal_plans')
    .insert(plan)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePlanStatus(id: string, status: PlanStatus): Promise<void> {
  const { error } = await supabase
    .from('personal_plans')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}
