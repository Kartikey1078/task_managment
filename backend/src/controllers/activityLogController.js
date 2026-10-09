import * as activityLogService from '../services/activityLogService.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res) {
  const result = await activityLogService.listLogs(req.validated);
  return sendSuccess(res, result.data, 200, result.meta);
}
