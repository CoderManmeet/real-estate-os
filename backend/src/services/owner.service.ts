// src/services/owner.service.ts
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreateOwnerInput,
  UpdateOwnerInput,
  ListOwnersQuery,
} from '../validators/owner.validator';

const ownerPropertySelect = {
  id: true,
  title: true,
  city: true,
  status: true,
  price: true,
};

export async function createOwner(input: CreateOwnerInput, userId: string) {
  return prisma.owner.create({ data: { ...input, createdById: userId } });
}

export async function listOwners(query: ListOwnersQuery) {
  const { page, limit, search } = query;
  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [owners, total] = await Promise.all([
    prisma.owner.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { properties: true } } },
    }),
    prisma.owner.count({ where }),
  ]);

  return { owners, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getOwnerById(id: string) {
  const owner = await prisma.owner.findUnique({
    where: { id },
    include: { properties: { select: ownerPropertySelect, orderBy: { createdAt: 'desc' } } },
  });
  if (!owner) throw new AppError('Owner not found', 404);
  return owner;
}

async function assertOwnerExists(id: string) {
  const owner = await prisma.owner.findUnique({ where: { id } });
  if (!owner) throw new AppError('Owner not found', 404);
  return owner;
}

export async function updateOwner(id: string, input: UpdateOwnerInput) {
  await assertOwnerExists(id);
  return prisma.owner.update({ where: { id }, data: input });
}

export async function deleteOwner(id: string) {
  await assertOwnerExists(id);
  // Property.ownerId is SetNull, so deleting an owner simply unlinks its
  // properties. No property or deal data is lost.
  await prisma.owner.delete({ where: { id } });
}

export async function linkProperty(ownerId: string, propertyId: string) {
  await assertOwnerExists(ownerId);
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);
  await prisma.property.update({ where: { id: propertyId }, data: { ownerId } });
  return getOwnerById(ownerId);
}

export async function unlinkProperty(ownerId: string, propertyId: string) {
  await assertOwnerExists(ownerId);
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);
  if (property.ownerId !== ownerId) {
    throw new AppError('Property is not linked to this owner', 400);
  }
  await prisma.property.update({ where: { id: propertyId }, data: { ownerId: null } });
  return getOwnerById(ownerId);
}