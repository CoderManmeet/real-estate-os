import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
  RegenerateAccessInput,
  ListCollectionsQuery,
} from '../validators/collection.validator';

function generateAccessToken() {
  return crypto.randomBytes(24).toString('hex');
}

const collectionInclude = {
  sharedProperties: {
    include: {
      property: {
        select: {
          id: true,
          title: true,
          price: true,
          address: true,
          city: true,
          status: true,
        },
      },
    },
    orderBy: [{ position: 'asc' }, { sharedAt: 'desc' }],
  },
  client: { select: { id: true, fullName: true } },
  createdBy: { select: { id: true, fullName: true } },
} satisfies Prisma.PropertyCollectionInclude;

async function assertCollectionExists(id: string) {
  const collection = await prisma.propertyCollection.findUnique({ where: { id } });
  if (!collection) throw new AppError('Collection not found', 404);
  return collection;
}

export async function createCollection(input: CreateCollectionInput, userId: string) {
  const client = await prisma.client.findUnique({ where: { id: input.clientId } });
  if (!client) throw new AppError('Client not found', 404);

  if (input.propertyIds.length > 0) {
    const found = await prisma.property.findMany({
      where: { id: { in: input.propertyIds } },
      select: { id: true },
    });
    if (found.length !== new Set(input.propertyIds).size) {
      throw new AppError('One or more properties not found', 404);
    }
  }

  const collection = await prisma.propertyCollection.create({
    data: {
      clientId: input.clientId,
      name: input.name,
      description: input.description,
      accessToken: generateAccessToken(),
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      createdById: userId,
      sharedProperties: {
        create: input.propertyIds.map((propertyId, index) => ({
          clientId: input.clientId,
          propertyId,
          sharedById: userId,
          position: index,
        })),
      },
    },
    include: collectionInclude,
  });

  await prisma.clientTimeline.create({
    data: {
      clientId: input.clientId,
      eventType: 'OTHER',
      description: `Collection "${input.name}" created with ${input.propertyIds.length} property(ies)`,
      createdById: userId,
    },
  });

  return collection;
}

export async function listCollections(query: ListCollectionsQuery) {
  const where: Prisma.PropertyCollectionWhereInput = {
    ...(query.clientId && { clientId: query.clientId }),
    ...(query.includeArchived ? {} : { isArchived: false }),
  };
  return prisma.propertyCollection.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: collectionInclude,
  });
}

export async function getCollectionById(id: string) {
  const collection = await prisma.propertyCollection.findUnique({
    where: { id },
    include: collectionInclude,
  });
  if (!collection) throw new AppError('Collection not found', 404);
  return collection;
}

export async function updateCollection(id: string, input: UpdateCollectionInput) {
  await assertCollectionExists(id);
  return prisma.propertyCollection.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.isArchived !== undefined && { isArchived: input.isArchived }),
      ...(input.expiresAt !== undefined && {
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      }),
    },
    include: collectionInclude,
  });
}

export async function addPropertyToCollection(id: string, propertyId: string, userId: string) {
  const collection = await assertCollectionExists(id);

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });
  if (!property) throw new AppError('Property not found', 404);

  const existing = await prisma.sharedProperty.findFirst({
    where: { collectionId: id, propertyId },
    select: { id: true },
  });
  if (existing) throw new AppError('Property is already in this collection', 409);

  const last = await prisma.sharedProperty.findFirst({
    where: { collectionId: id },
    orderBy: { position: 'desc' },
    select: { position: true },
  });

  await prisma.sharedProperty.create({
    data: {
      clientId: collection.clientId,
      propertyId,
      sharedById: userId,
      collectionId: id,
      position: (last?.position ?? -1) + 1,
    },
  });

  return getCollectionById(id);
}

export async function removePropertyFromCollection(id: string, propertyId: string) {
  await assertCollectionExists(id);
  await prisma.sharedProperty.deleteMany({ where: { collectionId: id, propertyId } });
  return getCollectionById(id);
}

export async function revokeCollectionAccess(id: string) {
  await assertCollectionExists(id);
  return prisma.propertyCollection.update({
    where: { id },
    data: { revokedAt: new Date() },
    include: collectionInclude,
  });
}

export async function regenerateCollectionAccess(id: string, input: RegenerateAccessInput) {
  await assertCollectionExists(id);
  return prisma.propertyCollection.update({
    where: { id },
    data: {
      accessToken: generateAccessToken(),
      revokedAt: null,
      ...(input.expiresAt !== undefined && {
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      }),
    },
    include: collectionInclude,
  });
}