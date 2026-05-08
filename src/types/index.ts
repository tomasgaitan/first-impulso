export type ClientStatus = 'active' | 'inactive'
export type PaymentMethod = 'cash' | 'transfer'
export type PlanType = 'monthly' | 'personal'
export type PlanStatus = 'active' | 'inactive'

export interface Client {
  id: string
  name: string
  dni: string
  phone: string
  join_date: string | null
  birth_date: string
  status: ClientStatus
  created_at: string
}

export interface PersonalPlan {
  id: string
  client_id: string
  days_per_week: number
  objective: string
  price: number
  start_date: string
  end_date: string
  status: PlanStatus
  created_at: string
  client?: Client
}

export interface Payment {
  id: string
  client_id: string
  plan_type: PlanType
  personal_plan_id: string | null
  month: number
  year: number
  amount: number
  payment_method: PaymentMethod
  paid_at: string
  notes: string | null
  client?: Client
  personal_plan?: PersonalPlan
}

export interface Settings {
  id: string
  monthly_price: number
  updated_at: string
}

export interface ClientWithStatus extends Client {
  is_moroso: boolean
  days_moroso: number
  paid_current_month: boolean
}

export interface MonthlyRevenue {
  month: number
  year: number
  total: number
  label: string
}
