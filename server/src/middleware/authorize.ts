import type { RequestHandler } from 'express';
import type { UserRole } from '../types/domain.js';
import { HttpError } from '../utils/httpError.js';

export function authorize(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, 'Usuario nao autenticado.'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, 'Acesso negado.'));
      return;
    }

    next();
  };
}
