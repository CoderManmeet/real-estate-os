import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreateCommunicationInput,
  UpdateCommunicationInput,
  ListCommunicationsQuery,
} from '../validators/communication.validator';

// Communication logs (V2.1). Agent-recorded interactions (call/email/SMS/WhatsApp/
// meeting) against a client and optionally a specific lead. Additive; also surfaced
// in the unified client timeline as the COMMUNICATION source.
const communicationInclude = {
  createdBy: { select: { id: true, fullName: true } },
  lead: { select: { id: true, stage: true } },
  client: { select: { id: true, fullName: true, phone: true } },
};

export async function createCommunication(input: CreateCommunicationInput, userId: string) {
  const client = await prisma.client.findUnique({ where: { id: input.clientId } });
  if (!client) throw new AppError('Client not found', 404);

  if (input.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: input.leadId } });
    if (!lead) throw new AppError('Lead not found', 404);
    if (lead.clientId !== input.clientId) {
      throw new AppError('Lead does not belong to this client', 400);
    }
  }

  return prisma.communicationLog.create({
    data: {
      clientId: input.clientId,
      leadId: input.leadId,
      type: input.type,
      direction: input.direction,
      body: input.body,
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : undefined,
      createdById: userId,
    },
    include: communicationInclude,
  });
}

export async function listCommunications(query: ListCommunicationsQuery) {
  const { page, limit, clientId, leadId, type, direction } = query;

  const where = {
    ...(clientId && { clientId }),
    ...(leadId && { leadId }),
    ...(type && { type }),
    ...(direction && { direction }),
  };

  const [items, total] = await Promise.all([
    prisma.communicationLog.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { occurredAt: 'desc' },
      include: communicationInclude,
    }),
    prisma.communicationLog.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function assertExists(id: string) {
  const log = await prisma.communicationLog.findUnique({ where: { id } });
  if (!log) throw new AppError('Communication log not found', 404);
  return log;
}

export async function updateCommunication(id: string, input: UpdateCommunicationInput) {
  await assertExists(id);
  return prisma.communicationLog.update({
    where: { id },
    data: {
      ...(input.type !== undefined && { type: input.type }),
      ...(input.direction !== undefined && { direction: input.direction }),
      ...(input.body !== undefined && { body: input.body }),
      ...(input.occurredAt !== undefined && { occurredAt: new Date(input.occurredAt) }),
    },
    include: communicationInclude,
  });
}

export async function deleteCommunication(id: string) {
  await assertExists(id);
  await prisma.communicationLog.delete({ where: { id } });
}