import * as taskService from '../services/taskService.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res) {
  const result = await taskService.listTasks(req.user, req.validated);
  return sendSuccess(res, result.data, 200, result.meta);
}

export async function stats(req, res) {
  const stats = await taskService.getTaskStats(req.user);
  return sendSuccess(res, stats);
}

export async function getById(req, res) {
  const task = await taskService.getTaskById(req.user, req.validatedParams.id);
  return sendSuccess(res, task);
}

export async function create(req, res) {
  const task = await taskService.createTask(req.user, req.validated);
  return sendSuccess(res, task, 201);
}

export async function update(req, res) {
  const task = await taskService.updateTask(
    req.user,
    req.validatedParams.id,
    req.validated,
  );
  return sendSuccess(res, task);
}

export async function patchStatus(req, res) {
  const task = await taskService.patchTaskStatus(
    req.user,
    req.validatedParams.id,
    req.validated.status,
  );
  return sendSuccess(res, task);
}

export async function remove(req, res) {
  const result = await taskService.deleteTask(req.user, req.validatedParams.id);
  return sendSuccess(res, result);
}
