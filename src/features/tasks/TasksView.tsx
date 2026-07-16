import { CalendarClock, CheckCircle2, GripVertical, Pencil, X } from 'lucide-react';
import { DragEvent, FormEvent, useEffect, useState } from 'react';
import { daysUntil, formatDate, todayAsInputValue } from '../../core/date';
import type { Creator, CrmTask, Customer, TaskStatus, TaskType, TeamMember } from '../../core/types';
import { SectionHeader } from '../../components/SectionHeader';

interface TasksViewProps {
  tasks: CrmTask[];
  customers: Customer[];
  team: TeamMember[];
  currentUser: Creator;
  canCreate: boolean;
  canAssign: boolean;
  onCreate: (task: Omit<CrmTask, 'id' | 'createdAt' | 'status' | 'createdBy'>, creator: Creator) => Promise<void>;
  onStatusChange: (taskId: string, status: TaskStatus, notes?: string) => Promise<void>;
  onOwnerChange: (taskId: string, ownerId: string) => Promise<void>;
}

const stages: Array<{ status: TaskStatus; defaultLabel: string; tone: string }> = [
  { status: 'Pendente', defaultLabel: 'Pendente', tone: 'pink' },
  { status: 'Em andamento', defaultLabel: 'Em andamento', tone: 'orange' },
  { status: 'Impedimento', defaultLabel: 'Impedimentos', tone: 'red' },
  { status: 'Concluida', defaultLabel: 'Concluído', tone: 'green' },
];
const STAGE_LABELS_KEY = 'roqiacrm:task-stage-labels:v1';

function loadStageLabels(): Partial<Record<TaskStatus, string>> {
  try {
    return JSON.parse(window.localStorage.getItem(STAGE_LABELS_KEY) ?? '{}') as Partial<Record<TaskStatus, string>>;
  } catch {
    return {};
  }
}

