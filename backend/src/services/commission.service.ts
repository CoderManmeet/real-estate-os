// src/services/commission.service.ts
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import {
  DEFAULT_AGENT_COMMISSION_PERCENT,
  computeCommissionSplit,
  grossFromPercent,
} from '../utils/commission';
import {
  UpsertCommissionInput,
  UpdateCommissionInput,
} from '../validators/commission.validator';

const commissionInclude = {
  agent: { select: { id: true, fullName: true } },
  deal: { select: { id: true, dealValue: true, stage: true } },
};

/**
 * Create or replace the commission for a deal (1:1). Deterministic split:
 * agentAmount = gross * agentPercent / 100; companyAmount = gross - agentAmount.
 */
export async function upsertCommission(input: UpsertCommissionInput, userId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: input.dealId },
    select: { id: true, dealValue: true, agentId: true },
  });
  if (!deal) throw new AppError('Deal not found', 404);

  const gross =
    input.grossAmount ?? grossFromPercent(deal.dealValue, input.grossPercent!);
  const agentPercent = input.agentPercent ?? DEFAULT_AGENT_COMMISSION_PERCENT;
  const split = computeCommissionSplit(gross, agentPercent);

  const agentId = input.agentId ?? deal.agentId;
  if (input.agentId) {
    const agent = await prisma.user.findUnique({ where: { id: input.agentId } });
    if (!agent) throw new AppError('Agent not found', 404);
  }

  return prisma.commission.upsert({
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

export async function updateCommission(id: string, input: UpdateCommissionInput) {
  const existing = await prisma.commission.findUnique({ where: { id } });
  if (!existing) throw new AppError('Commission not found', 404);

  // Recompute the split whenever gross or agentPercent changes so the stored
  // agent/company amounts stay internally consistent.
  const grossAmount = input.grossAmount ?? existing.grossAmount;
  const agentPercent = input.agentPercent ?? existing.agentPercent;
  const split = computeCommissionSplit(grossAmount, agentPercent);

  return prisma.commission.update({
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

export async function getCommissionByDeal(dealId: string) {
  const commission = await prisma.commission.findUnique({
    where: { dealId },
    include: commissionInclude,
  });
  if (!commission) throw new AppError('Commission not found for this deal', 404);
  return commission;
}

export async function listCommissions() {
  return prisma.commission.findMany({
    orderBy: { createdAt: 'desc' },
    include: commissionInclude,
  });
}

export async function deleteCommission(id: string) {
  const existing = await prisma.commission.findUnique({ where: { id } });
  if (!existing) throw new AppError('Commission not found', 404);
  await prisma.commission.delete({ where: { id } });
}