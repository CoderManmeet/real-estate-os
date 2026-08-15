"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLeadSource = createLeadSource;
exports.listLeadSources = listLeadSources;
exports.createLead = createLead;
exports.listLeads = listLeads;
exports.getLeadBoard = getLeadBoard;
exports.getLeadById = getLeadById;
exports.updateLead = updateLead;
exports.deleteLead = deleteLead;
exports.addActivity = addActivity;
exports.addTask = addTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
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
    const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST'];
    const leads = await prisma_1.prisma.lead.findMany({
        orderBy: { updatedAt: 'desc' },
        include: leadInclude,
    });
    const board = {};
    for (const stage of stages) {
        board[stage] = leads.filter((lead) => lead.stage === stage);
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
    if (input.stage && input.stage !== existing.stage) {
        await prisma_1.prisma.leadActivity.create({
            data: {
                leadId: id,
                activityType: 'OTHER',
                description: `Stage changed from ${existing.stage} to ${input.stage}`,
                createdById: userId,
            },
        });
    }
    return prisma_1.prisma.lead.update({ where: { id }, data: input, include: leadInclude });
}
async function deleteLead(id) {
    await assertLeadExists(id);
    await prisma_1.prisma.lead.delete({ where: { id } });
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
