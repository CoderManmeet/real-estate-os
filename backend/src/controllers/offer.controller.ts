// src/controllers/offer.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  createOfferSchema,
  updateOfferSchema,
  listOffersQuerySchema,
} from '../validators/offer.validator';
import * as offerService from '../services/offer.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createOfferSchema.parse(req.body);
    const offer = await offerService.createOffer(input, user.userId);
    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = listOffersQuerySchema.parse(req.query);
    const offers = await offerService.listOffers(query);
    res.status(200).json({ success: true, data: offers });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offer = await offerService.getOfferById(getParam(req, 'id'));
    res.status(200).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updateOfferSchema.parse(req.body);
    const offer = await offerService.updateOffer(getParam(req, 'id'), input);
    res.status(200).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await offerService.deleteOffer(getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Offer deleted' });
  } catch (err) {
    next(err);
  }
}