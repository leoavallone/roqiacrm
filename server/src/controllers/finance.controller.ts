import type { Request, Response } from 'express';
import { CustomerModel } from '../models/customer.model.js';

export async function getFinanceSummary(_req: Request, res: Response) {
  const customers = await CustomerModel.find();
  const monthlyRevenue = customers.reduce((sum, customer) => sum + customer.monthlyValue, 0);
  const pendingCustomers = customers.filter((customer) => customer.status !== 'Ativa').length;

  res.json({
    monthlyRevenue,
    pendingCustomers,
    customers,
  });
}
