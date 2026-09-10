"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLeadSource = createLeadSource;
exports.listLeadSources = listLeadSources;
exports.syncClientStatusFromLeads = syncClientStatusFromLeads;
exports.createLead = createLead;
exports.listLeads = listLeads;
exports.getLeadBoard = getLeadBoard;
exports.getLeadById = getLeadById;
exports.updateLead = updateLead;
exports.assertLeadsHaveNoDeals = assertLeadsHaveNoDeals;
exports.deleteLead = deleteLead;
exports.addActivity = addActivity;
exports.addTask = addTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const pipeline_1 = require("../utils/pipeline");
const leadInclude = {
    client: { select: { id: true, fullName: true, phone: true } },
    property: { select: { id: true, title: true, price: true } },
    leadSource: true,
    assignedTo: { select: { id: true, fullName: true } },
};
async function createLeadSource(input) {
    return prisma_1.prisma.leadSource.create({ data: input });
}
async function listLeadSources() {
    return prisma_1.prisma.leadSource.findMany({ orderBy: { name: 'asc' } });
}
async function assertReferencesExist(input) {
    if (input.clientId) {
        const client = await prisma_1.prisma.client.findUnique({ where: { id: input.clientId } });
        if (!client)
            throw new AppError_1.AppError('Client not found', 404);
    }
    if (input.propertyId) {
        const property = await prisma_1.prisma.property.findUnique({ where: { id: input.propertyId } });
        if (!property)
            throw new AppError_1.AppError('Property not found', 404);
    }
    if (input.leadSourceId) {
        const source = await prisma_1.prisma.leadSource.findUnique({ where: { id: input.leadSourceId } });
        if (!source)
            throw new AppError_1.AppError('Lead source not found', 404);
    }
    if (input.assignedToId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: input.assignedToId } });
        if (!user)
            throw new AppError_1.AppError('Assigned user not found', 404);
    }
}
/**
 * Recompute a client's derived status from ALL of its leads and, if it changed,
 * persist it and log a STATUS_CHANGE timeline event. One-directional: Lead.stage ->
 * Client.status only. Safe to call after any create/update/delete of a lead.
 */
