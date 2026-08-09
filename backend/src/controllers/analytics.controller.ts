import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as analyticsService from '../services/analytics.service';

export async function overview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getOverview();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function inventory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getInventoryBreakdown();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function leadFunnel(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getLeadFunnel();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function revenueByMonth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getRevenueByMonth();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function builderPerformance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getBuilderPerformance();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function conversionRate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getConversionRate();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}