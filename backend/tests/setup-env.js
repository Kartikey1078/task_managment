import dotenv from 'dotenv';

dotenv.config();

process.env.NODE_ENV = 'test';
process.env.LOGIN_RATE_LIMIT_ENABLED = 'false';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-jwt-secret-at-least-32-chars';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_PORT = process.env.DB_PORT || '3308';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'devroot';
process.env.DB_NAME = process.env.DB_NAME || 'task_management';
