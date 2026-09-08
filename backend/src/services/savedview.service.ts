import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreateSavedViewInput,
  UpdateSavedViewInput,
  ListSavedViewsQuery,
} from '../validators/savedview.validator';

// Saved views (V2.1): per-user, per-entity serialized filter configs. `config` is an
// opaque JSON blob the frontend defines (filters, sort, columns); the backend just
// persists and scopes it to the owner.
export async function listSavedViews(userId: string, query: ListSavedViewsQuery) {
  return prisma.savedView.findMany({
    where: { userId, ...(query.entity ? { entity: query.entity } : {}) },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createSavedView(userId: string, input: CreateSavedViewInput) {
  return prisma.savedView.create({
    data: {
      userId,
      name: input.name,
      entity: input.entity,
      config: input.config as unknown as Prisma.InputJsonValue,
    },
  });
}

async function assertOwned(id: string, userId: string) {
  const view = await prisma.savedView.findUnique({ where: { id } });
  if (!view || view.userId !== userId) throw new AppError('Saved view not found', 404);
  return view;
}

export async function updateSavedView(id: string, userId: string, input: UpdateSavedViewInput) {
  await assertOwned(id, userId);
  return prisma.savedView.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.config !== undefined && {
        config: input.config as unknown as Prisma.InputJsonValue,
      }),
    },
  });
}

export async function deleteSavedView(id: string, userId: string) {
  await assertOwned(id, userId);
  await prisma.savedView.delete({ where: { id } });
}