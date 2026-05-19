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

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
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

  // Serve the frontend static files
  app.use(express.static(path.join(process.cwd(), 'dist')));
  
  // Catch-all route to serve the frontend's index.html for client-side routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'app.html'));
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
