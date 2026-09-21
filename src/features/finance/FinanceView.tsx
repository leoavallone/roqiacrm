import { ArrowDownCircle, ArrowUpCircle, Trash2, WalletCards } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { SectionHeader } from '../../components/SectionHeader';
import { formatCurrency, formatDate, todayAsInputValue } from '../../core/date';
import type { FinanceTransaction, FinanceTransactionType } from '../../core/types';

interface FinanceViewProps {
  transactions: FinanceTransaction[];
  onCreate: (transaction: Omit<FinanceTransaction, 'id'>) => Promise<void>;
  onDelete: (transactionId: string) => Promise<void>;
}

const emptyForm = {
  type: 'Entrada' as FinanceTransactionType,
  description: '',
  value: 0,
  date: todayAsInputValue(),
};

export function FinanceView({ transactions, onCreate, onDelete }: FinanceViewProps) {
  const [form, setForm] = useState(emptyForm);
  const totals = useMemo(() => {
    const entries = transactions
      .filter((transaction) => transaction.type === 'Entrada')
      .reduce((sum, transaction) => sum + transaction.value, 0);
    const exits = transactions
      .filter((transaction) => transaction.type === 'Saida')
      .reduce((sum, transaction) => sum + transaction.value, 0);

    return { entries, exits, balance: entries - exits };
  }, [transactions]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate(form);
    setForm((current) => ({ ...emptyForm, type: current.type, date: todayAsInputValue() }));
  }

  return (
    <section className="view-grid">
      <div className="panel">
        <SectionHeader title="Novo lançamento" description="Registre uma entrada ou uma saída financeira." />
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Tipo
              <select
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value as FinanceTransactionType })}
              >
                <option value="Entrada">Entrada</option>
                <option value="Saida">Saída</option>
              </select>
            </label>
            <label>
              Data
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </label>
          </div>
          <label>
            Descrição
            <input
              required
              placeholder="Ex.: Mensalidade ou serviço contratado"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <label>
            Valor
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={form.value || ''}
              onChange={(event) => setForm({ ...form, value: Number(event.target.value) })}
            />
          </label>
          <button className="primary-action" type="submit">
            <WalletCards size={18} aria-hidden="true" />
            Adicionar lançamento
          </button>
        </form>
      </div>

      <div className="panel">
        <SectionHeader title="Financeiro" description="Acompanhe entradas, saídas e saldo dos lançamentos." />
        <div className="metrics metrics--inside finance-metrics">
          <article className="metric metric--entry">
            <span>Entradas</span>
            <strong>{formatCurrency(totals.entries)}</strong>
          </article>
          <article className="metric metric--exit">
            <span>Saídas</span>
            <strong>{formatCurrency(totals.exits)}</strong>
          </article>
          <article className="metric">
            <span>Saldo</span>
            <strong>{formatCurrency(totals.balance)}</strong>
          </article>
        </div>

        <div className="record-list finance-list">
          {transactions.length === 0 && <p className="empty-state">Nenhum lançamento cadastrado.</p>}
          {transactions.map((transaction) => {
            const isEntry = transaction.type === 'Entrada';
            const Icon = isEntry ? ArrowUpCircle : ArrowDownCircle;

            return (
              <article className="record-card" key={transaction.id}>
                <div className={`record-card__icon finance-icon finance-icon--${isEntry ? 'entry' : 'exit'}`}>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <div className="record-card__content">
                  <div className="record-card__header">
                    <div>
                      <h3>{transaction.description}</h3>
                      <p>{formatDate(transaction.date)}</p>
                    </div>
                    <strong className={isEntry ? 'finance-value--entry' : 'finance-value--exit'}>
                      {isEntry ? '+' : '-'} {formatCurrency(transaction.value)}
                    </strong>
                  </div>
                  <div className="record-actions record-actions--compact">
                    <span className={`status-badge status-badge--${isEntry ? 'success' : 'danger'}`}>
                      {isEntry ? 'Entrada' : 'Saída'}
                    </span>
                    <button className="secondary-action" type="button" onClick={() => void onDelete(transaction.id)}>
                      <Trash2 size={16} aria-hidden="true" />
                      Excluir
                    </button>
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
