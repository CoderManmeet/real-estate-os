"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertCommission = upsertCommission;
exports.updateCommission = updateCommission;
exports.getCommissionByDeal = getCommissionByDeal;
exports.listCommissions = listCommissions;
exports.deleteCommission = deleteCommission;
// src/services/commission.service.ts
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const commission_1 = require("../utils/commission");
const commissionInclude = {
    agent: { select: { id: true, fullName: true } },
    deal: { select: { id: true, dealValue: true, stage: true } },
};
/**
 * Create or replace the commission for a deal (1:1). Deterministic split:
 * agentAmount = gross * agentPercent / 100; companyAmount = gross - agentAmount.
 */
async function upsertCommission(input, userId) {
    const deal = await prisma_1.prisma.deal.findUnique({
        where: { id: input.dealId },
        select: { id: true, dealValue: true, agentId: true },
    });
    if (!deal)
        throw new AppError_1.AppError('Deal not found', 404);
    const gross = input.grossAmount ?? (0, commission_1.grossFromPercent)(deal.dealValue, input.grossPercent);
    const agentPercent = input.agentPercent ?? commission_1.DEFAULT_AGENT_COMMISSION_PERCENT;
    const split = (0, commission_1.computeCommissionSplit)(gross, agentPercent);
    const agentId = input.agentId ?? deal.agentId;
    if (input.agentId) {
        const agent = await prisma_1.prisma.user.findUnique({ where: { id: input.agentId } });
        if (!agent)
            throw new AppError_1.AppError('Agent not found', 404);
    }
    return prisma_1.prisma.commission.upsert({
        where: { dealId: input.dealId },
        create: {
            dealId: input.dealId,
            grossAmount: split.grossAmount,
            agentPercent: split.agentPercent,
            agentAmount: split.agentAmount,
            companyAmount: split.companyAmount,
            agentId,
            note: input.note,
            createdById: userId,
        },
        update: {
            grossAmount: split.grossAmount,
            agentPercent: split.agentPercent,
            agentAmount: split.agentAmount,
            companyAmount: split.companyAmount,
            agentId,
            note: input.note,
        },
        include: commissionInclude,
    });
}
async function updateCommission(id, input) {
    const existing = await prisma_1.prisma.commission.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.AppError('Commission not found', 404);
    // Recompute the split whenever gross or agentPercent changes so the stored
    // agent/company amounts stay internally consistent.
    const grossAmount = input.grossAmount ?? existing.grossAmount;
    const agentPercent = input.agentPercent ?? existing.agentPercent;
    const split = (0, commission_1.computeCommissionSplit)(grossAmount, agentPercent);
    return prisma_1.prisma.commission.update({
        where: { id },
        data: {
            grossAmount: split.grossAmount,
            agentPercent: split.agentPercent,
            agentAmount: split.agentAmount,
            companyAmount: split.companyAmount,
            status: input.status,
            note: input.note,
            receivedAt: input.receivedAt ? new Date(input.receivedAt) : undefined,
            paidOutAt: input.paidOutAt ? new Date(input.paidOutAt) : undefined,
        },
        include: commissionInclude,
    });
}
async function getCommissionByDeal(dealId) {
    const commission = await prisma_1.prisma.commission.findUnique({
        where: { dealId },
        include: commissionInclude,
    });
    if (!commission)
        throw new AppError_1.AppError('Commission not found for this deal', 404);
    return commission;
}
async function listCommissions() {
    return prisma_1.prisma.commission.findMany({
        orderBy: { createdAt: 'desc' },
        include: commissionInclude,
    });
}
async function deleteCommission(id) {
    const existing = await prisma_1.prisma.commission.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.AppError('Commission not found', 404);
    await prisma_1.prisma.commission.delete({ where: { id } });
}
