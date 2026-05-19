import { ArrowLeft, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { Creator, Customer, Ticket, TicketPriority } from '../../core/types';
import roqiaSymbol from '../../../favicon.png';

interface TicketPortalViewProps {
  customers: Customer[];
  currentUser: Creator;
  onBack: () => void;
  onCreate: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'number' | 'history' | 'createdBy'>, creator: Creator) => Promise<void>;
}

export function TicketPortalView({ customers, currentUser, onBack, onCreate }: TicketPortalViewProps) {
  const canChooseCustomer = currentUser.role === 'superAdmin' || currentUser.role === 'admin';
  const allowedCustomers =
    canChooseCustomer ? customers : customers.filter((customer) => customer.id === currentUser.customerId);
  const canOpenTicket = canChooseCustomer || allowedCustomers.length > 0;
  const [createdTicketTitle, setCreatedTicketTitle] = useState('');
  const [form, setForm] = useState({
    title: '',
    clientName: allowedCustomers[0]?.name ?? '',
    category: 'Suporte',
    priority: 'Media' as TicketPriority,
    description: '',
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canOpenTicket) {
      return;
    }
    await onCreate(form, currentUser);
    setCreatedTicketTitle(form.title);
    setForm((current) => ({ ...current, title: '', category: 'Suporte', priority: 'Media', description: '' }));
  }

  return (
    <section className="portal-shell">
      <section className="portal-panel">
        <header className="portal-header">
          <div className="portal-brand">
            <img src={roqiaSymbol} alt="RoqIA" />
            <div>
              <strong>Portal do cliente</strong>
              <span>{currentUser.name}</span>
            </div>
          </div>
          <button className="secondary-action" type="button" onClick={onBack}>
            <ArrowLeft size={16} aria-hidden="true" />
            {canChooseCustomer ? 'Voltar ao CRM' : 'Sair'}
          </button>
        </header>

        <div className="portal-content">
          <div>
            <p className="eyebrow">Atendimento RoqIA</p>
            <h1>Abrir chamado</h1>
            <p>Essa tela foi separada para uso do cliente quando ele estiver logado no portal.</p>
          </div>

          {!canOpenTicket ? (
            <div className="empty-state">
              Seu usuario ainda nao esta vinculado a um cliente. Solicite que um administrador vincule sua conta antes de abrir chamados.
            </div>
          ) : (
          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              Cliente logado
              <select
                required
                disabled={!canChooseCustomer}
                value={form.clientName}
                onChange={(event) => setForm({ ...form, clientName: event.target.value })}
              >
                {allowedCustomers.map((customer) => (
                  <option key={customer.id}>{customer.name}</option>
                ))}
              </select>
            </label>
            <label>
              Titulo
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Ex: Nao consigo acessar minha conta"
              />
            </label>
            <div className="form-row">
              <label>
                Categoria
                <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
              </label>
              <label>
                Prioridade
                <select
                  value={form.priority}
                  onChange={(event) => setForm({ ...form, priority: event.target.value as TicketPriority })}
                >
                  <option>Baixa</option>
                  <option>Media</option>
                  <option>Alta</option>
                  <option>Urgente</option>
                </select>
              </label>
            </div>
            <label>
              Descricao
              <textarea
                required
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Descreva o que aconteceu e como isso impacta sua operacao."
                rows={6}
              />
            </label>
            <button className="primary-action" type="submit">
              <Send size={18} aria-hidden="true" />
              Enviar chamado
            </button>
            {createdTicketTitle && <p className="portal-success">Chamado “{createdTicketTitle}” enviado para atendimento.</p>}
          </form>
          )}
        </div>
      </section>
    </section>
  );
}
