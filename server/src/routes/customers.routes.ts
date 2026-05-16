import { Router } from 'express';
import { createCustomer, deleteCustomer, listCustomers, updateCustomer } from '../controllers/customers.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const customersRoutes = Router();

customersRoutes.use(authenticate, authorize('admin'));
customersRoutes.get('/', asyncHandler(listCustomers));
customersRoutes.post('/', asyncHandler(createCustomer));
customersRoutes.patch('/:id', asyncHandler(updateCustomer));
customersRoutes.delete('/:id', asyncHandler(deleteCustomer));
