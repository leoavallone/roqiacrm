import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { UserModel } from '../models/user.model.js';
import type { UserRole } from '../types/domain.js';
import { loginSchema } from '../validators/schemas.js';
import { HttpError } from '../utils/httpError.js';
import { signAuthToken } from '../services/token.service.js';

function serializeUser(user: {
  id?: string;
  _id: { toString(): string };
  name: string;
  email: string;
  role: UserRole;
  customerId?: { toString(): string } | null;
}) {
  return {
    id: user.id ?? user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    customerId: user.customerId?.toString(),
  };
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await UserModel.findOne({ email: data.email.toLowerCase() });

  if (!user) {
    throw new HttpError(401, 'E-mail ou senha invalidos.');
  }

  const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordMatches) {
    throw new HttpError(401, 'E-mail ou senha invalidos.');
  }

  const token = signAuthToken({ sub: user.id, role: user.role });
  res.json({ token, user: serializeUser(user) });
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user });
}
