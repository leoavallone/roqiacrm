import { Edit3, Save, Trash2, UserPlus, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { SectionHeader } from '../../components/SectionHeader';
import type { TeamMember } from '../../core/types';

interface TeamViewProps {
  team: TeamMember[];
  onCreate: (member: Omit<TeamMember, 'id'>) => void;
  onUpdate: (memberId: string, member: Omit<TeamMember, 'id'>) => void;
  onDelete: (memberId: string) => void;
}

export function TeamView({ team, onCreate, onUpdate, onDelete }: TeamViewProps) {
  const [form, setForm] = useState({ name: '', role: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: '' });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate(form);
    setForm({ name: '', role: '' });
  }

  function startEditing(member: TeamMember) {
    setEditingId(member.id);
    setEditForm({ name: member.name, role: member.role });
  }

  function saveEditing(memberId: string) {
    onUpdate(memberId, editForm);
    setEditingId(null);
  }

  return (
    <section className="view-grid">
      <div className="panel">
        <SectionHeader title="Novo responsavel" description="Cadastre pessoas que podem receber tarefas e atendimentos." />
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Nome
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>
            Funcao
            <input
              required
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              placeholder="Ex: Suporte, Produto, Financeiro"
            />
          </label>
          <button className="primary-action" type="submit">
            <UserPlus size={18} aria-hidden="true" />
            Criar responsavel
          </button>
        </form>
      </div>

      <div className="panel">
        <SectionHeader title="Responsaveis" description="Edite nomes e funcoes sem perder o vinculo com tarefas existentes." />
        <div className="record-list">
          {team.map((member) => (
            <article className="record-card" key={member.id}>
              <div className="record-card__icon">
                <UserRound size={20} aria-hidden="true" />
              </div>
              <div className="record-card__content">
                {editingId === member.id ? (
                  <div className="inline-edit">
                    <label>
                      Nome
                      <input value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
                    </label>
                    <label>
                      Funcao
                      <input value={editForm.role} onChange={(event) => setEditForm({ ...editForm, role: event.target.value })} />
                    </label>
                    <button className="secondary-action" type="button" onClick={() => saveEditing(member.id)}>
                      <Save size={16} aria-hidden="true" />
                      Salvar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="record-card__header">
                      <div>
                        <h3>{member.name}</h3>
                        <p>{member.role}</p>
                      </div>
                      <button className="icon-action" type="button" onClick={() => startEditing(member)} title="Editar responsavel">
                        <Edit3 size={16} aria-hidden="true" />
                      </button>
                      <button className="icon-action" type="button" onClick={() => onDelete(member.id)} title="Remover responsavel">
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="record-meta">
                      <span>Responsavel ativo</span>
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
