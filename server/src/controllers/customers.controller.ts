import type { Request, Response } from 'express';
import { CustomerModel } from '../models/customer.model.js';
import { customerSchema } from '../validators/schemas.js';
import { HttpError } from '../utils/httpError.js';
import { canManageAll, getCustomerScope } from '../utils/access.js';
import { env } from '../config/env.js';

function getNextDueDate(dueDay: number, currentDueDate?: Date | null): Date {
  const now = new Date();
  const current = currentDueDate || now;
  const year = current.getUTCFullYear();
  const month = current.getUTCMonth() + 1;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(dueDay >= 1 && dueDay <= 31 ? dueDay : current.getUTCDate(), lastDay);
  return new Date(Date.UTC(year, month, day));
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function listCustomers(req: Request, res: Response) {
  const query = getCustomerScope(req);

  if (!query) {
    res.json({ customers: [] });
    return;
  }

  const customers = await CustomerModel.find(query).sort({ createdAt: -1 });
  res.json({ customers });
}

export async function createCustomer(req: Request, res: Response) {
  if (!canManageAll(req)) {
    throw new HttpError(403, 'Apenas super admin pode criar clientes.');
  }

  const data = customerSchema.parse(req.body);
  const customer = await CustomerModel.create(data);
  res.status(201).json({ customer });
}

export async function updateCustomer(req: Request, res: Response) {
  if (!canManageAll(req)) {
    throw new HttpError(403, 'Apenas super admin pode editar clientes.');
  }

  const data = customerSchema.partial().parse(req.body);
  const customer = await CustomerModel.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  if (!customer) {
    throw new HttpError(404, 'Cliente nao encontrado.');
  }

  res.json({ customer });
}

export async function deleteCustomer(req: Request, res: Response) {
  if (!canManageAll(req)) {
    throw new HttpError(403, 'Apenas super admin pode excluir clientes.');
  }

  const customer = await CustomerModel.findByIdAndDelete(req.params.id);

  if (!customer) {
    throw new HttpError(404, 'Cliente nao encontrado.');
  }

  res.status(204).send();
}

export async function markCustomerAsPaid(req: Request, res: Response) {
  if (!canManageAll(req)) {
    throw new HttpError(403, 'Apenas super admin pode registrar pagamentos.');
  }

  const customer = await CustomerModel.findById(req.params.id);
  if (!customer) {
    throw new HttpError(404, 'Cliente nao encontrado.');
  }
  if (!customer.oneAppOrganizationId) {
    throw new HttpError(400, 'Informe o ID do estabelecimento no OneApp antes de registrar o pagamento.');
  }
  if (!env.ONEAPP_ADMIN_API_KEY) {
    throw new HttpError(503, 'Integracao com o OneApp nao configurada no servidor do CRM.');
  }

  const nextDueDate = getNextDueDate(customer.dueDay, customer.nextDueDate);
  const oneAppResponse = await fetch(
    `${env.ONEAPP_API_URL.replace(/\/$/, '')}/api/admin/organizations/${customer.oneAppOrganizationId}/monthly-fee`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': env.ONEAPP_ADMIN_API_KEY,
      },
      body: JSON.stringify({ dueDate: toDateOnly(nextDueDate) }),
    },
  );

  if (!oneAppResponse.ok) {
    const payload = await oneAppResponse.json().catch(() => ({})) as { error?: string };
    throw new HttpError(502, payload.error || 'Nao foi possivel atualizar o vencimento no OneApp.');
  }

  customer.nextDueDate = nextDueDate;
  customer.status = 'Ativa';
  await customer.save();
  res.json({ customer });
}
