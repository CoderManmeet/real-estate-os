import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import { createInvoiceSchema, updateInvoiceSchema } from '../validators/invoice.validator';
import * as invoiceService from '../services/invoice.service';

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const input = createInvoiceSchema.parse(req.body);
    const invoice = await invoiceService.createInvoice(input, req.user.userId);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const invoices = await invoiceService.listInvoices();
    res.status(200).json({ success: true, data: invoices });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const invoice = await invoiceService.getInvoiceById(getParam(req, 'id'));
    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updateInvoiceSchema.parse(req.body);
    const invoice = await invoiceService.updateInvoice(getParam(req, 'id'), input);
    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await invoiceService.deleteInvoice(getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Invoice deleted' });
  } catch (err) {
    next(err);
  }
}