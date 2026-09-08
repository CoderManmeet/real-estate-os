"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkLeads = bulkLeads;
exports.bulkClients = bulkClients;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const lead_service_1 = require("./lead.service");
// Bulk operations (V2.1). Deterministic batch mutations with validation. Stage/status
// changes keep the derived Client.status mirror correct by re-syncing affected clients.
async function bulkLeads(input, userId) {
    const leads = await prisma_1.prisma.lead.findMany({
        where: { id: { in: input.ids } },
        select: { id: true, clientId: true, stage: true },
    });
    if (leads.length === 0)
        throw new AppError_1.AppError('No matching leads found', 404);
    const leadIds = leads.map((l) => l.id);
    const clientIds = [...new Set(leads.map((l) => l.clientId))];
    if (input.action === 'delete') {
        await prisma_1.prisma.lead.deleteMany({ where: { id: { in: leadIds } } });
        for (const clientId of clientIds)
            await (0, lead_service_1.syncClientStatusFromLeads)(clientId, userId);
        return { deleted: leads.length };
    }
    if (input.action === 'assignee') {
        const assignee = await prisma_1.prisma.user.findUnique({ where: { id: input.assignedToId } });
        if (!assignee)
            throw new AppError_1.AppError('Assigned user not found', 404);
        await prisma_1.prisma.lead.updateMany({
            where: { id: { in: leadIds } },
            data: { assignedToId: input.assignedToId },
        });
        return { updated: leads.length };
    }
    // action === 'stage'
    const stage = input.stage;
    const changed = leads.filter((l) => l.stage !== stage);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.lead.updateMany({ where: { id: { in: leadIds } }, data: { stage } }),
        prisma_1.prisma.leadActivity.createMany({
            data: changed.map((l) => ({
                leadId: l.id,
                activityType: 'OTHER',
                description: `Stage changed from ${l.stage} to ${stage} (bulk)`,
                createdById: userId,
            })),
        }),
    ]);
    for (const clientId of clientIds)
        await (0, lead_service_1.syncClientStatusFromLeads)(clientId, userId);
    return { updated: leads.length };
}
async function bulkClients(input, userId) {
    const clients = await prisma_1.prisma.client.findMany({
        where: { id: { in: input.ids } },
        select: { id: true },
    });
    if (clients.length === 0)
        throw new AppError_1.AppError('No matching clients found', 404);
    const clientIds = clients.map((c) => c.id);
    if (input.action === 'delete') {
        await prisma_1.prisma.client.deleteMany({ where: { id: { in: clientIds } } });
        return { deleted: clients.length };
    }
    // action === 'status' (manual override; still logged to each client's timeline)
    const status = input.status;
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.client.updateMany({ where: { id: { in: clientIds } }, data: { status } }),
        prisma_1.prisma.clientTimeline.createMany({
            data: clientIds.map((clientId) => ({
                clientId,
                eventType: 'STATUS_CHANGE',
                description: `Status set to ${status} (bulk)`,
                createdById: userId,
            })),
        }),
    ]);
    return { updated: clients.length };
}
