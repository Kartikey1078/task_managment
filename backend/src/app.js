import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { csrfProtection } from './middleware/csrf.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import apiRoutes from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(
    helmet({
      // API is called from the Vite origin (different port); CORP same-origin blocks that.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        const allowed = new Set([
          env.frontendUrl,
          'http://localhost:5173',
          'http://127.0.0.1:5173',
        ]);
        if (allowed.has(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(csrfProtection);

  app.use('/api', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
