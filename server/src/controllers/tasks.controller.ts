import type { Request, Response } from 'express';
import { CustomerModel } from '../models/customer.model.js';
import { TaskModel } from '../models/task.model.js';
import { createTaskSchema, updateTaskSchema } from '../validators/schemas.js';
import { HttpError } from '../utils/httpError.js';

export async function listTasks(req: Request, res: Response) {
  const query: Record<string, unknown> = {};

  if (req.user?.role === 'admin') {
    const partnershipCustomers = await CustomerModel.find({ serviceMode: 'partnership' }).select('_id');
    const customerIds = partnershipCustomers.map((customer) => customer._id);
    query.$or = [{ customerId: { $in: customerIds } }, { customerId: null }];
  }

  const tasks = await TaskModel.find(query)
    .populate('customerId', 'name')
    .populate('ownerId', 'name role')
    .populate('createdBy', 'name email role')
    .sort({ dueDate: 1 });
  res.json({ tasks });
}

export async function createTask(req: Request, res: Response) {
  if (!req.user) throw new HttpError(401, 'Usuario nao autenticado.');

  const data = createTaskSchema.parse(req.body);

  if (req.user.role === 'admin' && data.customerId) {
    const customer = await CustomerModel.findById(data.customerId).select('serviceMode');

    if (customer?.serviceMode !== 'partnership') {
      throw new HttpError(403, 'Admin acessa apenas clientes de parceria.');
    }
  }

  const task = await TaskModel.create({
    ...data,
    customerId: data.customerId || null,
    createdBy: req.user.id,
  });

  res.status(201).json({ task });
}

export async function updateTask(req: Request, res: Response) {
  const data = updateTaskSchema.parse(req.body);

  if (req.user?.role === 'collaborator' && Object.keys(data).some((key) => key !== 'status')) {
    throw new HttpError(403, 'Colaborador pode alterar apenas o status da tarefa.');
  }

  const task = await TaskModel.findById(req.params.id);

  if (!task) {
    throw new HttpError(404, 'Tarefa nao encontrada.');
  }

  if (req.user?.role === 'admin') {
    const customerId = data.customerId ?? task.customerId?.toString();
    const customer = customerId ? await CustomerModel.findById(customerId).select('serviceMode') : null;

    if (customer && customer.serviceMode !== 'partnership') {
      throw new HttpError(403, 'Admin acessa apenas clientes de parceria.');
    }
  }

  task.set({
    ...data,
    ...('customerId' in data ? { customerId: data.customerId || null } : {}),
  });
  await task.save();

  res.json({ task });
}

export async function deleteTask(req: Request, res: Response) {
  const task = await TaskModel.findById(req.params.id);

  if (!task) {
    throw new HttpError(404, 'Tarefa nao encontrada.');
  }

  if (req.user?.role === 'admin' && task.customerId) {
    const customer = await CustomerModel.findById(task.customerId).select('serviceMode');

    if (customer?.serviceMode !== 'partnership') {
      throw new HttpError(403, 'Admin acessa apenas clientes de parceria.');
    }
  }

  await task.deleteOne();
  res.status(204).send();
}
