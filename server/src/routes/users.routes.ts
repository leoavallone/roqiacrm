import { Router } from 'express';
import { createUser, deleteUser, listUsers, updateUser } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const usersRoutes = Router();

usersRoutes.use(authenticate, authorize('admin'));
usersRoutes.get('/', asyncHandler(listUsers));
usersRoutes.post('/', asyncHandler(createUser));
usersRoutes.patch('/:id', asyncHandler(updateUser));
usersRoutes.delete('/:id', asyncHandler(deleteUser));
