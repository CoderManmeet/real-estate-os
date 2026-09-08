import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { searchQuerySchema } from '../validators/search.validator';
import * as searchService from '../services/search.service';

export async function search(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = searchQuerySchema.parse(req.query);
    const data = await searchService.globalSearch(query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}