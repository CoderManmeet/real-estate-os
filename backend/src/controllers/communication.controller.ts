import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  createCommunicationSchema,
  updateCommunicationSchema,
  listCommunicationsQuerySchema,
} from '../validators/communication.validator';
import * as communicationService from '../services/communication.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createCommunicationSchema.parse(req.body);
    const data = await communicationService.createCommunication(input, user.userId);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = listCommunicationsQuerySchema.parse(req.query);
    const data = await communicationService.listCommunications(query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updateCommunicationSchema.parse(req.body);
    const data = await communicationService.updateCommunication(getParam(req, 'id'), input);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await communicationService.deleteCommunication(getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Communication log deleted' });
  } catch (err) {
    next(err);
  }
}