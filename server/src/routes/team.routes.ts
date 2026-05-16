import { Router } from 'express';
import { createTeamMember, deleteTeamMember, listTeamMembers, updateTeamMember } from '../controllers/team.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const teamRoutes = Router();

teamRoutes.use(authenticate, authorize('admin'));
teamRoutes.get('/', asyncHandler(listTeamMembers));
teamRoutes.post('/', asyncHandler(createTeamMember));
teamRoutes.patch('/:id', asyncHandler(updateTeamMember));
teamRoutes.delete('/:id', asyncHandler(deleteTeamMember));
