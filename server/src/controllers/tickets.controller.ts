import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { CounterModel } from '../models/counter.model.js';
import { CustomerModel } from '../models/customer.model.js';
import { TicketModel } from '../models/ticket.model.js';
import { createTicketSchema, updateTicketSchema } from '../validators/schemas.js';
import { HttpError } from '../utils/httpError.js';

async function getNextTicketNumber() {
  const counter = await CounterModel.findOneAndUpdate(
    { key: 'ticket' },
    { $inc: { value: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  if (!counter) {
    throw new HttpError(500, 'Nao foi possivel gerar o numero do chamado.');
  }

  return counter.value;
}

export async function listTickets(req: Request, res: Response) {
  const query: Record<string, unknown> = {};

  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  if (req.query.customerId) query.customerId = req.query.customerId;
  if (req.query.assignedToId === 'none') query.assignedToId = null;
  if (req.query.assignedToId && req.query.assignedToId !== 'none') query.assignedToId = req.query.assignedToId;
  if (req.user?.role === 'client') query.customerId = req.user.customerId;

  const tickets = await TicketModel.find(query)
    .populate('customerId', 'name')
    .populate('createdBy', 'name email role customerId')
    .populate('assignedToId', 'name role')
    .sort({ createdAt: -1 });

  res.json({ tickets });
}

export async function createTicket(req: Request, res: Response) {
  if (!req.user) throw new HttpError(401, 'Usuario nao autenticado.');

  const data = createTicketSchema.parse(req.body);
  const customerId = req.user.role === 'admin' ? data.customerId : req.user.customerId;

  if (!customerId) {
    throw new HttpError(400, 'Usuario sem cliente vinculado.');
  }

  const customer = await CustomerModel.findById(customerId);

  if (!customer) {
    throw new HttpError(404, 'Cliente nao encontrado.');
  }

  const ticket = await TicketModel.create({
    ...data,
    customerId,
    number: await getNextTicketNumber(),
    createdBy: req.user.id,
    assignedToId: null,
    history: [
      {
        title: 'Chamado aberto',
        description: data.description,
        createdBy: req.user.id,
      },
    ],
  });

  res.status(201).json({ ticket });
}

export async function updateTicket(req: Request, res: Response) {
  if (!req.user) throw new HttpError(401, 'Usuario nao autenticado.');

  const data = updateTicketSchema.parse(req.body);
  const ticket = await TicketModel.findById(req.params.id);

  if (!ticket) {
    throw new HttpError(404, 'Chamado nao encontrado.');
  }

  if (data.status && data.status !== ticket.status) {
    ticket.history.unshift({
      title: 'Status atualizado',
      description: `Status alterado de ${ticket.status} para ${data.status}.`,
      createdBy: req.user.id,
    });
    ticket.status = data.status;
  }

  if ('assignedToId' in data) {
    ticket.assignedToId = data.assignedToId ? new Types.ObjectId(data.assignedToId) : null;
  }

  await ticket.save();
  res.json({ ticket });
}

export async function deleteTicket(req: Request, res: Response) {
  const ticket = await TicketModel.findByIdAndDelete(req.params.id);

  if (!ticket) {
    throw new HttpError(404, 'Chamado nao encontrado.');
  }

  res.status(204).send();
}
