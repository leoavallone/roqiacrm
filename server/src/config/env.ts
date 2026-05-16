import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must have at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SEED_ADMIN_NAME: z.string().default('Admin RoqIA'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@roqia.com'),
  SEED_ADMIN_PASSWORD: z.string().min(6).default('admin123'),
});

export const env = envSchema.parse(process.env);
