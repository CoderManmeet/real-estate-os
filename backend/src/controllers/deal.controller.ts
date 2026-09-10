// src/controllers/deal.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  createDealSchema,
  updateDealSchema,
  transitionDealSchema,
  listDealsQuerySchema,
} from '../validators/deal.validator';
import * as dealService from '../services/deal.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createDealSchema.parse(req.body);
    const deal = await dealService.createDeal(input, user);
    res.status(201).json({ success: true, data: deal });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const query = listDealsQuerySchema.parse(req.query);
    const data = await dealService.listDeals(query, user);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const deal = await dealService.getDealById(getParam(req, 'id'), user);
    res.status(200).json({ success: true, data: deal });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = updateDealSchema.parse(req.body);
    const deal = await dealService.updateDeal(getParam(req, 'id'), input, user);
    res.status(200).json({ success: true, data: deal });
  } catch (err) {
    next(err);
  }
}

export async function transition(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = transitionDealSchema.parse(req.body);
    const deal = await dealService.transitionDeal(getParam(req, 'id'), input, user);
    res.status(200).json({ success: true, data: deal });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    await dealService.deleteDeal(getParam(req, 'id'), user);
    res.status(200).json({ success: true, message: 'Deal deleted' });
  } catch (err) {
    next(err);
  }
}