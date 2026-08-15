"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoice = createInvoice;
exports.listInvoices = listInvoices;
exports.getInvoiceById = getInvoiceById;
exports.updateInvoice = updateInvoice;
exports.deleteInvoice = deleteInvoice;
const prisma_1 = require("../config/prisma");
const AppError_1 = require("../utils/AppError");
function generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${random}`;
}
const invoiceInclude = {
    client: { select: { id: true, fullName: true, phone: true } },
    property: { select: { id: true, title: true } },
};
async function createInvoice(input, userId) {
    const client = await prisma_1.prisma.client.findUnique({ where: { id: input.clientId } });
    if (!client)
        throw new AppError_1.AppError('Client not found', 404);
    if (input.propertyId) {
        const property = await prisma_1.prisma.property.findUnique({ where: { id: input.propertyId } });
        if (!property)
            throw new AppError_1.AppError('Property not found', 404);
    }
    return prisma_1.prisma.invoice.create({
        data: {
            ...input,
            dueDate: new Date(input.dueDate),
            invoiceNumber: generateInvoiceNumber(),
            createdById: userId,
        },
        include: invoiceInclude,
    });
}
async function listInvoices() {
    return prisma_1.prisma.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        include: invoiceInclude,
    });
}
async function getInvoiceById(id) {
    const invoice = await prisma_1.prisma.invoice.findUnique({ where: { id }, include: invoiceInclude });
    if (!invoice)
        throw new AppError_1.AppError('Invoice not found', 404);
    return invoice;
}
async function updateInvoice(id, input) {
    const existing = await prisma_1.prisma.invoice.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.AppError('Invoice not found', 404);
    return prisma_1.prisma.invoice.update({
        where: { id },
        data: {
            ...input,
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        },
        include: invoiceInclude,
    });
}
async function deleteInvoice(id) {
    const existing = await prisma_1.prisma.invoice.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.AppError('Invoice not found', 404);
    await prisma_1.prisma.invoice.delete({ where: { id } });
}
