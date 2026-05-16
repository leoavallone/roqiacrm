import type { Request, Response } from 'express';
import { TaskModel } from '../models/task.model.js';
import { createTaskSchema, updateTaskSchema } from '../validators/schemas.js';
import { HttpError } from '../utils/httpError.js';

export async function listTasks(_req: Request, res: Response) {
  const tasks = await TaskModel.find()
    .populate('customerId', 'name')
    .populate('ownerId', 'name role')
    .populate('createdBy', 'name email role')
    .sort({ dueDate: 1 });
  res.json({ tasks });
}

export async function createTask(req: Request, res: Response) {
  if (!req.user) throw new HttpError(401, 'Usuario nao autenticado.');

  const data = createTaskSchema.parse(req.body);
  const task = await TaskModel.create({
    ...data,
    customerId: data.customerId || null,
    createdBy: req.user.id,
  });

  res.status(201).json({ task });
}

export async function updateTask(req: Request, res: Response) {
  const data = updateTaskSchema.parse(req.body);
  const task = await TaskModel.findByIdAndUpdate(
    req.params.id,
    { ...data, customerId: data.customerId || null },
    { new: true, runValidators: true },
  );

  if (!task) {
    throw new HttpError(404, 'Tarefa nao encontrada.');
  }

  res.json({ task });
}

export async function deleteTask(req: Request, res: Response) {
  const task = await TaskModel.findByIdAndDelete(req.params.id);

  if (!task) {
    throw new HttpError(404, 'Tarefa nao encontrada.');
  }

  res.status(204).send();
}
