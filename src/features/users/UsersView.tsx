import { FormEvent, useState } from 'react';
import { ShieldCheck, UserPlus, UserRound } from 'lucide-react';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import type { Customer, UserAccount, UserRole } from '../../core/types';

interface UsersViewProps {
  accounts: UserAccount[];
  customers: Customer[];
  currentUserId: string;
  onCreate: (account: Omit<UserAccount, 'id'>) => Promise<{ ok: true } | { ok: false; message: string }>;
  onRoleChange: (accountId: string, role: UserRole) => void;
  onCustomerChange: (accountId: string, customerId: string) => void;
}

const roleLabels: Record<UserRole, string> = {
  superAdmin: 'Super admin',
  admin: 'Admin parceria',
  collaborator: 'Colaborador',
  client: 'Cliente',
};

export function UsersView({ accounts, customers, currentUserId, onCreate, onRoleChange, onCustomerChange }: UsersViewProps) {
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client' as UserRole,
    customerId: '',
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await onCreate({
      ...form,
      customerId: form.customerId || undefined,
    });

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage('');
    setForm({ name: '', email: '', password: '', role: 'client', customerId: '' });
  }

  function getCustomerName(customerId?: string) {
    return customers.find((customer) => customer.id === customerId)?.name ?? 'Sem cliente vinculado';
  }

  return (
    <section className="view-grid">
      <div className="panel">
        <SectionHeader
          title="Criar usuario"
          description="Crie contas aqui e vincule ao cliente correto antes de liberar o acesso."
        />
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Nome
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <div className="form-row">
            <label>
              E-mail
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>
            <label>
              Senha
              <input
                required
                minLength={6}
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Permissao
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
                <option value="superAdmin">Super admin</option>
                <option value="admin">Admin parceria</option>
                <option value="collaborator">Colaborador</option>
                <option value="client">Cliente</option>
              </select>
            </label>
            <label>
              Cliente vinculado
              <select value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}>
                <option value="">Sem cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="primary-action" type="submit">
            <UserPlus size={18} aria-hidden="true" />
            Criar usuario
          </button>
          {message && <p className="login-error">{message}</p>}
        </form>
      </div>

      <div className="panel">
        <SectionHeader
          title="Usuarios da plataforma"
          description="Promova usuarios e mantenha o vinculo correto com cada cliente."
        />
        <div className="record-list">
          {accounts.map((account) => (
            <article className="record-card" key={account.id}>
              <div className="record-card__icon">
                {account.role === 'superAdmin' || account.role === 'admin' ? (
                  <ShieldCheck size={20} aria-hidden="true" />
                ) : (
                  <UserRound size={20} aria-hidden="true" />
                )}
              </div>
              <div className="record-card__content">
                <div className="record-card__header">
                  <div>
                    <h3>{account.name}</h3>
                    <p>{account.email} · {getCustomerName(account.customerId)}</p>
                  </div>
                  <StatusBadge
                    label={roleLabels[account.role]}
                    tone={account.role === 'superAdmin' || account.role === 'admin' ? 'success' : 'neutral'}
                  />
                </div>
                <div className="record-actions">
                  <select
                    disabled={account.id === currentUserId}
                    value={account.role}
                    onChange={(event) => onRoleChange(account.id, event.target.value as UserRole)}
                  >
                    <option value="superAdmin">Super admin</option>
                    <option value="admin">Admin parceria</option>
                    <option value="collaborator">Colaborador</option>
                    <option value="client">Cliente</option>
                  </select>
                  <select
                    disabled={account.id === currentUserId}
                    value={account.customerId ?? ''}
                    onChange={(event) => onCustomerChange(account.id, event.target.value)}
                  >
                    <option value="">Sem cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  <div className="record-meta">
                    <span>{account.id === currentUserId ? 'Usuario atual' : 'Permissao editavel'}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
