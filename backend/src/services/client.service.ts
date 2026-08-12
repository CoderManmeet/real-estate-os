import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreateClientInput,
  UpdateClientInput,
  ListClientsQuery,
  CreateRequirementInput,
  CreateNoteInput,
  CreateTimelineEventInput,
} from '../validators/client.validator';
import crypto from 'crypto';

export async function createClient(input: CreateClientInput, userId: string) {
  const client = await prisma.client.create({
    data: { ...input, createdById: userId },
  });

  await prisma.clientTimeline.create({
    data: {
      clientId: client.id,
      eventType: 'OTHER',
      description: 'Client added to system',
      createdById: userId,
    },
  });

  return client;
}

export async function listClients(query: ListClientsQuery) {
  const { page, limit, status, search } = query;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.client.count({ where }),
  ]);

  return { clients, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getClientById(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      requirements: { orderBy: { createdAt: 'desc' } },
      notes: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, fullName: true } } },
      },
      timeline: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, fullName: true } } },
      },
      favorites: { include: { property: true } },
      sharedProperties: { include: { property: true } },
    },
  });
  if (!client) throw new AppError('Client not found', 404);
  return client;
}

async function assertClientExists(id: string) {
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) throw new AppError('Client not found', 404);
  return client;
}

export async function updateClient(id: string, input: UpdateClientInput, userId: string) {
  const existing = await assertClientExists(id);

  if (input.status && input.status !== existing.status) {
    await prisma.clientTimeline.create({
      data: {
        clientId: id,
        eventType: 'STATUS_CHANGE',
        description: `Status changed from ${existing.status} to ${input.status}`,
        createdById: userId,
      },
    });
  }

  return prisma.client.update({ where: { id }, data: input });
}

export async function deleteClient(id: string) {
  await assertClientExists(id);
  await prisma.client.delete({ where: { id } });
}

export async function addRequirement(clientId: string, input: CreateRequirementInput) {
  await assertClientExists(clientId);
  return prisma.clientRequirement.create({ data: { ...input, clientId } });
}

export async function addNote(clientId: string, input: CreateNoteInput, userId: string) {
  await assertClientExists(clientId);
  return prisma.clientNote.create({
    data: { ...input, clientId, createdById: userId },
  });
}

export async function addTimelineEvent(
  clientId: string,
  input: CreateTimelineEventInput,
  userId: string
) {
  await assertClientExists(clientId);
  return prisma.clientTimeline.create({
    data: { ...input, clientId, createdById: userId },
  });
}

export async function addFavorite(clientId: string, propertyId: string) {
  await assertClientExists(clientId);
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);

  return prisma.favorite.upsert({
    where: { clientId_propertyId: { clientId, propertyId } },
    create: { clientId, propertyId },
    update: {},
  });
}

export async function removeFavorite(clientId: string, propertyId: string) {
  await prisma.favorite.deleteMany({ where: { clientId, propertyId } });
}

export async function shareProperty(clientId: string, propertyId: string, userId: string) {
  await assertClientExists(clientId);
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new AppError('Property not found', 404);

  const shared = await prisma.sharedProperty.create({
    data: { clientId, propertyId, sharedById: userId },
  });

  await prisma.clientTimeline.create({
    data: {
      clientId,
      eventType: 'OTHER',
      description: `Property "${property.title}" shared with client`,
      createdById: userId,
    },
  });

  return shared;
}

export async function getOrCreatePortalLink(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new AppError('Client not found', 404);

  if (client.portalToken) {
    return client.portalToken;
  }

  const token = crypto.randomBytes(24).toString('hex');
  await prisma.client.update({ where: { id: clientId }, data: { portalToken: token } });
  return token;
}