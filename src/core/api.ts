import type { Creator, CrmData, CrmTask, Customer, TeamMember, Ticket, UserAccount } from './types';

const TOKEN_KEY = 'roqiacrm:auth-token:v1';
const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ??
  (window.location.protocol === 'file:' ? 'http://localhost:4000' : '');

type ApiOptions = RequestInit & {
  token?: string | null;
};

type MongoRef = string | { _id?: string; id?: string; name?: string; email?: string; role?: string; customerId?: MongoRef | null } | null | undefined;

export type AuthResponse = {
  token: string;
  user: UserAccount;
};

export function loadAuthToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveAuthToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = options.token ?? loadAuthToken();

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Nao foi possivel comunicar com o servidor. Verifique se a API esta rodando.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload));
  }

  return payload as T;
}

export async function loginWithApi(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    token: null,
  });
}

export async function fetchCurrentUser(token: string): Promise<UserAccount> {
  const response = await apiRequest<{ user: UserAccount }>('/api/auth/me', { token });
  return response.user;
}

export async function fetchUsers(): Promise<UserAccount[]> {
  const response = await apiRequest<{ users: UserAccount[] }>('/api/users');
  return response.users;
}

export async function createUser(account: Omit<UserAccount, 'id'>): Promise<UserAccount> {
  const response = await apiRequest<{ user: UserAccount }>('/api/users', {
    method: 'POST',
    body: JSON.stringify(account),
  });
  return response.user;
}

export async function updateUser(accountId: string, account: Partial<UserAccount>): Promise<UserAccount> {
  const response = await apiRequest<{ user: UserAccount }>(`/api/users/${accountId}`, {
    method: 'PATCH',
    body: JSON.stringify(account),
  });
  return response.user;
}

export async function fetchCrmData(): Promise<CrmData> {
  const [customers, team, tickets, tasks] = await Promise.all([fetchCustomers(), fetchTeamMembers(), fetchTickets(), fetchTasks()]);

  return { customers, team, tickets, tasks };
}

export async function fetchPortalData(): Promise<CrmData> {
  const [customers, tickets] = await Promise.all([fetchCustomers(), fetchTickets()]);

  return { customers, tickets, tasks: [], team: [] };
}

export async function fetchCustomers(): Promise<Customer[]> {
  const response = await apiRequest<{ customers: unknown[] }>('/api/customers');
  return response.customers.map(normalizeCustomer);
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const response = await apiRequest<{ team: unknown[] }>('/api/team');
  return response.team.map(normalizeTeamMember);
}

export async function fetchTickets(): Promise<Ticket[]> {
  const response = await apiRequest<{ tickets: unknown[] }>('/api/tickets');
  return response.tickets.map(normalizeTicket);
}

export async function fetchTasks(): Promise<CrmTask[]> {
  const response = await apiRequest<{ tasks: unknown[] }>('/api/tasks');
  return response.tasks.map(normalizeTask);
}

export async function createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
  const response = await apiRequest<{ customer: unknown }>('/api/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  });
  return normalizeCustomer(response.customer);
}

export async function updateCustomer(customerId: string, customer: Omit<Customer, 'id'>): Promise<Customer> {
  const response = await apiRequest<{ customer: unknown }>(`/api/customers/${customerId}`, {
    method: 'PATCH',
    body: JSON.stringify(customer),
  });
  return normalizeCustomer(response.customer);
}

export async function deleteCustomer(customerId: string): Promise<void> {
  await apiRequest<void>(`/api/customers/${customerId}`, { method: 'DELETE' });
}

export async function createTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
  const response = await apiRequest<{ member: unknown }>('/api/team', {
    method: 'POST',
    body: JSON.stringify(member),
  });
  return normalizeTeamMember(response.member);
}

export async function updateTeamMember(memberId: string, member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
  const response = await apiRequest<{ member: unknown }>(`/api/team/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify(member),
  });
  return normalizeTeamMember(response.member);
}

export async function deleteTeamMember(memberId: string): Promise<void> {
  await apiRequest<void>(`/api/team/${memberId}`, { method: 'DELETE' });
}

export async function createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'number' | 'history' | 'createdBy'>, customerId?: string): Promise<Ticket> {
  const response = await apiRequest<{ ticket: unknown }>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify({
      title: ticket.title,
      customerId,
      category: ticket.category,
      priority: ticket.priority,
      description: ticket.description,
    }),
  });
  return normalizeTicket(response.ticket);
}

export async function updateTicket(ticketId: string, data: Partial<Pick<Ticket, 'status' | 'assignedToId'>>): Promise<Ticket> {
  const response = await apiRequest<{ ticket: unknown }>(`/api/tickets/${ticketId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return normalizeTicket(response.ticket);
}

export async function createTask(task: Omit<CrmTask, 'id' | 'createdAt' | 'status' | 'createdBy'>, customerId?: string): Promise<CrmTask> {
  const response = await apiRequest<{ task: unknown }>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: task.title,
      type: task.type,
      customerId,
      ownerId: task.ownerId,
      dueDate: task.dueDate,
      description: task.description,
    }),
  });
  return normalizeTask(response.task);
}

