import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  listFollowUpsQuerySchema,
  createFollowUpSchema,
  updateFollowUpSchema,
} from '../validators/followup.validator';
import * as followUpService from '../services/followup.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const query = listFollowUpsQuerySchema.parse(req.query);
    const data = await followUpService.listFollowUps(query, user.userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createFollowUpSchema.parse(req.body);
    const followUp = await followUpService.createFollowUp(input, user.userId);
    res.status(201).json({ success: true, data: followUp });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updateFollowUpSchema.parse(req.body);
    const followUp = await followUpService.updateFollowUp(getParam(req, 'id'), input);
    res.status(200).json({ success: true, data: followUp });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await followUpService.deleteFollowUp(getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Follow-up deleted' });
  } catch (err) {
    next(err);
  }
}