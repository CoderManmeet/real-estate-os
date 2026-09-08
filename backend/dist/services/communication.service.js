"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommunication = createCommunication;
exports.listCommunications = listCommunications;
exports.updateCommunication = updateCommunication;
exports.deleteCommunication = deleteCommunication;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
// Communication logs (V2.1). Agent-recorded interactions (call/email/SMS/WhatsApp/
// meeting) against a client and optionally a specific lead. Additive; also surfaced
// in the unified client timeline as the COMMUNICATION source.
const communicationInclude = {
    createdBy: { select: { id: true, fullName: true } },
    lead: { select: { id: true, stage: true } },
    client: { select: { id: true, fullName: true, phone: true } },
};
async function createCommunication(input, userId) {
    const client = await prisma_1.prisma.client.findUnique({ where: { id: input.clientId } });
    if (!client)
        throw new AppError_1.AppError('Client not found', 404);
    if (input.leadId) {
        const lead = await prisma_1.prisma.lead.findUnique({ where: { id: input.leadId } });
        if (!lead)
            throw new AppError_1.AppError('Lead not found', 404);
        if (lead.clientId !== input.clientId) {
            throw new AppError_1.AppError('Lead does not belong to this client', 400);
        }
    }
    return prisma_1.prisma.communicationLog.create({
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
async function listCommunications(query) {
    const { page, limit, clientId, leadId, type, direction } = query;
    const where = {
        ...(clientId && { clientId }),
        ...(leadId && { leadId }),
        ...(type && { type }),
        ...(direction && { direction }),
    };
    const [items, total] = await Promise.all([
        prisma_1.prisma.communicationLog.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { occurredAt: 'desc' },
            include: communicationInclude,
        }),
        prisma_1.prisma.communicationLog.count({ where }),
    ]);
    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
async function assertExists(id) {
    const log = await prisma_1.prisma.communicationLog.findUnique({ where: { id } });
    if (!log)
        throw new AppError_1.AppError('Communication log not found', 404);
    return log;
}
async function updateCommunication(id, input) {
    await assertExists(id);
    return prisma_1.prisma.communicationLog.update({
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
async function deleteCommunication(id) {
    await assertExists(id);
    await prisma_1.prisma.communicationLog.delete({ where: { id } });
}
