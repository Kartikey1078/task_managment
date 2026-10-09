import * as userService from '../services/userService.js';
import { sendSuccess } from '../utils/response.js';

export async function listAssignees(req, res) {
  const users = await userService.listAssignees(req.user);
  return sendSuccess(res, users);
}

export async function list(req, res) {
  const result = await userService.listUsers(req.user, req.validated);
  return sendSuccess(res, result.data, 200, result.meta);
}

export async function getById(req, res) {
  const user = await userService.getUserById(req.user, req.validatedParams.id);
  return sendSuccess(res, user);
}

export async function create(req, res) {
  const user = await userService.createUser(req.user, req.validated);
  return sendSuccess(res, user, 201);
}

export async function update(req, res) {
  const user = await userService.updateUser(
    req.user,
    req.validatedParams.id,
    req.validated,
  );
  return sendSuccess(res, user);
}

export async function patchStatus(req, res) {
  const user = await userService.patchUserStatus(
    req.user,
    req.validatedParams.id,
    req.validated.is_active,
  );
  return sendSuccess(res, user);
}
