import { Router } from 'express';
import { createTicket, deleteTicket, listTickets, updateTicket } from '../controllers/tickets.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const ticketsRoutes = Router();

ticketsRoutes.use(authenticate);
ticketsRoutes.get('/', asyncHandler(listTickets));
ticketsRoutes.post('/', asyncHandler(createTicket));
ticketsRoutes.patch('/:id', authorize('admin'), asyncHandler(updateTicket));
ticketsRoutes.delete('/:id', authorize('admin'), asyncHandler(deleteTicket));
