import dotenv from 'dotenv';

dotenv.config();

const required = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  isProduction: process.env.NODE_ENV === 'production',
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  loginRateLimit: {
    enabled:
      process.env.LOGIN_RATE_LIMIT_ENABLED === 'true' ||
      (process.env.NODE_ENV === 'production' &&
        process.env.LOGIN_RATE_LIMIT_ENABLED !== 'false'),
    windowMs:
      (Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MIN) || 15) * 60 * 1000,
    max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
  },
};
