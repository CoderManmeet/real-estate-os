import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import * as notificationService from '../services/notification.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const notifications = await notificationService.listNotifications(user.userId);
    const unreadCount = await notificationService.getUnreadCount(user.userId);
    res.status(200).json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const notification = await notificationService.markAsRead(getParam(req, 'id'), user.userId);
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    await notificationService.markAllAsRead(user.userId);
    res.status(200).json({ success: true, message: 'All notifications marked read' });
  } catch (err) {
    next(err);
  }
}