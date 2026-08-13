import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getParam } from '../utils/getParam';
import { AppError } from '../utils/AppError';
import { aiSearch, aiSummary } from '../services/ai.service';

export async function search(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new AppError('query is required', 400);
    }
    const result = await aiSearch(query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function summary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await aiSummary(getParam(req, 'propertyId'));
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}