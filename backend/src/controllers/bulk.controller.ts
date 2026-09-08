import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { bulkLeadsSchema, bulkClientsSchema } from '../validators/bulk.validator';
import * as bulkService from '../services/bulk.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function bulkLeads(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = bulkLeadsSchema.parse(req.body);
    const data = await bulkService.bulkLeads(input, user.userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function bulkClients(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = bulkClientsSchema.parse(req.body);
    const data = await bulkService.bulkClients(input, user.userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}