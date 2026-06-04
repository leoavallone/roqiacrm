import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';

await connectDatabase();
try {
  await UserModel.deleteMany({});

  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12);

  await UserModel.create({
    name: env.SEED_ADMIN_NAME,
    email: env.SEED_ADMIN_EMAIL,
    passwordHash,
    role: 'superAdmin',
    customerId: null,
  });

  console.log(`Usuarios resetados. Super admin criado: ${env.SEED_ADMIN_EMAIL}`);
} finally {
  await mongoose.disconnect();
}
