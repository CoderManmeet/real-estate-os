// src/controllers/revenue.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { revenueQuerySchema } from '../validators/revenue.validator';
import * as revenueService from '../services/revenue.service';

export async function summary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = revenueQuerySchema.parse(req.query);
    const data = await revenueService.getRevenueSummary(query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function commissions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await revenueService.getCommissionBreakdown();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function pendingPayments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await revenueService.getPendingPayments();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}