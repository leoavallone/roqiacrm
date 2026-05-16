import type { RequestHandler } from 'express';
import { UserModel } from '../models/user.model.js';
import type { UserRole } from '../types/domain.js';
import { HttpError } from '../utils/httpError.js';
import { verifyAuthToken } from '../services/token.service.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      customerId?: string;
    };
  }
}

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new HttpError(401, 'Token de autenticacao ausente.');
    }

    const payload = verifyAuthToken(token);
    const user = await UserModel.findById(payload.sub).select('name email role customerId');

    if (!user) {
      throw new HttpError(401, 'Usuario nao encontrado.');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      customerId: user.customerId?.toString(),
    };

    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, 'Token invalido.'));
  }
};
