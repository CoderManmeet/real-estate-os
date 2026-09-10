import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { syncClientStatusFromLeads, assertLeadsHaveNoDeals } from './lead.service';
import { BulkLeadsInput, BulkClientsInput } from '../validators/bulk.validator';

// Bulk operations (V2.1). Deterministic batch mutations with validation. Stage/status
// changes keep the derived Client.status mirror correct by re-syncing affected clients.
export async function bulkLeads(input: BulkLeadsInput, userId: string) {
  const leads = await prisma.lead.findMany({
    where: { id: { in: input.ids } },
    select: { id: true, clientId: true, stage: true },
  });
  if (leads.length === 0) throw new AppError('No matching leads found', 404);

  const leadIds = leads.map((l) => l.id);
  const clientIds = [...new Set(leads.map((l) => l.clientId))];

  if (input.action === 'delete') {
    // V2.2: refuse (409) if any selected lead has a linked deal, rather than
    // letting the Restrict on Deal.leadId raise a raw FK error.
    await assertLeadsHaveNoDeals(leadIds);
    await prisma.lead.deleteMany({ where: { id: { in: leadIds } } });
    for (const clientId of clientIds) await syncClientStatusFromLeads(clientId, userId);
    return { deleted: leads.length };
  }

  if (input.action === 'assignee') {
    const assignee = await prisma.user.findUnique({ where: { id: input.assignedToId! } });
    if (!assignee) throw new AppError('Assigned user not found', 404);
    await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: { assignedToId: input.assignedToId! },
    });
    return { updated: leads.length };
  }

  // action === 'stage'
  const stage = input.stage!;
  const changed = leads.filter((l) => l.stage !== stage);
  await prisma.$transaction([
    prisma.lead.updateMany({ where: { id: { in: leadIds } }, data: { stage } }),
    prisma.leadActivity.createMany({
      data: changed.map((l) => ({
        leadId: l.id,
        activityType: 'OTHER' as const,
        description: `Stage changed from ${l.stage} to ${stage} (bulk)`,
        createdById: userId,
      })),
    }),
  ]);
  for (const clientId of clientIds) await syncClientStatusFromLeads(clientId, userId);
  return { updated: leads.length };
}

export async function bulkClients(input: BulkClientsInput, userId: string) {
  const clients = await prisma.client.findMany({
    where: { id: { in: input.ids } },
    select: { id: true },
  });
  if (clients.length === 0) throw new AppError('No matching clients found', 404);

  const clientIds = clients.map((c) => c.id);

  if (input.action === 'delete') {
    await prisma.client.deleteMany({ where: { id: { in: clientIds } } });
    return { deleted: clients.length };
  }

  // action === 'status' (manual override; still logged to each client's timeline)
  const status = input.status!;
  await prisma.$transaction([
    prisma.client.updateMany({ where: { id: { in: clientIds } }, data: { status } }),
    prisma.clientTimeline.createMany({
      data: clientIds.map((clientId) => ({
        clientId,
        eventType: 'STATUS_CHANGE' as const,
        description: `Status set to ${status} (bulk)`,
        createdById: userId,
      })),
    }),
  ]);
  return { updated: clients.length };
}