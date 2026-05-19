import type { Request, Response } from 'express';
import { CustomerModel } from '../models/customer.model.js';
import { getCustomerScope } from '../utils/access.js';

export async function getFinanceSummary(req: Request, res: Response) {
  const query = getCustomerScope(req) ?? { _id: null };
  const customers = await CustomerModel.find(query);
  const monthlyRevenue = customers.reduce((sum, customer) => sum + customer.monthlyValue, 0);
  const pendingCustomers = customers.filter((customer) => customer.status !== 'Ativa').length;

  res.json({
    monthlyRevenue,
    pendingCustomers,
    customers,
  });
}
