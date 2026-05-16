import { CreditCard } from 'lucide-react';
import { SectionHeader } from '../../components/SectionHeader';
import { daysUntil, formatCurrency, formatDate } from '../../core/date';
import type { Customer } from '../../core/types';

interface FinanceViewProps {
  customers: Customer[];
}

export function FinanceView({ customers }: FinanceViewProps) {
  const monthlyRevenue = customers.reduce((sum, customer) => sum + customer.monthlyValue, 0);
  const pendingCustomers = customers.filter((customer) => customer.status !== 'Ativa').length;

  return (
    <section className="view-grid">
      <div className="panel">
        <SectionHeader title="Financeiro" description="Visao de receita, vencimentos e assinaturas." />
        <div className="metrics metrics--inside">
          <article className="metric">
            <span>Receita mensal</span>
            <strong>{formatCurrency(monthlyRevenue)}</strong>
          </article>
          <article className="metric">
            <span>Clientes com pendencia</span>
            <strong>{pendingCustomers}</strong>
          </article>
        </div>
      </div>

      <div className="panel">
        <SectionHeader title="Assinaturas" description="Acompanhe valores e vencimentos por cliente." />
        <div className="record-list">
          {customers.map((customer) => {
            const remainingDays = daysUntil(customer.nextDueDate);
            return (
              <article className="record-card" key={customer.id}>
                <div className="record-card__icon">
                  <CreditCard size={20} aria-hidden="true" />
                </div>
                <div className="record-card__content">
                  <div className="record-card__header">
                    <div>
                      <h3>{customer.name}</h3>
                      <p>{customer.plan}</p>
                    </div>
                    <strong>{formatCurrency(customer.monthlyValue)}</strong>
                  </div>
                  <div className="record-meta">
                    <span>{customer.status}</span>
                    <span>Vence em {formatDate(customer.nextDueDate)}</span>
                    <span>{remainingDays < 0 ? `${Math.abs(remainingDays)} dias atrasado` : `${remainingDays} dias`}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
