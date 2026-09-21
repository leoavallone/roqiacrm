import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ObjectId invalido.');
const userRoleSchema = z.enum(['superAdmin', 'admin', 'collaborator', 'client']);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: userRoleSchema.default('client'),
  customerId: objectIdSchema.optional().or(z.literal('')),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: userRoleSchema.optional(),
  customerId: objectIdSchema.optional().or(z.literal('')).nullable(),
});

export const customerSchema = z.object({
  name: z.string().default(''),
  contact: z.string().default(''),
  email: z.union([z.string().email(), z.literal('')]).default(''),
  contractDuration: z.string().default(''),
  monthlyValue: z.coerce.number().min(0).default(0),
  dueDay: z.coerce.number().min(0).max(31).default(0),
  nextDueDate: z.preprocess((value) => value === '' ? null : value, z.coerce.date().nullable()).default(null),
  status: z.enum(['Ativa', 'Inativo', 'Pendente', 'Vencida']).default('Ativa'),
  serviceMode: z.enum(['solo', 'partnership']).default('solo'),
});

export const financeTransactionSchema = z.object({
  type: z.enum(['Entrada', 'Saida']),
  description: z.string().min(1),
  value: z.coerce.number().positive(),
  date: z.coerce.date(),
});

export const teamMemberSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  active: z.boolean().optional(),
});

export const createTicketSchema = z.object({
  title: z.string().min(3),
  customerId: objectIdSchema.optional(),
  category: z.string().min(2).default('Suporte'),
  priority: z.enum(['Baixa', 'Media', 'Alta', 'Urgente']).default('Media'),
  description: z.string().min(5),
});

export const updateTicketSchema = z.object({
  status: z.enum(['Aberto', 'Em andamento', 'Resolvido']).optional(),
  assignedToId: objectIdSchema.optional().or(z.literal('')).nullable(),
});

export const createTaskSchema = z.object({
  title: z.string().min(3),
  type: z.enum(['Cliente', 'RoqIA', 'Prototipo', 'Melhoria']).default('RoqIA'),
  customerId: objectIdSchema.optional().or(z.literal('')).nullable(),
  ownerId: objectIdSchema,
  dueDate: z.coerce.date(),
  description: z.string().default(''),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  type: z.enum(['Cliente', 'RoqIA', 'Prototipo', 'Melhoria']).optional(),
  customerId: objectIdSchema.optional().or(z.literal('')).nullable(),
  ownerId: objectIdSchema.optional(),
  dueDate: z.coerce.date().optional(),
  status: z.enum(['Pendente', 'Em andamento', 'Impedimento', 'Concluida']).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});
