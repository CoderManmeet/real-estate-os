// src/controllers/commission.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  upsertCommissionSchema,
  updateCommissionSchema,
} from '../validators/commission.validator';
import * as commissionService from '../services/commission.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function upsert(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = upsertCommissionSchema.parse(req.body);
    const commission = await commissionService.upsertCommission(input, user.userId);
    res.status(200).json({ success: true, data: commission });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const commissions = await commissionService.listCommissions();
    res.status(200).json({ success: true, data: commissions });
  } catch (err) {
    next(err);
  }
}

export async function getByDeal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const commission = await commissionService.getCommissionByDeal(getParam(req, 'dealId'));
    res.status(200).json({ success: true, data: commission });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updateCommissionSchema.parse(req.body);
    const commission = await commissionService.updateCommission(getParam(req, 'id'), input);
    res.status(200).json({ success: true, data: commission });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await commissionService.deleteCommission(getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Commission deleted' });
  } catch (err) {
    next(err);
  }
}