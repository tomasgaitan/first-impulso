function parseDateLocal(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month, day }
}

export function calculateAge(birthDate: string): number {
  const today = new Date()
  const { year, month, day } = parseDateLocal(birthDate)
  let age = today.getFullYear() - year
  const monthDiff = today.getMonth() - (month - 1)
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--
  }
  return age
}

export function isBirthdayToday(birthDate: string): boolean {
  const today = new Date()
  const { month, day } = parseDateLocal(birthDate)
  return today.getMonth() === month - 1 && today.getDate() === day
}
