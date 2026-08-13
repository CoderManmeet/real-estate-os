import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { createNotification } from './notification.service';
import { UpdateStatusInput, BulkUpdateStatusInput } from '../validators/inventory.validator';

export async function updatePropertyStatus(
  propertyId: string,
  input: UpdateStatusInput,
  userId: string
) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);

  if (property.status === input.status) {
    throw new AppError(`Property is already marked as ${input.status}`, 400);
  }

  const [updated] = await prisma.$transaction([
    prisma.property.update({ where: { id: propertyId }, data: { status: input.status } }),
    prisma.inventoryStatusLog.create({
      data: {
        propertyId,
        previousStatus: property.status,
        newStatus: input.status,
        source: input.source,
        note: input.note,
        changedById: userId,
      },
    }),
  ]);

  if (property.createdById !== userId) {
    await createNotification(
      property.createdById,
      'Inventory status changed',
      `"${property.title}" changed from ${property.status} to ${input.status}${
        input.source === 'BUILDER' ? ' (reported by builder)' : ''
      }.`
    );
  }

  return updated;
}

export async function bulkUpdateStatus(input: BulkUpdateStatusInput, userId: string) {
  const results = [];

  // Sequential, not Promise.all — each update needs its own "previous status"
  // read immediately before writing, and we want one failure to not silently
  // skip logging for the properties that succeeded before it.
  for (const item of input.updates) {
    try {
      const updated = await updatePropertyStatus(
        item.propertyId,
        { status: item.status, source: input.source, note: input.note },
        userId
      );
      results.push({ propertyId: item.propertyId, success: true, property: updated });
    } catch (err: any) {
      results.push({ propertyId: item.propertyId, success: false, error: err.message });
    }
  }

  return results;
}

export async function getStatusHistory(propertyId: string) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);

  return prisma.inventoryStatusLog.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'desc' },
    include: { changedBy: { select: { id: true, fullName: true } } },
  });
}

export async function getProjectInventory(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError('Project not found', 404);

  const properties = await prisma.property.findMany({ where: { projectId } });

  const summary = { AVAILABLE: 0, RESERVED: 0, BOOKED: 0, SOLD: 0 };
  for (const p of properties) {
    summary[p.status] += 1;
  }

  return { projectId, projectName: project.name, total: properties.length, summary, properties };
}