export function TasksView({ tasks, customers, team, currentUser, canCreate, canAssign, onCreate, onStatusChange, onOwnerChange }: TasksViewProps) {
  const [form, setForm] = useState({ title: '', type: 'RoqIA' as TaskType, customerName: '', ownerId: team[0]?.id ?? '', dueDate: todayAsInputValue(), description: '', notes: '' });
  const [stageLabels, setStageLabels] = useState(loadStageLabels);
  const [editingStage, setEditingStage] = useState<TaskStatus | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<TaskStatus | null>(null);

  useEffect(() => {
    if (team.length > 0 && !team.some((member) => member.id === form.ownerId)) {
      setForm((current) => ({ ...current, ownerId: team[0].id }));
    }
  }, [team, form.ownerId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreate({ ...form, customerName: form.type === 'Cliente' ? form.customerName : undefined }, currentUser);
    setForm((current) => ({ ...current, title: '', description: '', notes: '' }));
  }

  function renameStage(status: TaskStatus, label: string) {
    const next = { ...stageLabels, [status]: label.trim() || stages.find((stage) => stage.status === status)?.defaultLabel };
    setStageLabels(next);
    window.localStorage.setItem(STAGE_LABELS_KEY, JSON.stringify(next));
  }

  async function dropTask(event: DragEvent<HTMLElement>, status: TaskStatus) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/task-id') || draggedTaskId;
    setDraggedTaskId(null);
    setDragOverStage(null);
    const task = tasks.find((item) => item.id === taskId);
    if (task && task.status !== status) {
      const notes = window.prompt(`Observação opcional ao mover para ${stageLabels[status] ?? stages.find((stage) => stage.status === status)?.defaultLabel}:`)?.trim();
      await onStatusChange(task.id, status, notes || undefined);
    }
  }

  function getOwnerName(ownerId: string) {
    return team.find((member) => member.id === ownerId)?.name ?? 'Sem responsável';
  }

  return (
    <section className="tasks-workspace">
      {canCreate && (
        <details className="panel task-creator">
          <summary><span><strong>Nova tarefa</strong><small>Adicione uma demanda ao quadro</small></span><span className="task-creator__toggle">+</span></summary>
          <form className="form-stack task-creator__form" onSubmit={handleSubmit}>
            <label>Tarefa<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ex: Fazer reunião de acompanhamento" /></label>
            <div className="form-row">
              <label>Tipo<select required value={form.type} onChange={(event) => { const type = event.target.value as TaskType; setForm({ ...form, type, customerName: type === 'Cliente' ? customers[0]?.name ?? '' : '' }); }}><option>RoqIA</option><option>Melhoria</option><option>Prototipo</option><option>Cliente</option></select></label>
              <label>Cliente vinculado<select disabled={form.type !== 'Cliente'} required={form.type === 'Cliente'} value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })}><option value="">Sem cliente</option>{customers.map((customer) => <option key={customer.id}>{customer.name}</option>)}</select></label>
            </div>
            <div className="form-row">
              <label>Responsável<select required value={form.ownerId} onChange={(event) => setForm({ ...form, ownerId: event.target.value })}><option value="" disabled>Selecione um responsável</option>{team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
              <label>Prazo<input required type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label>
            </div>
            <label>Descrição<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} placeholder="Descreva o que precisa ser feito" /></label>
            <button className="primary-action" type="submit"><CheckCircle2 size={18} />Criar tarefa</button>
          </form>
        </details>
      )}

      <div className="tasks-board-heading">
        <SectionHeader title="Quadro de tarefas" description="Arraste os cards entre as etapas. Clique no lápis para renomear uma etapa." />
      </div>
      <div className="kanban-board">
        {stages.map((stage) => {
          const stageTasks = tasks.filter((task) => task.status === stage.status);
          return (
            <section className={`kanban-column kanban-column--${stage.tone}${dragOverStage === stage.status ? ' kanban-column--drag-over' : ''}`} key={stage.status} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDragOverStage(stage.status); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOverStage(null); }} onDrop={(event) => void dropTask(event, stage.status)}>
              <header className="kanban-column__header">
                {editingStage === stage.status ? (
                  <input className="kanban-column__name-input" autoFocus defaultValue={stageLabels[stage.status] ?? stage.defaultLabel} onBlur={(event) => { renameStage(stage.status, event.target.value); setEditingStage(null); }} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') setEditingStage(null); }} aria-label={`Nome da etapa ${stage.defaultLabel}`} />
                ) : <h3>{stageLabels[stage.status] ?? stage.defaultLabel}</h3>}
                <span className="kanban-column__count">{stageTasks.length}</span>
                <button className="kanban-column__edit" type="button" onClick={() => setEditingStage(editingStage === stage.status ? null : stage.status)} title="Renomear etapa">{editingStage === stage.status ? <X size={15} /> : <Pencil size={15} />}</button>
              </header>
              <div className="kanban-column__cards">
                {stageTasks.map((task) => {
                  const remainingDays = daysUntil(task.dueDate);
                  const isLate = remainingDays < 0 && task.status !== 'Concluida';
                  return (
                    <article className={`kanban-card${isLate ? ' kanban-card--late' : ''}${draggedTaskId === task.id ? ' kanban-card--dragging' : ''}`} key={task.id} draggable onDragStart={(event) => { event.dataTransfer.setData('text/task-id', task.id); event.dataTransfer.effectAllowed = 'move'; setDraggedTaskId(task.id); }} onDragEnd={() => { setDraggedTaskId(null); setDragOverStage(null); }}>
                      <div className="kanban-card__top"><span className="kanban-card__type">{task.type}</span><GripVertical size={17} aria-label="Arrastar tarefa" /></div>
                      <h4>{task.title}</h4>
                      {task.description && <p>{task.description}</p>}
                      {task.notes && <p className="kanban-card__note"><strong>Última observação:</strong> {task.notes}</p>}
                      <div className="kanban-card__meta"><span><CalendarClock size={14} />{formatDate(task.dueDate)}</span><span className={isLate ? 'kanban-card__due--late' : ''}>{isLate ? `${Math.abs(remainingDays)}d atrasada` : `${remainingDays}d`}</span></div>
                      <div className="kanban-card__owner" title={getOwnerName(task.ownerId)}><span>{getOwnerName(task.ownerId).slice(0, 2).toUpperCase()}</span>{canAssign ? <select aria-label={`Responsável por ${task.title}`} value={task.ownerId} onPointerDown={(event) => event.stopPropagation()} onChange={(event) => void onOwnerChange(task.id, event.target.value)}>{team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select> : <small>{getOwnerName(task.ownerId)}</small>}</div>
                    </article>
                  );
                })}
                {stageTasks.length === 0 && <div className="kanban-column__empty">Arraste uma tarefa para esta etapa</div>}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
