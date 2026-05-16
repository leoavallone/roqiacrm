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
