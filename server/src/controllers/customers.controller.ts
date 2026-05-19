import type { Request, Response } from 'express';
import { CustomerModel } from '../models/customer.model.js';
import { customerSchema } from '../validators/schemas.js';
import { HttpError } from '../utils/httpError.js';

export async function listCustomers(req: Request, res: Response) {
  if (req.user?.role === 'client' && !req.user.customerId) {
    res.json({ customers: [] });
    return;
  }

  const query = req.user?.role === 'client' ? { _id: req.user.customerId } : {};
  const customers = await CustomerModel.find(query).sort({ createdAt: -1 });
  res.json({ customers });
}

export async function createCustomer(req: Request, res: Response) {
  const data = customerSchema.parse(req.body);
  const customer = await CustomerModel.create(data);
  res.status(201).json({ customer });
}

export async function updateCustomer(req: Request, res: Response) {
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
  const customer = await CustomerModel.findByIdAndDelete(req.params.id);

  if (!customer) {
    throw new HttpError(404, 'Cliente nao encontrado.');
  }

  res.status(204).send();
}
