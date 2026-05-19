import { CalendarClock, CheckCircle2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { daysUntil, formatDate, todayAsInputValue } from '../../core/date';
import type { Creator, CrmTask, Customer, TaskStatus, TaskType, TeamMember } from '../../core/types';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';

interface TasksViewProps {
  tasks: CrmTask[];
  customers: Customer[];
  team: TeamMember[];
  currentUser: Creator;
  onCreate: (task: Omit<CrmTask, 'id' | 'createdAt' | 'status' | 'createdBy'>, creator: Creator) => Promise<void>;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
}

const statusTone: Record<TaskStatus, 'success' | 'warning' | 'neutral'> = {
  Pendente: 'warning',
  'Em andamento': 'neutral',
  Concluida: 'success',
};

export function TasksView({ tasks, customers, team, currentUser, onCreate, onStatusChange }: TasksViewProps) {
  const [form, setForm] = useState({
    title: '',
    type: 'RoqIA' as TaskType,
    customerName: '',
    ownerId: team[0]?.id ?? '',
    dueDate: todayAsInputValue(),
    notes: '',
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate(
      {
        ...form,
        customerName: form.type === 'Cliente' ? form.customerName : undefined,
      },
      currentUser,
    );
    setForm((current) => ({ ...current, title: '', notes: '' }));
  }

  function getOwnerName(ownerId: string) {
    return team.find((member) => member.id === ownerId)?.name ?? 'Sem responsavel';
  }

  function getTaskContext(task: CrmTask) {
    if (task.type === 'Cliente') {
      return task.customerName ?? 'Cliente nao informado';
    }

    const contextLabel: Record<TaskType, string> = {
      Cliente: 'Cliente',
      RoqIA: 'RoqIA',
      Prototipo: 'Prototipo',
      Melhoria: 'Melhoria interna',
    };

    return contextLabel[task.type];
  }

  return (
    <section className="view-grid">
      <div className="panel">
        <SectionHeader title="Criacao de tarefas" description="Organize demandas de clientes, operacao interna, melhorias e prototipos." />
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Tarefa
            <input
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Ex: Fazer reuniao de acompanhamento"
            />
          </label>
          <div className="form-row">
            <label>
              Tipo
              <select
                required
                value={form.type}
                onChange={(event) => {
                  const nextType = event.target.value as TaskType;
                  setForm({
                    ...form,
                    type: nextType,
                    customerName: nextType === 'Cliente' ? customers[0]?.name ?? '' : '',
                  });
                }}
              >
                <option>RoqIA</option>
                <option>Melhoria</option>
                <option>Prototipo</option>
                <option>Cliente</option>
              </select>
            </label>
            <label>
              Cliente vinculado
              <select
                disabled={form.type !== 'Cliente'}
                required={form.type === 'Cliente'}
                value={form.customerName}
                onChange={(event) => setForm({ ...form, customerName: event.target.value })}
              >
                <option value="">Sem cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id}>{customer.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Responsavel
              <select required value={form.ownerId} onChange={(event) => setForm({ ...form, ownerId: event.target.value })}>
                {team.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prazo
              <input
                required
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
              />
            </label>
          </div>
          <label>
            Observacoes
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              rows={5}
            />
          </label>
          <button className="primary-action" type="submit">
            <CheckCircle2 size={18} aria-hidden="true" />
            Criar tarefa
          </button>
        </form>
      </div>

      <div className="panel">
        <SectionHeader title="Agenda do time" description="Acompanhe o que esta pendente e quem esta responsavel." />
        <div className="record-list">
          {tasks.map((task) => {
            const remainingDays = daysUntil(task.dueDate);
            const isLate = remainingDays < 0 && task.status !== 'Concluida';
            return (
              <article className={isLate ? 'record-card record-card--late' : 'record-card'} key={task.id}>
                <div className="record-card__icon">
                  <CalendarClock size={20} aria-hidden="true" />
                </div>
                <div className="record-card__content">
                  <div className="record-card__header">
                    <div>
                      <h3>{task.title}</h3>
                      <p>{getTaskContext(task)}</p>
                    </div>
                    <StatusBadge label={task.status} tone={statusTone[task.status]} />
                  </div>
                  {task.notes && <p>{task.notes}</p>}
                  <div className="record-meta">
                    <span>{task.type}</span>
                    <span>{getOwnerName(task.ownerId)}</span>
                    <span>Criada por {task.createdBy.name}</span>
                    <span>{formatDate(task.dueDate)}</span>
                    <span>{isLate ? `${Math.abs(remainingDays)} dias atrasada` : `${remainingDays} dias`}</span>
                  </div>
                  <select value={task.status} onChange={(event) => void onStatusChange(task.id, event.target.value as TaskStatus)}>
                    <option>Pendente</option>
                    <option>Em andamento</option>
                    <option>Concluida</option>
                  </select>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
