import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { UserModel } from '../models/user.model.js';
import type { UserRole } from '../types/domain.js';
import { createUserSchema, updateUserSchema } from '../validators/schemas.js';
import { HttpError } from '../utils/httpError.js';

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

export async function listUsers(_req: Request, res: Response) {
  const users = await UserModel.find().select('name email role customerId').sort({ createdAt: -1 });
  res.json({ users: users.map(serializeUser) });
}

export async function createUser(req: Request, res: Response) {
  const data = createUserSchema.parse(req.body);
  const email = data.email.toLowerCase();
  const existing = await UserModel.findOne({ email });

  if (existing) {
    throw new HttpError(409, 'Ja existe usuario com esse e-mail.');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await UserModel.create({
    name: data.name,
    email,
    passwordHash,
    role: data.role,
    customerId: data.customerId || null,
  });

  res.status(201).json({ user: serializeUser(user) });
}

export async function updateUser(req: Request, res: Response) {
  const data = updateUserSchema.parse(req.body);
  const user = await UserModel.findByIdAndUpdate(
    req.params.id,
    {
      ...data,
      customerId: data.customerId || null,
    },
    { new: true, runValidators: true },
  ).select('name email role customerId');

  if (!user) {
    throw new HttpError(404, 'Usuario nao encontrado.');
  }

  res.json({ user: serializeUser(user) });
}

export async function deleteUser(req: Request, res: Response) {
  if (req.user?.id === req.params.id) {
    throw new HttpError(400, 'Voce nao pode excluir o proprio usuario logado.');
  }

  const user = await UserModel.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new HttpError(404, 'Usuario nao encontrado.');
  }

  res.status(204).send();
}