export async function updateTask(taskId: string, data: Partial<Pick<CrmTask, 'status' | 'ownerId' | 'notes'>>): Promise<CrmTask> {
  const response = await apiRequest<{ task: unknown }>(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return normalizeTask(response.task);
}

function normalizeCustomer(value: unknown): Customer {
  const customer = value as Record<string, unknown>;

  return {
    id: getId(customer),
    name: String(customer.name ?? ''),
    contact: String(customer.contact ?? ''),
    email: String(customer.email ?? ''),
    plan: String(customer.plan ?? ''),
    monthlyValue: Number(customer.monthlyValue ?? 0),
    dueDay: Number(customer.dueDay ?? 1),
    nextDueDate: toDateInputValue(customer.nextDueDate),
    status: customer.status as Customer['status'],
    serviceMode: (customer.serviceMode ?? 'solo') as Customer['serviceMode'],
  };
}

function normalizeTeamMember(value: unknown): TeamMember {
  const member = value as Record<string, unknown>;

  return {
    id: getId(member),
    name: String(member.name ?? ''),
    role: String(member.role ?? ''),
  };
}

function normalizeTicket(value: unknown): Ticket {
  const ticket = value as Record<string, unknown>;
  const createdBy = normalizeCreator(ticket.createdBy);
  const customerRef = ticket.customerId as MongoRef;

  return {
    id: getId(ticket),
    number: Number(ticket.number ?? 0),
    title: String(ticket.title ?? ''),
    clientName: getRefName(customerRef),
    category: String(ticket.category ?? ''),
    priority: ticket.priority as Ticket['priority'],
    status: ticket.status as Ticket['status'],
    description: String(ticket.description ?? ''),
    createdAt: toDateInputValue(ticket.createdAt),
    createdBy,
    assignedToId: getRefId(ticket.assignedToId as MongoRef),
    history: Array.isArray(ticket.history)
      ? ticket.history.map((entry) => normalizeTicketHistory(entry))
      : [],
  };
}

function normalizeTask(value: unknown): CrmTask {
  const task = value as Record<string, unknown>;
  const customerRef = task.customerId as MongoRef;

  const hasDescription = typeof task.description === 'string';

  return {
    id: getId(task),
    title: String(task.title ?? ''),
    type: task.type as CrmTask['type'],
    customerName: getRefName(customerRef) || undefined,
    ownerId: getRefId(task.ownerId as MongoRef) ?? '',
    dueDate: toDateInputValue(task.dueDate),
    status: task.status as CrmTask['status'],
    description: String(hasDescription ? task.description : task.notes ?? ''),
    notes: String(hasDescription ? task.notes ?? '' : ''),
    createdAt: toDateInputValue(task.createdAt),
    createdBy: normalizeCreator(task.createdBy),
  };
}

function normalizeTicketHistory(value: unknown): Ticket['history'][number] {
  const entry = value as Record<string, unknown>;

  return {
    id: getId(entry),
    date: toDateInputValue(entry.createdAt),
    title: String(entry.title ?? ''),
    description: String(entry.description ?? ''),
  };
}

function normalizeCreator(value: unknown): Creator {
  const creator = value as Record<string, unknown> | null | undefined;

  if (!creator || typeof creator !== 'object') {
    return {
      id: 'system',
      name: 'Sistema',
      email: 'sistema@roqia.com',
      role: 'superAdmin',
    };
  }

  return {
    id: getId(creator),
    name: String(creator.name ?? 'Sistema'),
    email: String(creator.email ?? 'sistema@roqia.com'),
    role: normalizeRole(creator.role),
    customerId: getRefId(creator.customerId as MongoRef),
  };
}

function normalizeRole(value: unknown): Creator['role'] {
  return value === 'superAdmin' || value === 'admin' || value === 'collaborator' || value === 'client'
    ? value
    : 'client';
}

function getId(value: Record<string, unknown>): string {
  return String(value.id ?? value._id ?? crypto.randomUUID());
}

function getRefId(value: MongoRef): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.id ?? value._id;
}

function getRefName(value: MongoRef): string {
  if (!value || typeof value === 'string') {
    return '';
  }

  return value.name ?? '';
}

function toDateInputValue(value: unknown): string {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function getApiErrorMessage(payload: unknown): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    return String((payload as { message: unknown }).message);
  }

  return 'Nao foi possivel comunicar com o servidor.';
}
