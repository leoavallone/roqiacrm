import { Router } from 'express';
import { getFinanceSummary } from '../controllers/finance.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const financeRoutes = Router();

financeRoutes.use(authenticate, authorize('admin'));
financeRoutes.get('/summary', asyncHandler(getFinanceSummary));
