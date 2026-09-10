// src/controllers/payment.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  createPaymentSchema,
  updatePaymentSchema,
  listPaymentsQuerySchema,
} from '../validators/payment.validator';
import * as paymentService from '../services/payment.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createPaymentSchema.parse(req.body);
    const payment = await paymentService.createPayment(input, user);
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const query = listPaymentsQuerySchema.parse(req.query);
    const payments = await paymentService.listPayments(query, user);
    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = updatePaymentSchema.parse(req.body);
    const payment = await paymentService.updatePayment(getParam(req, 'id'), input, user);
    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    await paymentService.deletePayment(getParam(req, 'id'), user);
    res.status(200).json({ success: true, message: 'Payment deleted' });
  } catch (err) {
    next(err);
  }
}