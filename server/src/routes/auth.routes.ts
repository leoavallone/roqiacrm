import { Router } from 'express';
import { login, me, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRoutes = Router();

authRoutes.post('/register', asyncHandler(register));
authRoutes.post('/login', asyncHandler(login));
authRoutes.get('/me', authenticate, asyncHandler(me));
