import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  CreateLeadSourceInput,
  CreateLeadInput,
  UpdateLeadInput,
  ListLeadsQuery,
  CreateActivityInput,
  CreateTaskInput,
  UpdateTaskInput,
} from '../validators/lead.validator';

const leadInclude = {
  client: { select: { id: true, fullName: true, phone: true } },
  property: { select: { id: true, title: true, price: true } },
  leadSource: true,
  assignedTo: { select: { id: true, fullName: true } },
};

export async function createLeadSource(input: CreateLeadSourceInput) {
  return prisma.leadSource.create({ data: input });
}

export async function listLeadSources() {
  return prisma.leadSource.findMany({ orderBy: { name: 'asc' } });
}

async function assertReferencesExist(input: {
  clientId?: string;
  propertyId?: string;
  leadSourceId?: string;
  assignedToId?: string;
}) {
  if (input.clientId) {
    const client = await prisma.client.findUnique({ where: { id: input.clientId } });
    if (!client) throw new AppError('Client not found', 404);
  }
  if (input.propertyId) {
    const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
    if (!property) throw new AppError('Property not found', 404);
  }
  if (input.leadSourceId) {
    const source = await prisma.leadSource.findUnique({ where: { id: input.leadSourceId } });
    if (!source) throw new AppError('Lead source not found', 404);
  }
  if (input.assignedToId) {
    const user = await prisma.user.findUnique({ where: { id: input.assignedToId } });
    if (!user) throw new AppError('Assigned user not found', 404);
  }
}

export async function createLead(input: CreateLeadInput, userId: string) {
  await assertReferencesExist(input);

  const lead = await prisma.lead.create({
    data: { ...input, createdById: userId },
    include: leadInclude,
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      activityType: 'OTHER',
      description: 'Lead created',
      createdById: userId,
    },
  });

  return lead;
}

export async function listLeads(query: ListLeadsQuery) {
  const { page, limit, stage, assignedToId } = query;

  const where = {
    ...(stage && { stage }),
    ...(assignedToId && { assignedToId }),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: leadInclude,
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getLeadBoard() {
  const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST'] as const;

  const leads = await prisma.lead.findMany({
    orderBy: { updatedAt: 'desc' },
    include: leadInclude,
  });

  const board: Record<string, typeof leads> = {};
  for (const stage of stages) {
    board[stage] = leads.filter((lead) => lead.stage === stage);
  }
  return board;
}

export async function getLeadById(id: string) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      ...leadInclude,
      activities: {
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { id: true, fullName: true } } },
      },
      tasks: {
        orderBy: { dueDate: 'asc' },
        include: { assignedTo: { select: { id: true, fullName: true } } },
      },
    },
  });
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
}

async function assertLeadExists(id: string) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
}

export async function updateLead(id: string, input: UpdateLeadInput, userId: string) {
  const existing = await assertLeadExists(id);
  await assertReferencesExist(input);

  if (input.stage && input.stage !== existing.stage) {
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        activityType: 'OTHER',
        description: `Stage changed from ${existing.stage} to ${input.stage}`,
        createdById: userId,
      },
    });
  }

  return prisma.lead.update({ where: { id }, data: input, include: leadInclude });
}

export async function deleteLead(id: string) {
  await assertLeadExists(id);
  await prisma.lead.delete({ where: { id } });
}

export async function addActivity(leadId: string, input: CreateActivityInput, userId: string) {
  await assertLeadExists(leadId);
  return prisma.leadActivity.create({
    data: { ...input, leadId, createdById: userId },
    include: { createdBy: { select: { id: true, fullName: true } } },
  });
}

export async function addTask(leadId: string, input: CreateTaskInput, userId: string) {
  await assertLeadExists(leadId);
  const assignee = await prisma.user.findUnique({ where: { id: input.assignedToId } });
  if (!assignee) throw new AppError('Assigned user not found', 404);

  return prisma.task.create({
    data: {
      title: input.title,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      assignedToId: input.assignedToId,
      leadId,
      createdById: userId,
    },
    include: { assignedTo: { select: { id: true, fullName: true } } },
  });
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw new AppError('Task not found', 404);

  return prisma.task.update({
    where: { id },
    data: {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
    include: { assignedTo: { select: { id: true, fullName: true } } },
  });
}

export async function deleteTask(id: string) {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw new AppError('Task not found', 404);
  await prisma.task.delete({ where: { id } });
}