import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';

export async function createNotification(userId: string, title: string, message: string) {
  return prisma.notification.create({ data: { userId, title, message } });
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    throw new AppError('Notification not found', 404);
  }
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}