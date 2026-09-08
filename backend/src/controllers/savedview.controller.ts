import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  listSavedViewsQuerySchema,
  createSavedViewSchema,
  updateSavedViewSchema,
} from '../validators/savedview.validator';
import * as savedViewService from '../services/savedview.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const query = listSavedViewsQuerySchema.parse(req.query);
    const data = await savedViewService.listSavedViews(user.userId, query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createSavedViewSchema.parse(req.body);
    const data = await savedViewService.createSavedView(user.userId, input);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = updateSavedViewSchema.parse(req.body);
    const data = await savedViewService.updateSavedView(getParam(req, 'id'), user.userId, input);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    await savedViewService.deleteSavedView(getParam(req, 'id'), user.userId);
    res.status(200).json({ success: true, message: 'Saved view deleted' });
  } catch (err) {
    next(err);
  }
}