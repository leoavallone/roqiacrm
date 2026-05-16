import { useEffect, useMemo, useState } from 'react';
import { initialData } from '../data/initialData';
import { loadCrmData, saveCrmData } from '../core/storage';
import type { Creator, CrmData, CrmTask, Customer, TeamMember, Ticket } from '../core/types';

type CrmAction = {
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'number' | 'history' | 'createdBy'>, creator: Creator) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customerId: string, customer: Omit<Customer, 'id'>) => void;
  deleteCustomer: (customerId: string) => void;
  addTask: (task: Omit<CrmTask, 'id' | 'createdAt' | 'status' | 'createdBy'>, creator: Creator) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (memberId: string, member: Omit<TeamMember, 'id'>) => void;
  deleteTeamMember: (memberId: string) => void;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
  updateTicketAssignee: (ticketId: string, assignedToId: string) => void;
  updateTaskStatus: (taskId: string, status: CrmTask['status']) => void;
};

export function useCrmData(): CrmData & CrmAction {
  const [data, setData] = useState<CrmData>(() => loadCrmData(initialData));

  useEffect(() => {
    saveCrmData(data);
  }, [data]);

  return useMemo(
    () => ({
      ...data,
      addTicket(ticket, creator) {
        setData((current) => ({
          ...current,
          tickets: [
            {
              ...ticket,
              id: crypto.randomUUID(),
              number: getNextTicketNumber(current.tickets),
              status: 'Aberto',
              createdAt: new Date().toISOString().slice(0, 10),
              createdBy: creator,
              history: [
                {
                  id: crypto.randomUUID(),
                  date: new Date().toISOString().slice(0, 10),
                  title: 'Chamado aberto',
                  description: ticket.description,
                },
              ],
            },
            ...current.tickets,
          ],
        }));
      },
      addCustomer(customer) {
        setData((current) => ({
          ...current,
          customers: [{ ...customer, id: crypto.randomUUID() }, ...current.customers],
        }));
      },
      updateCustomer(customerId, customer) {
        setData((current) => ({
          ...current,
          customers: current.customers.map((currentCustomer) =>
            currentCustomer.id === customerId ? { ...currentCustomer, ...customer } : currentCustomer,
          ),
        }));
      },
      deleteCustomer(customerId) {
        setData((current) => ({
          ...current,
          customers: current.customers.filter((customer) => customer.id !== customerId),
        }));
      },
      addTask(task, creator) {
        setData((current) => ({
          ...current,
          tasks: [
            {
              ...task,
              id: crypto.randomUUID(),
              status: 'Pendente',
              createdAt: new Date().toISOString().slice(0, 10),
              createdBy: creator,
            },
            ...current.tasks,
          ],
        }));
      },
      addTeamMember(member) {
        setData((current) => ({
          ...current,
          team: [{ ...member, id: crypto.randomUUID() }, ...current.team],
        }));
      },
      updateTeamMember(memberId, member) {
        setData((current) => ({
          ...current,
          team: current.team.map((teamMember) => (teamMember.id === memberId ? { ...teamMember, ...member } : teamMember)),
        }));
      },
      deleteTeamMember(memberId) {
        setData((current) => ({
          ...current,
          team: current.team.filter((teamMember) => teamMember.id !== memberId),
        }));
      },
      updateTicketStatus(ticketId, status) {
        setData((current) => ({
          ...current,
          tickets: current.tickets.map((ticket) => {
            if (ticket.id !== ticketId || ticket.status === status) {
              return ticket;
            }

            return {
              ...ticket,
              status,
              history: [
                {
                  id: crypto.randomUUID(),
                  date: new Date().toISOString().slice(0, 10),
                  title: 'Status atualizado',
                  description: `Status alterado de ${ticket.status} para ${status}.`,
                },
                ...ticket.history,
              ],
            };
          }),
        }));
      },
      updateTicketAssignee(ticketId, assignedToId) {
        setData((current) => ({
          ...current,
          tickets: current.tickets.map((ticket) => {
            if (ticket.id !== ticketId) {
              return ticket;
            }

            return {
              ...ticket,
              assignedToId: assignedToId || undefined,
            };
          }),
        }));
      },
      updateTaskStatus(taskId, status) {
        setData((current) => ({
          ...current,
          tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
        }));
      },
    }),
    [data],
  );
}

function getNextTicketNumber(tickets: Ticket[]): number {
  const highestNumber = tickets.reduce((highest, ticket) => Math.max(highest, ticket.number), 1000);
  return highestNumber + 1;
}
