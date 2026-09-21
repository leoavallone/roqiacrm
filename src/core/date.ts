export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function todayAsInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(date: string): number {
  const today = new Date(todayAsInputValue());
  const target = new Date(`${date}T00:00:00`);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / 86_400_000);
}

export function getNextMonthlyDueDate(dueDay: number, currentDueDate?: string): string {
  const today = todayAsInputValue();
  const baseDate = currentDueDate && currentDueDate > today ? currentDueDate : today;
  const [baseYear, baseMonth, baseDay] = baseDate.split('-').map(Number);
  const targetMonthStart = new Date(Date.UTC(baseYear, baseMonth, 1));
  const targetYear = targetMonthStart.getUTCFullYear();
  const targetMonth = targetMonthStart.getUTCMonth();
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const preferredDay = dueDay >= 1 && dueDay <= 31 ? dueDay : baseDay;
  const targetDay = Math.min(preferredDay, lastDayOfTargetMonth);

  return [
    targetYear,
    String(targetMonth + 1).padStart(2, '0'),
    String(targetDay).padStart(2, '0'),
  ].join('-');
}
