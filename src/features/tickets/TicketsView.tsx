import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatDate } from '../../core/date';
import type { Customer, TeamMember, Ticket, TicketPriority, TicketStatus } from '../../core/types';
import { SectionHeader } from '../../components/SectionHeader';

interface TicketsViewProps {
  tickets: Ticket[];
  customers: Customer[];
  team: TeamMember[];
  onAssigneeChange: (ticketId: string, assignedToId: string) => void;
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
}

export function TicketsView({ tickets, customers, team, onAssigneeChange, onStatusChange }: TicketsViewProps) {
  const [filters, setFilters] = useState({
    status: 'Todos' as TicketStatus | 'Todos',
    priority: 'Todas' as TicketPriority | 'Todas',
    clientName: 'Todos',
    assignedToId: 'Todos',
    search: '',
  });

  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const search = filters.search.trim().toLowerCase();
        const matchesStatus =
          filters.status === 'Todos' ? ticket.status !== 'Resolvido' : ticket.status === filters.status;
        const matchesPriority = filters.priority === 'Todas' || ticket.priority === filters.priority;
        const matchesClient = filters.clientName === 'Todos' || ticket.clientName === filters.clientName;
        const matchesResponsible =
          filters.assignedToId === 'Todos' ||
          (filters.assignedToId === 'Sem responsavel' ? !ticket.assignedToId : ticket.assignedToId === filters.assignedToId);
        const matchesSearch =
          !search ||
          ticket.title.toLowerCase().includes(search) ||
          ticket.description.toLowerCase().includes(search) ||
          String(ticket.number).includes(search);

        return matchesStatus && matchesPriority && matchesClient && matchesResponsible && matchesSearch;
      }),
    [filters, tickets],
  );

  return (
    <section className="tickets-workspace">
      <div className="panel filters-panel">
        <SectionHeader title="Filtros da fila" description="Resolvidos ficam ocultos por padrao. Use o filtro para consultar encerrados." />
        <div className="filters-bar">
          <label className="filters-bar__search">
            <span>Buscar</span>
            <div className="input-with-icon">
              <Search size={16} aria-hidden="true" />
              <input
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="Numero, titulo ou descricao"
              />
            </div>
          </label>
          <label>
            Status
            <select
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value as TicketStatus | 'Todos' })}
            >
              <option>Todos</option>
              <option>Aberto</option>
              <option>Em andamento</option>
              <option>Resolvido</option>
            </select>
          </label>
          <label>
            Prioridade
            <select
              value={filters.priority}
              onChange={(event) => setFilters({ ...filters, priority: event.target.value as TicketPriority | 'Todas' })}
            >
              <option>Todas</option>
              <option>Baixa</option>
              <option>Media</option>
              <option>Alta</option>
              <option>Urgente</option>
            </select>
          </label>
          <label>
            Cliente
            <select
              value={filters.clientName}
              onChange={(event) => setFilters({ ...filters, clientName: event.target.value })}
            >
              <option>Todos</option>
              {customers.map((customer) => (
                <option key={customer.id}>{customer.name}</option>
              ))}
            </select>
          </label>
          <label>
            Responsavel
            <select
              value={filters.assignedToId}
              onChange={(event) => setFilters({ ...filters, assignedToId: event.target.value })}
            >
              <option>Todos</option>
              <option>Sem responsavel</option>
              {team.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <div className="record-meta">
            <span>{filteredTickets.length} chamados encontrados</span>
          </div>
        </div>
      </div>

      <div className="panel queue-panel">
        <SectionHeader title="Fila de atendimento" description="Priorize e atualize a situacao dos chamados." />
        <div className="ticket-table-wrap">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Resumo</th>
                <th>Criador</th>
                <th>Cliente</th>
                <th>Responsavel</th>
                <th>Status</th>
                <th>Criado</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr className="ticket-table__row" key={ticket.id}>
                  <td>
                    <span className="ticket-key">{ticket.number}</span>
                  </td>
                  <td>
                    <div className="ticket-summary">
                      <strong>{ticket.title}</strong>
                      <span>{ticket.description}</span>
                    </div>
                  </td>
                  <td>{ticket.createdBy.name}</td>
                  <td>{ticket.clientName}</td>
                  <td>
                    <select
                      aria-label={`Responsavel do chamado ${ticket.number}`}
                      value={ticket.assignedToId ?? ''}
                      onChange={(event) => onAssigneeChange(ticket.id, event.target.value)}
                    >
                      <option value="">Sem responsavel</option>
                      {team.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      aria-label={`Status do chamado ${ticket.number}`}
                      value={ticket.status}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => onStatusChange(ticket.id, event.target.value as TicketStatus)}
                    >
                      <option>Aberto</option>
                      <option>Em andamento</option>
                      <option>Resolvido</option>
                    </select>
                  </td>
                  <td>{formatDate(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && <p className="empty-state">Nenhum chamado encontrado com os filtros selecionados.</p>}
        </div>
      </div>
    </section>
  );
}
