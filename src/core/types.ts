export type TicketStatus = 'Aberto' | 'Em andamento' | 'Resolvido';
export type TicketPriority = 'Baixa' | 'Media' | 'Alta' | 'Urgente';
export type TaskStatus = 'Pendente' | 'Em andamento' | 'Concluida';
export type TaskType = 'Cliente' | 'RoqIA' | 'Prototipo' | 'Melhoria';
export type SubscriptionStatus = 'Ativa' | 'Pendente' | 'Vencida';
export type UserRole = 'admin' | 'client';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  customerId?: string;
}

export interface Creator {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  customerId?: string;
}

export interface TicketHistoryEntry {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface Ticket {
  id: string;
  number: number;
  title: string;
  clientName: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  createdAt: string;
  createdBy: Creator;
  assignedToId?: string;
  history: TicketHistoryEntry[];
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  plan: string;
  monthlyValue: number;
  dueDay: number;
  nextDueDate: string;
  status: SubscriptionStatus;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export interface CrmTask {
  id: string;
  title: string;
  type: TaskType;
  customerName?: string;
  ownerId: string;
  dueDate: string;
  status: TaskStatus;
  notes: string;
  createdAt: string;
  createdBy: Creator;
}

export interface CrmData {
  tickets: Ticket[];
  customers: Customer[];
  tasks: CrmTask[];
  team: TeamMember[];
}
