import type { Request, Response } from 'express';
import { CustomerModel } from '../models/customer.model.js';
import { FinanceTransactionModel } from '../models/financeTransaction.model.js';
import { getCustomerScope } from '../utils/access.js';
import { financeTransactionSchema } from '../validators/schemas.js';
import { HttpError } from '../utils/httpError.js';

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

export async function listFinanceTransactions(_req: Request, res: Response) {
  const transactions = await FinanceTransactionModel.find().sort({ date: -1, createdAt: -1 });
  res.json({ transactions });
}

export async function createFinanceTransaction(req: Request, res: Response) {
  const data = financeTransactionSchema.parse(req.body);
  const transaction = await FinanceTransactionModel.create(data);
  res.status(201).json({ transaction });
}

export async function deleteFinanceTransaction(req: Request, res: Response) {
  const transaction = await FinanceTransactionModel.findByIdAndDelete(req.params.id);

  if (!transaction) {
    throw new HttpError(404, 'Lancamento nao encontrado.');
  }

  res.status(204).send();
}
