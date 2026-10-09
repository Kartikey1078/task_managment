import { pingDatabase } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';

export async function health(_req, res) {
  let dbStatus = 'disconnected';
  try {
    await pingDatabase();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  return sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: dbStatus,
  });
}
