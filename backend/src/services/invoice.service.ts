import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../validators/invoice.validator';

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${random}`;
}

const invoiceInclude = {
  client: { select: { id: true, fullName: true, phone: true } },
  property: { select: { id: true, title: true } },
};

export async function createInvoice(input: CreateInvoiceInput, userId: string) {
  const client = await prisma.client.findUnique({ where: { id: input.clientId } });
  if (!client) throw new AppError('Client not found', 404);

  if (input.propertyId) {
    const property = await prisma.property.findUnique({ where: { id: input.propertyId } });
    if (!property) throw new AppError('Property not found', 404);
  }

  return prisma.invoice.create({
    data: {
      ...input,
      dueDate: new Date(input.dueDate),
      invoiceNumber: generateInvoiceNumber(),
      createdById: userId,
    },
    include: invoiceInclude,
  });
}

export async function listInvoices() {
  return prisma.invoice.findMany({
    orderBy: { createdAt: 'desc' },
    include: invoiceInclude,
  });
}

export async function getInvoiceById(id: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: invoiceInclude });
  if (!invoice) throw new AppError('Invoice not found', 404);
  return invoice;
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw new AppError('Invoice not found', 404);

  return prisma.invoice.update({
    where: { id },
    data: {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
    include: invoiceInclude,
  });
}

export async function deleteInvoice(id: string) {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw new AppError('Invoice not found', 404);
  await prisma.invoice.delete({ where: { id } });
}