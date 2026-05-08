export function getMorosoInfo(paidCurrentMonth: boolean): {
  isMoroso: boolean
  daysMoroso: number
} {
  const today = new Date()
  const dayOfMonth = today.getDate()

  const CUTOFF_DAY = 10

  if (paidCurrentMonth || dayOfMonth <= CUTOFF_DAY) {
    return { isMoroso: false, daysMoroso: 0 }
  }

  return {
    isMoroso: true,
    daysMoroso: dayOfMonth - CUTOFF_DAY,
  }
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}
