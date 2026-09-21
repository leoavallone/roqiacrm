import { CheckCircle2, CreditCard, Edit3, Save, Trash2, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { daysUntil, formatCurrency, formatDate, getNextMonthlyDueDate } from '../../core/date';
import type { Customer, CustomerServiceMode, SubscriptionStatus } from '../../core/types';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';

interface CustomersViewProps {
  customers: Customer[];
  readOnly?: boolean;
  onCreate: (customer: Omit<Customer, 'id'>) => Promise<void>;
  onUpdate: (customerId: string, customer: Omit<Customer, 'id'>) => Promise<void>;
  onDelete: (customerId: string) => Promise<void>;
}

const statusTone: Record<SubscriptionStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  Ativa: 'success',
  Inativo: 'neutral',
  Pendente: 'warning',
  Vencida: 'danger',
};

const emptyEditForm = {
  name: '',
  contact: '',
  email: '',
  contractDuration: '',
  monthlyValue: 0,
  dueDay: 0,
  nextDueDate: '',
  status: 'Ativa' as SubscriptionStatus,
  serviceMode: 'solo' as CustomerServiceMode,
};

export function CustomersView({ customers, readOnly = false, onCreate, onUpdate, onDelete }: CustomersViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    contractDuration: '',
    monthlyValue: 0,
    dueDay: 0,
    nextDueDate: '',
    status: 'Ativa' as SubscriptionStatus,
    serviceMode: 'solo' as CustomerServiceMode,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate(form);
    setForm((current) => ({ ...current, name: '', contact: '', email: '' }));
  }

  function startEditing(customer: Customer) {
    setEditingId(customer.id);
    setEditForm({
      name: customer.name,
      contact: customer.contact,
      email: customer.email,
      contractDuration: customer.contractDuration,
      monthlyValue: customer.monthlyValue,
      dueDay: customer.dueDay,
      nextDueDate: customer.nextDueDate,
      status: customer.status,
      serviceMode: customer.serviceMode,
    });
  }

  async function saveEditing(customerId: string) {
    await onUpdate(customerId, editForm);
    setEditingId(null);
  }

  async function markAsPaid(customer: Customer) {
    setMarkingPaidId(customer.id);

    try {
      await onUpdate(customer.id, {
        ...customer,
        nextDueDate: getNextMonthlyDueDate(customer.dueDay, customer.nextDueDate),
        status: 'Ativa',
      });
    } finally {
      setMarkingPaidId(null);
    }
  }

  return (
    <section className="view-grid">
      {!readOnly && (
        <div className="panel">
          <SectionHeader title="Cadastro de clientes" description="Registre clientes, contratos e vencimentos. Todos os campos são opcionais." />
          <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Nome da empresa
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <div className="form-row">
            <label>
              Contato
              <input
                value={form.contact}
                onChange={(event) => setForm({ ...form, contact: event.target.value })}
              />
            </label>
            <label>
              E-mail
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Tempo de contrato
              <input
                placeholder="Ex.: 12 meses ou Indeterminado"
                value={form.contractDuration}
                onChange={(event) => setForm({ ...form, contractDuration: event.target.value })}
              />
            </label>
            <label>
              Valor mensal
              <input
                min="0"
                step="10"
                type="number"
                value={form.monthlyValue || ''}
                onChange={(event) => setForm({ ...form, monthlyValue: Number(event.target.value) })}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Dia de vencimento
              <input
                min="1"
                max="31"
                type="number"
                value={form.dueDay || ''}
                onChange={(event) => setForm({ ...form, dueDay: Number(event.target.value) })}
              />
            </label>
            <label>
              Proximo vencimento
              <input
                type="date"
                value={form.nextDueDate}
                onChange={(event) => setForm({ ...form, nextDueDate: event.target.value })}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Situacao
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as SubscriptionStatus })}
              >
                <option>Ativa</option>
                <option>Inativo</option>
                <option>Pendente</option>
                <option>Vencida</option>
              </select>
            </label>
            <label>
              Atendimento
              <select
                value={form.serviceMode}
                onChange={(event) => setForm({ ...form, serviceMode: event.target.value as CustomerServiceMode })}
              >
                <option value="solo">Solo</option>
                <option value="partnership">Parceria</option>
              </select>
            </label>
          </div>
          <button className="primary-action" type="submit">
            <UserPlus size={18} aria-hidden="true" />
            Cadastrar cliente
          </button>
          </form>
        </div>
      )}

      <div className="panel">
        <SectionHeader title="Carteira de clientes" description="Visão rápida dos contratos e vencimentos." />
        <div className="record-list">
          {customers.map((customer) => {
            const remainingDays = customer.nextDueDate ? daysUntil(customer.nextDueDate) : null;
            return (
              <article className="record-card" key={customer.id}>
                <div className="record-card__icon">
                  <CreditCard size={20} aria-hidden="true" />
                </div>
                <div className="record-card__content">
                  {editingId === customer.id ? (
                    <div className="inline-edit">
                      <label>
                        Nome da empresa
                        <input
                          value={editForm.name}
                          onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                        />
                      </label>
                      <div className="form-row">
                        <label>
                          Contato
                          <input
                            value={editForm.contact}
                            onChange={(event) => setEditForm({ ...editForm, contact: event.target.value })}
                          />
                        </label>
                        <label>
                          E-mail
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(event) => setEditForm({ ...editForm, email: event.target.value })}
                          />
                        </label>
                      </div>
                      <div className="form-row">
                        <label>
                          Tempo de contrato
                          <input
                            placeholder="Ex.: 12 meses ou Indeterminado"
                            value={editForm.contractDuration}
                            onChange={(event) => setEditForm({ ...editForm, contractDuration: event.target.value })}
                          />
                        </label>
                        <label>
                          Valor mensal
                          <input
                            min="0"
                            step="10"
                            type="number"
                            value={editForm.monthlyValue || ''}
                            onChange={(event) => setEditForm({ ...editForm, monthlyValue: Number(event.target.value) })}
                          />
                        </label>
                      </div>
                      <div className="form-row">
                        <label>
                          Dia de vencimento
                          <input
                            min="1"
                            max="31"
                            type="number"
                            value={editForm.dueDay || ''}
                            onChange={(event) => setEditForm({ ...editForm, dueDay: Number(event.target.value) })}
                          />
                        </label>
                        <label>
                          Proximo vencimento
                          <input
                            type="date"
                            value={editForm.nextDueDate}
                            onChange={(event) => setEditForm({ ...editForm, nextDueDate: event.target.value })}
                          />
                        </label>
                      </div>
                      <div className="form-row">
                        <label>
                          Situacao
                          <select
                            value={editForm.status}
                            onChange={(event) => setEditForm({ ...editForm, status: event.target.value as SubscriptionStatus })}
                          >
                            <option>Ativa</option>
                            <option>Inativo</option>
                            <option>Pendente</option>
                            <option>Vencida</option>
                          </select>
                        </label>
                        <label>
                          Atendimento
                          <select
                            value={editForm.serviceMode}
                            onChange={(event) => setEditForm({ ...editForm, serviceMode: event.target.value as CustomerServiceMode })}
                          >
                            <option value="solo">Solo</option>
                            <option value="partnership">Parceria</option>
                          </select>
                        </label>
                      </div>
                      <div className="record-actions">
                        <button className="secondary-action" type="button" onClick={() => void saveEditing(customer.id)}>
                          <Save size={16} aria-hidden="true" />
                          Salvar
                        </button>
                        <button className="secondary-action" type="button" onClick={() => setEditingId(null)}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="record-card__header">
                        <div>
                          <h3>{customer.name || 'Cliente sem nome'}</h3>
                          <p>{[customer.contact, customer.email].filter(Boolean).join(' · ') || 'Contato não informado'}</p>
                        </div>
                        <StatusBadge label={customer.status} tone={statusTone[customer.status]} />
                      </div>
                      <div className="customer-plan">
                        <strong>{customer.contractDuration || 'Contrato não informado'}</strong>
                        <span>{formatCurrency(customer.monthlyValue)}</span>
                      </div>
                      <div className="record-meta">
                        <span>{customer.dueDay ? `Dia ${customer.dueDay}` : 'Dia não informado'}</span>
                        <span>{customer.serviceMode === 'partnership' ? 'Parceria' : 'Solo'}</span>
                        <span>{customer.nextDueDate ? formatDate(customer.nextDueDate) : 'Sem próximo vencimento'}</span>
                        {remainingDays !== null && (
                          <span>{remainingDays < 0 ? `${Math.abs(remainingDays)} dias atrasado` : `${remainingDays} dias`}</span>
                        )}
                      </div>
                      {!readOnly && (
                        <div className="record-actions record-actions--compact">
                          <button
                            className="secondary-action payment-action"
                            disabled={markingPaidId === customer.id}
                            type="button"
                            onClick={() => void markAsPaid(customer)}
                          >
                            <CheckCircle2 size={16} aria-hidden="true" />
                            {markingPaidId === customer.id ? 'Atualizando...' : 'Marcar como pago'}
                          </button>
                          <button className="secondary-action" type="button" onClick={() => startEditing(customer)}>
                            <Edit3 size={16} aria-hidden="true" />
                            Editar
                          </button>
                          <button className="secondary-action" type="button" onClick={() => void onDelete(customer.id)}>
                            <Trash2 size={16} aria-hidden="true" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
