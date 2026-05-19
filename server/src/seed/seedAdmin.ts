import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';

export async function seedAdmin() {
  const existingAdmin = await UserModel.findOne({ email: env.SEED_ADMIN_EMAIL.toLowerCase() });

  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12);

  await UserModel.create({
    name: env.SEED_ADMIN_NAME,
    email: env.SEED_ADMIN_EMAIL,
    passwordHash,
    role: 'superAdmin',
  });
}
