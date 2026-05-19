import type { Request, Response } from 'express';
import { CustomerModel } from '../models/customer.model.js';
import { customerSchema } from '../validators/schemas.js';
import { HttpError } from '../utils/httpError.js';
import { canManageAll, getCustomerScope } from '../utils/access.js';

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
