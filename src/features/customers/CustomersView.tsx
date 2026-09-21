import { Building2, Camera, CheckCircle2, Edit3, Save, Trash2, UserPlus, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { daysUntil, formatCurrency, formatDate, getNextMonthlyDueDate } from '../../core/date';
import type { Customer, CustomerServiceMode, SubscriptionStatus } from '../../core/types';

interface CustomersViewProps {
  customers: Customer[];
  readOnly?: boolean;
  onCreate: (customer: Omit<Customer, 'id'>) => Promise<void>;
  onUpdate: (customerId: string, customer: Omit<Customer, 'id'>) => Promise<void>;
  onDelete: (customerId: string) => Promise<void>;
}

type CustomerFormData = Omit<Customer, 'id'>;

interface CustomerFormFieldsProps {
  value: CustomerFormData;
  onChange: (value: CustomerFormData) => void;
}

const statusTone: Record<SubscriptionStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  Ativa: 'success',
  Inativo: 'neutral',
  Pendente: 'warning',
  Vencida: 'danger',
};

const emptyCustomerForm: CustomerFormData = {
  photo: '',
  name: '',
  contact: '',
  email: '',
  contractDuration: '',
  monthlyValue: 0,
  dueDay: 0,
  nextDueDate: '',
  status: 'Ativa',
  serviceMode: 'solo',
};

const contractDurationOptions = Array.from({ length: 60 }, (_, index) => {
  const months = index + 1;
  return `${months} ${months === 1 ? 'mês' : 'meses'}`;
});

