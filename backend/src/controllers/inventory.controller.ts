import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import { updateStatusSchema, bulkUpdateStatusSchema } from '../validators/inventory.validator';
import * as inventoryService from '../services/inventory.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = updateStatusSchema.parse(req.body);
    const property = await inventoryService.updatePropertyStatus(
      getParam(req, 'id'),
      input,
      user.userId
    );
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

export async function bulkUpdateStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = bulkUpdateStatusSchema.parse(req.body);
    const results = await inventoryService.bulkUpdateStatus(input, user.userId);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
}

export async function statusHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const history = await inventoryService.getStatusHistory(getParam(req, 'id'));
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function projectInventory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const inventory = await inventoryService.getProjectInventory(getParam(req, 'id'));
    res.status(200).json({ success: true, data: inventory });
  } catch (err) {
    next(err);
  }
}