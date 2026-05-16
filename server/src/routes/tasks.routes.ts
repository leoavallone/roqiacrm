import { Router } from 'express';
import { createTask, deleteTask, listTasks, updateTask } from '../controllers/tasks.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const tasksRoutes = Router();

tasksRoutes.use(authenticate, authorize('admin'));
tasksRoutes.get('/', asyncHandler(listTasks));
tasksRoutes.post('/', asyncHandler(createTask));
tasksRoutes.patch('/:id', asyncHandler(updateTask));
tasksRoutes.delete('/:id', asyncHandler(deleteTask));
