"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevenueSummary = getRevenueSummary;
exports.getCommissionBreakdown = getCommissionBreakdown;
exports.getPendingPayments = getPendingPayments;
// src/services/revenue.service.ts
const prisma_1 = require("../config/prisma");
function dealDateRange(q) {
    const range = {};
    if (q.from)
        range.gte = new Date(q.from);
    if (q.to)
        range.lte = new Date(q.to);
    return Object.keys(range).length ? range : undefined;
}
/**
 * Company-wide revenue snapshot (deterministic). Deal value is grouped by stage;
 * completed value, commission totals, and pending-payment totals are summed.
 */
async function getRevenueSummary(q) {
    const created = dealDateRange(q);
    const dealWhere = created ? { createdAt: created } : {};
    const [byStage, completedAgg, commissionAgg, paymentAgg] = await Promise.all([
        prisma_1.prisma.deal.groupBy({
            by: ['stage'],
            where: dealWhere,
            _count: { _all: true },
            _sum: { dealValue: true },
        }),
        prisma_1.prisma.deal.aggregate({
            where: { ...dealWhere, stage: 'COMPLETED' },
            _sum: { dealValue: true },
            _count: { _all: true },
        }),
        prisma_1.prisma.commission.aggregate({
            _sum: { grossAmount: true, agentAmount: true, companyAmount: true },
        }),
        prisma_1.prisma.payment.groupBy({
            by: ['status'],
            _sum: { amount: true },
            _count: { _all: true },
        }),
    ]);
    const paymentsByStatus = {};
    for (const p of paymentAgg) {
        paymentsByStatus[p.status] = { count: p._count._all, amount: p._sum.amount || 0 };
    }
    const pendingTotal = (paymentsByStatus['PENDING']?.amount || 0) + (paymentsByStatus['OVERDUE']?.amount || 0);
    return {
        dealsByStage: byStage.map((s) => ({
            stage: s.stage,
            count: s._count._all,
            value: s._sum.dealValue || 0,
        })),
        completed: {
            count: completedAgg._count._all,
            value: completedAgg._sum.dealValue || 0,
        },
        commission: {
            gross: commissionAgg._sum.grossAmount || 0,
            agent: commissionAgg._sum.agentAmount || 0,
            company: commissionAgg._sum.companyAmount || 0,
        },
        payments: {
            byStatus: paymentsByStatus,
            pendingTotal,
        },
    };
}
/** Earned commission grouped per agent and status. */
async function getCommissionBreakdown() {
    const rows = await prisma_1.prisma.commission.groupBy({
        by: ['agentId', 'status'],
        _sum: { grossAmount: true, agentAmount: true, companyAmount: true },
        _count: { _all: true },
    });
    const agentIds = Array.from(new Set(rows.map((r) => r.agentId)));
    const agents = await prisma_1.prisma.user.findMany({
        where: { id: { in: agentIds } },
        select: { id: true, fullName: true },
    });
    const nameById = new Map(agents.map((a) => [a.id, a.fullName]));
    return rows.map((r) => ({
        agentId: r.agentId,
        agentName: nameById.get(r.agentId) || null,
        status: r.status,
        count: r._count._all,
        gross: r._sum.grossAmount || 0,
        agent: r._sum.agentAmount || 0,
        company: r._sum.companyAmount || 0,
    }));
}
/** Outstanding payments (PENDING/OVERDUE), split into overdue vs upcoming. */
async function getPendingPayments() {
    const now = new Date();
    const payments = await prisma_1.prisma.payment.findMany({
        where: { status: { in: ['PENDING', 'OVERDUE'] } },
        orderBy: [{ dueDate: 'asc' }],
        include: {
            deal: {
                select: {
                    id: true,
                    dealValue: true,
                    client: { select: { id: true, fullName: true } },
                },
            },
        },
    });
    let overdueTotal = 0;
    let upcomingTotal = 0;
    const items = payments.map((p) => {
        const isOverdue = p.status === 'OVERDUE' ||
            (!!p.dueDate && p.dueDate < now && p.status !== 'PAID' && p.status !== 'CANCELLED');
        if (isOverdue)
            overdueTotal += p.amount;
        else
            upcomingTotal += p.amount;
        return { ...p, isOverdue };
    });
    return { items, overdueTotal, upcomingTotal, total: overdueTotal + upcomingTotal };
}