async function syncClientStatusFromLeads(clientId, actorUserId) {
    const [client, leads] = await Promise.all([
        prisma_1.prisma.client.findUnique({ where: { id: clientId }, select: { id: true, status: true } }),
        prisma_1.prisma.lead.findMany({ where: { clientId }, select: { stage: true } }),
    ]);
    // Client may have been removed (e.g. cascade); nothing to sync.
    if (!client)
        return;
    const target = (0, pipeline_1.resolveClientStatusFromStages)(leads.map((l) => l.stage));
    if (!target || target === client.status)
        return;
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.client.update({ where: { id: clientId }, data: { status: target } }),
        prisma_1.prisma.clientTimeline.create({
            data: {
                clientId,
                eventType: 'STATUS_CHANGE',
                description: `Status updated to ${target} (derived from lead pipeline)`,
                createdById: actorUserId,
            },
        }),
    ]);
}
async function createLead(input, userId) {
    await assertReferencesExist(input);
    const lead = await prisma_1.prisma.lead.create({
        data: { ...input, createdById: userId },
        include: leadInclude,
    });
    await prisma_1.prisma.leadActivity.create({
        data: {
            leadId: lead.id,
            activityType: 'OTHER',
            description: 'Lead created',
            createdById: userId,
        },
    });
    await syncClientStatusFromLeads(lead.clientId, userId);
    return lead;
}
async function listLeads(query) {
    const { page, limit, stage, assignedToId } = query;
    const where = {
        ...(stage && { stage }),
        ...(assignedToId && { assignedToId }),
    };
    const [leads, total] = await Promise.all([
        prisma_1.prisma.lead.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { updatedAt: 'desc' },
            include: leadInclude,
        }),
        prisma_1.prisma.lead.count({ where }),
    ]);
    return { leads, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
async function getLeadBoard() {
    const leads = await prisma_1.prisma.lead.findMany({
        orderBy: { updatedAt: 'desc' },
        include: leadInclude,
    });
    // Always return every canonical stage bucket (even when empty) so the board has
    // no gaps. Residual dormant-WON rows are folded into CLOSED via displayStage.
    const board = {};
    for (const stage of pipeline_1.LEAD_STAGES)
        board[stage] = [];
    for (const lead of leads) {
        const bucket = (0, pipeline_1.displayStage)(lead.stage);
        board[bucket].push(lead);
    }
    return board;
}
async function getLeadById(id) {
    const lead = await prisma_1.prisma.lead.findUnique({
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
    if (!lead)
        throw new AppError_1.AppError('Lead not found', 404);
    return lead;
}
async function assertLeadExists(id) {
    const lead = await prisma_1.prisma.lead.findUnique({ where: { id } });
    if (!lead)
        throw new AppError_1.AppError('Lead not found', 404);
    return lead;
}
async function updateLead(id, input, userId) {
    const existing = await assertLeadExists(id);
    await assertReferencesExist(input);
    const stageChanged = !!input.stage && input.stage !== existing.stage;
    if (stageChanged) {
        await prisma_1.prisma.leadActivity.create({
            data: {
                leadId: id,
                activityType: 'OTHER',
                description: `Stage changed from ${existing.stage} to ${input.stage}`,
                createdById: userId,
            },
        });
    }
    const updated = await prisma_1.prisma.lead.update({
        where: { id },
        data: input,
        include: leadInclude,
    });
    if (stageChanged) {
        await syncClientStatusFromLeads(existing.clientId, userId);
    }
    return updated;
}
/**
 * V2.2 guard: a Deal links to its Lead with onDelete: Restrict. Deleting a lead
 * that has a deal would raise a raw FK error (surfacing as a 500), so we check
 * first and throw a clear 409 instead. Shared by single- and bulk-delete paths.
 */
async function assertLeadsHaveNoDeals(leadIds) {
    const blocking = await prisma_1.prisma.deal.findMany({
        where: { leadId: { in: leadIds } },
        select: { leadId: true },
    });
    if (blocking.length > 0) {
        throw new AppError_1.AppError(blocking.length === 1
            ? 'This lead has a linked deal. Cancel or delete the deal before deleting the lead.'
            : `${blocking.length} of the selected leads have linked deals. Cancel or delete those deals first.`, 409);
    }
}
async function deleteLead(id, userId) {
    const existing = await assertLeadExists(id);
    // Block (409) when a deal is linked instead of letting the DB Restrict throw.
    await assertLeadsHaveNoDeals([id]);
    await prisma_1.prisma.lead.delete({ where: { id } });
    // Removing a lead can change the furthest-progress lead, so re-derive status.
    await syncClientStatusFromLeads(existing.clientId, userId);
}
async function addActivity(leadId, input, userId) {
    await assertLeadExists(leadId);
    return prisma_1.prisma.leadActivity.create({
        data: { ...input, leadId, createdById: userId },
        include: { createdBy: { select: { id: true, fullName: true } } },
    });
}
async function addTask(leadId, input, userId) {
    await assertLeadExists(leadId);
    const assignee = await prisma_1.prisma.user.findUnique({ where: { id: input.assignedToId } });
    if (!assignee)
        throw new AppError_1.AppError('Assigned user not found', 404);
    return prisma_1.prisma.task.create({
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
async function updateTask(id, input) {
    const existing = await prisma_1.prisma.task.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.AppError('Task not found', 404);
    return prisma_1.prisma.task.update({
        where: { id },
        data: {
            ...input,
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        },
        include: { assignedTo: { select: { id: true, fullName: true } } },
    });
}
async function deleteTask(id) {
    const existing = await prisma_1.prisma.task.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.AppError('Task not found', 404);
    await prisma_1.prisma.task.delete({ where: { id } });
}
