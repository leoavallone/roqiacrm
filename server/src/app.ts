import cors from 'cors';
import express from 'express';
import path from 'path';
import { env } from './config/env.js';
import { authRoutes } from './routes/auth.routes.js';
import { customersRoutes } from './routes/customers.routes.js';
import { financeRoutes } from './routes/finance.routes.js';
import { tasksRoutes } from './routes/tasks.routes.js';
import { teamRoutes } from './routes/team.routes.js';
import { ticketsRoutes } from './routes/tickets.routes.js';
import { usersRoutes } from './routes/users.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

export function createApp() {
  const app = express();
  const frontendDistPath = path.join(process.cwd(), 'dist');

  app.use(
    cors({
      origin: isOriginAllowed,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/customers', customersRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/tickets', ticketsRoutes);
  app.use('/api/tasks', tasksRoutes);
  app.use('/api/finance', financeRoutes);
  app.use('/api', notFound);

  // Serve the frontend static files in both deployment shapes:
  // - Express container: /app.html and /assets/*
  // - Static-style URL kept by the current site: /dist/app.html and /dist/assets/*
  app.use(express.static(frontendDistPath));
  app.use('/dist', express.static(frontendDistPath));

  // Catch-all route to serve the frontend's index.html for client-side routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDistPath, 'app.html'));
  });

  app.use(errorHandler);

  return app;
}

function isOriginAllowed(origin: string | undefined, callback: (error: Error | null, allowed?: boolean) => void) {
  if (!origin) {
    callback(null, true);
    return;
  }

  const allowedOrigins = env.CORS_ORIGIN
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  allowedOrigins.push('https://crm.roqia.com.br');

  if (allowedOrigins.some((allowedOrigin) => normalizeOrigin(allowedOrigin) === normalizeOrigin(origin))) {
    callback(null, true);
    return;
  }

  callback(null, false);
}

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, '').toLowerCase();
}