export function CustomersView({ customers, readOnly = false, onCreate, onUpdate, onDelete }: CustomersViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CustomerFormData>({ ...emptyCustomerForm });
  const [form, setForm] = useState<CustomerFormData>({ ...emptyCustomerForm });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate(form);
    setForm({ ...emptyCustomerForm });
    setIsCreateOpen(false);
  }

  function startEditing(customer: Customer) {
    const { id: _id, ...customerData } = customer;
    void _id;
    setEditingId(customer.id);
    setEditForm(customerData);
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
    <section className="customers-workspace">
      <div className="panel customers-panel">
        <SectionHeader title="Carteira de clientes" description="Contratos, mensalidades e vencimentos em um só lugar.">
          {!readOnly && (
            <button className="primary-action" type="button" onClick={() => setIsCreateOpen(true)}>
              <UserPlus size={18} aria-hidden="true" />
              Cadastrar cliente
            </button>
          )}
        </SectionHeader>

        <div className="record-list customer-list">
          {customers.length === 0 && <p className="empty-state">Nenhum cliente cadastrado.</p>}
          {customers.map((customer) => {
            const remainingDays = customer.nextDueDate ? daysUntil(customer.nextDueDate) : null;

            return (
              <article className="record-card customer-card" key={customer.id}>
                <CustomerAvatar customer={customer} />
                <div className="record-card__content">
                  {editingId === customer.id ? (
                    <div className="inline-edit">
                      <CustomerFormFields value={editForm} onChange={setEditForm} />
                      <div className="record-actions">
                        <button className="primary-action" type="button" onClick={() => void saveEditing(customer.id)}>
                          <Save size={16} aria-hidden="true" />
                          Salvar alterações
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

                      <div className="customer-details">
                        <div className="customer-detail">
                          <span>Mensalidade</span>
                          <strong>{formatCurrency(customer.monthlyValue)}</strong>
                        </div>
                        <div className="customer-detail">
                          <span>Contrato</span>
                          <strong>{customer.contractDuration || 'Não informado'}</strong>
                        </div>
                        <div className="customer-detail">
                          <span>Próximo vencimento</span>
                          <strong>{customer.nextDueDate ? formatDate(customer.nextDueDate) : 'Não informado'}</strong>
                          {customer.dueDay > 0 && <small>Todo dia {customer.dueDay}</small>}
                        </div>
                        <div className="customer-detail">
                          <span>Atendimento</span>
                          <strong>{customer.serviceMode === 'partnership' ? 'Parceria' : 'Solo'}</strong>
                        </div>
                      </div>

                      <div className="customer-card__footer">
                        {remainingDays !== null && (
                          <div className={remainingDays < 0 ? 'customer-payment-status customer-payment-status--late' : 'customer-payment-status'}>
                            {remainingDays < 0
                              ? `${Math.abs(remainingDays)} dias em atraso`
                              : remainingDays === 0
                                ? 'Vence hoje'
                                : `Vence em ${remainingDays} dias`}
                          </div>
                        )}
                        {!readOnly && (
                          <div className="customer-actions">
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
                            <button className="icon-action" type="button" title="Excluir cliente" aria-label={`Excluir ${customer.name || 'cliente'}`} onClick={() => void onDelete(customer.id)}>
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {isCreateOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsCreateOpen(false);
        }}>
          <div className="customer-modal" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title">
            <div className="customer-modal__header">
              <div>
                <h2 id="customer-modal-title">Cadastrar cliente</h2>
                <p>Preencha somente as informações que você tiver.</p>
              </div>
              <button className="icon-action" type="button" aria-label="Fechar cadastro" onClick={() => setIsCreateOpen(false)}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <form className="form-stack" onSubmit={handleSubmit}>
              <CustomerFormFields value={form} onChange={setForm} />
              <div className="customer-modal__actions">
                <button className="secondary-action" type="button" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </button>
                <button className="primary-action" type="submit">
                  <UserPlus size={18} aria-hidden="true" />
                  Cadastrar cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function CustomerFormFields({ value, onChange }: CustomerFormFieldsProps) {
  return (
    <>
      <CustomerPhotoInput photo={value.photo} name={value.name} onChange={(photo) => onChange({ ...value, photo })} />
      <label>
        Nome da empresa
        <input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} />
      </label>
      <div className="form-row">
        <label>
          Contato
          <input value={value.contact} onChange={(event) => onChange({ ...value, contact: event.target.value })} />
        </label>
        <label>
          E-mail
          <input type="email" value={value.email} onChange={(event) => onChange({ ...value, email: event.target.value })} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Tempo de contrato
          <select value={value.contractDuration} onChange={(event) => onChange({ ...value, contractDuration: event.target.value })}>
            <option value="">Não informado</option>
            <option value="Indeterminado">Indeterminado</option>
            {contractDurationOptions.map((duration) => <option key={duration}>{duration}</option>)}
          </select>
        </label>
        <label>
          Valor mensal
          <input min="0" step="10" type="number" value={value.monthlyValue || ''} onChange={(event) => onChange({ ...value, monthlyValue: Number(event.target.value) })} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Dia de vencimento
          <input min="1" max="31" type="number" value={value.dueDay || ''} onChange={(event) => onChange({ ...value, dueDay: Number(event.target.value) })} />
        </label>
        <label>
          Próximo vencimento
          <input type="date" value={value.nextDueDate} onChange={(event) => onChange({ ...value, nextDueDate: event.target.value })} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Situação
          <select value={value.status} onChange={(event) => onChange({ ...value, status: event.target.value as SubscriptionStatus })}>
            <option>Ativa</option>
            <option>Inativo</option>
            <option>Pendente</option>
            <option>Vencida</option>
          </select>
        </label>
        <label>
          Atendimento
          <select value={value.serviceMode} onChange={(event) => onChange({ ...value, serviceMode: event.target.value as CustomerServiceMode })}>
            <option value="solo">Solo</option>
            <option value="partnership">Parceria</option>
          </select>
        </label>
      </div>
    </>
  );
}

function CustomerPhotoInput({ photo, name, onChange }: { photo: string; name: string; onChange: (photo: string) => void }) {
  const [error, setError] = useState('');

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setError('Escolha uma imagem de até 10 MB.');
      return;
    }

    try {
      const resizedPhoto = await resizeCustomerPhoto(file);
      onChange(resizedPhoto);
      setError('');
    } catch {
      setError('Não foi possível carregar essa imagem.');
    }
  }

  return (
    <div className="customer-photo-field">
      <div className="customer-photo-preview">
        {photo ? <img src={photo} alt={name ? `Foto de ${name}` : 'Foto do cliente'} /> : <Camera size={24} aria-hidden="true" />}
      </div>
      <div>
        <strong>Foto do cliente</strong>
        <p>JPG, PNG ou WebP de até 10 MB.</p>
        <div className="customer-photo-actions">
          <label className="secondary-action customer-photo-upload">
            Escolher foto
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handlePhoto(event)} />
          </label>
          {photo && <button className="secondary-action" type="button" onClick={() => onChange('')}>Remover</button>}
        </div>
        {error && <small className="customer-photo-error">{error}</small>}
      </div>
    </div>
  );
}

function CustomerAvatar({ customer }: { customer: Customer }) {
  const initials = customer.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="customer-avatar">
      {customer.photo
        ? <img src={customer.photo} alt={`Foto de ${customer.name || 'cliente'}`} />
        : initials || <Building2 size={20} aria-hidden="true" />}
    </div>
  );
}

function resizeCustomerPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const sourceImage = new Image();

    sourceImage.onload = () => {
      const maxSize = 512;
      const scale = Math.min(1, maxSize / Math.max(sourceImage.width, sourceImage.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sourceImage.width * scale));
      canvas.height = Math.max(1, Math.round(sourceImage.height * scale));
      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas indisponível.'));
        return;
      }

      context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
      const photo = canvas.toDataURL('image/webp', 0.82);
      URL.revokeObjectURL(objectUrl);
      resolve(photo);
    };

    sourceImage.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Imagem inválida.'));
    };

    sourceImage.src = objectUrl;
  });
}
