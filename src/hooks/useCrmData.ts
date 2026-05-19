import { useEffect, useMemo, useState } from 'react';
import {
  createCustomer as createCustomerRequest,
  createTask as createTaskRequest,
  createTeamMember as createTeamMemberRequest,
  createTicket as createTicketRequest,
  deleteCustomer as deleteCustomerRequest,
  deleteTeamMember as deleteTeamMemberRequest,
  fetchCrmData,
  fetchPortalData,
  updateCustomer as updateCustomerRequest,
  updateTask as updateTaskRequest,
  updateTeamMember as updateTeamMemberRequest,
  updateTicket as updateTicketRequest,
} from '../core/api';
import type { Creator, CrmData, CrmTask, Customer, TeamMember, Ticket, UserAccount } from '../core/types';

type CrmAction = {
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'number' | 'history' | 'createdBy'>, creator: Creator) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (customerId: string, customer: Omit<Customer, 'id'>) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  addTask: (task: Omit<CrmTask, 'id' | 'createdAt' | 'status' | 'createdBy'>, creator: Creator) => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  updateTeamMember: (memberId: string, member: Omit<TeamMember, 'id'>) => Promise<void>;
  deleteTeamMember: (memberId: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => Promise<void>;
  updateTicketAssignee: (ticketId: string, assignedToId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: CrmTask['status']) => Promise<void>;
};

const emptyData: CrmData = {
  tickets: [],
  customers: [],
  tasks: [],
  team: [],
};

export function useCrmData(currentUser: UserAccount | null): CrmData & CrmAction {
  const [data, setData] = useState<CrmData>(emptyData);

  useEffect(() => {
    if (!currentUser) {
      setData(emptyData);
      return;
    }

    let isMounted = true;
    const activeUser = currentUser;

    async function loadData() {
      const nextData = activeUser.role === 'client' ? await fetchPortalData() : await fetchCrmData();

      if (isMounted) {
        setData(nextData);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  return useMemo(
    () => ({
      ...data,
      async addTicket(ticket) {
        const customerId = data.customers.find((customer) => customer.name === ticket.clientName)?.id;
        const createdTicket = await createTicketRequest(ticket, customerId);
        setData((current) => ({
          ...current,
          tickets: [{ ...createdTicket, clientName: ticket.clientName }, ...current.tickets],
        }));
      },
      async addCustomer(customer) {
        const createdCustomer = await createCustomerRequest(customer);
        setData((current) => ({
          ...current,
          customers: [createdCustomer, ...current.customers],
        }));
      },
      async updateCustomer(customerId, customer) {
        const updatedCustomer = await updateCustomerRequest(customerId, customer);
        setData((current) => ({
          ...current,
          customers: current.customers.map((currentCustomer) =>
            currentCustomer.id === customerId ? updatedCustomer : currentCustomer,
          ),
        }));
      },
      async deleteCustomer(customerId) {
        await deleteCustomerRequest(customerId);
        setData((current) => ({
          ...current,
          customers: current.customers.filter((customer) => customer.id !== customerId),
        }));
      },
      async addTask(task) {
        const customerId = data.customers.find((customer) => customer.name === task.customerName)?.id;
        const createdTask = await createTaskRequest(task, customerId);
        setData((current) => ({
          ...current,
          tasks: [{ ...createdTask, customerName: task.customerName }, ...current.tasks],
        }));
      },
      async addTeamMember(member) {
        const createdMember = await createTeamMemberRequest(member);
        setData((current) => ({
          ...current,
          team: [createdMember, ...current.team],
        }));
      },
      async updateTeamMember(memberId, member) {
        const updatedMember = await updateTeamMemberRequest(memberId, member);
        setData((current) => ({
          ...current,
          team: current.team.map((teamMember) => (teamMember.id === memberId ? updatedMember : teamMember)),
        }));
      },
      async deleteTeamMember(memberId) {
        await deleteTeamMemberRequest(memberId);
        setData((current) => ({
          ...current,
          team: current.team.filter((teamMember) => teamMember.id !== memberId),
        }));
      },
      async updateTicketStatus(ticketId, status) {
        const updatedTicket = await updateTicketRequest(ticketId, { status });
        setData((current) => ({
          ...current,
          tickets: current.tickets.map((ticket) => (ticket.id === ticketId ? { ...updatedTicket, clientName: ticket.clientName } : ticket)),
        }));
      },
      async updateTicketAssignee(ticketId, assignedToId) {
        const updatedTicket = await updateTicketRequest(ticketId, { assignedToId });
        setData((current) => ({
          ...current,
          tickets: current.tickets.map((ticket) => (ticket.id === ticketId ? { ...updatedTicket, clientName: ticket.clientName } : ticket)),
        }));
      },
      async updateTaskStatus(taskId, status) {
        const updatedTask = await updateTaskRequest(taskId, { status });
        setData((current) => ({
          ...current,
          tasks: current.tasks.map((task) => (task.id === taskId ? { ...updatedTask, customerName: task.customerName } : task)),
        }));
      },
    }),
    [data],
  );
}
