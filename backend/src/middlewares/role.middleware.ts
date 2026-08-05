import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AppError } from '../utils/AppError';

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
}