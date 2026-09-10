"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = createPayment;
exports.listPayments = listPayments;
exports.updatePayment = updatePayment;
exports.deletePayment = deletePayment;
// src/services/payment.service.ts
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
const deal_service_1 = require("./deal.service");
async function createPayment(input, actor) {
    await (0, deal_service_1.assertDealAccessById)(input.dealId, actor);
    return prisma_1.prisma.payment.create({
        data: {
            dealId: input.dealId,
            label: input.label,
            amount: input.amount,
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
            status: input.status,
            method: input.method,
            reference: input.reference,
            note: input.note,
            createdById: actor.userId,
        },
    });
}
async function listPayments(query, actor) {
    await (0, deal_service_1.assertDealAccessById)(query.dealId, actor);
    return prisma_1.prisma.payment.findMany({
        where: { dealId: query.dealId },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    });
}
async function updatePayment(id, input, actor) {
    const payment = await prisma_1.prisma.payment.findUnique({ where: { id } });
    if (!payment)
        throw new AppError_1.AppError('Payment not found', 404);
    await (0, deal_service_1.assertDealAccessById)(payment.dealId, actor);
    // Stamp paidAt automatically when moving to PAID without an explicit timestamp.
    let paidAt = input.paidAt ? new Date(input.paidAt) : undefined;
    if (input.status === 'PAID' && !input.paidAt && !payment.paidAt) {
        paidAt = new Date();
    }
    return prisma_1.prisma.payment.update({
        where: { id },
        data: {
            label: input.label,
            amount: input.amount,
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
            status: input.status,
            method: input.method,
            reference: input.reference,
            note: input.note,
            paidAt,
        },
    });
}
async function deletePayment(id, actor) {
    const payment = await prisma_1.prisma.payment.findUnique({ where: { id } });
    if (!payment)
        throw new AppError_1.AppError('Payment not found', 404);
    await (0, deal_service_1.assertDealAccessById)(payment.dealId, actor);
    await prisma_1.prisma.payment.delete({ where: { id } });
}
