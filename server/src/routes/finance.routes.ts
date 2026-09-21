import { Router } from 'express';
import { createFinanceTransaction, deleteFinanceTransaction, getFinanceSummary, listFinanceTransactions } from '../controllers/finance.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const financeRoutes = Router();

financeRoutes.use(authenticate, authorize('superAdmin', 'admin'));
financeRoutes.get('/summary', asyncHandler(getFinanceSummary));
financeRoutes.get('/transactions', asyncHandler(listFinanceTransactions));
financeRoutes.post('/transactions', asyncHandler(createFinanceTransaction));
financeRoutes.delete('/transactions/:id', asyncHandler(deleteFinanceTransaction));
