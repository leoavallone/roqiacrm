import { Router } from 'express';
import { login, me } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRoutes = Router();

authRoutes.post('/login', asyncHandler(login));
authRoutes.get('/me', authenticate, asyncHandler(me));
