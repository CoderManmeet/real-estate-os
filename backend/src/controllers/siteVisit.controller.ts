import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  createSiteVisitSchema,
  updateSiteVisitSchema,
  listSiteVisitsQuerySchema,
} from '../validators/siteVisit.validator';
import * as siteVisitService from '../services/siteVisit.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createSiteVisitSchema.parse(req.body);
    const siteVisit = await siteVisitService.createSiteVisit(input, user.userId);
    res.status(201).json({ success: true, data: siteVisit });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = listSiteVisitsQuerySchema.parse(req.query);
    const result = await siteVisitService.listSiteVisits(query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const siteVisit = await siteVisitService.getSiteVisitById(getParam(req, 'id'));
    res.status(200).json({ success: true, data: siteVisit });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = updateSiteVisitSchema.parse(req.body);
    const siteVisit = await siteVisitService.updateSiteVisit(getParam(req, 'id'), input, user.userId);
    res.status(200).json({ success: true, data: siteVisit });
  } catch (err) {
    next(err);
  }
}

export async function confirmClient(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const siteVisit = await siteVisitService.confirmByClient(getParam(req, 'id'));
    res.status(200).json({ success: true, data: siteVisit });
  } catch (err) {
    next(err);
  }
}

export async function confirmBuilder(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const siteVisit = await siteVisitService.confirmByBuilder(getParam(req, 'id'));
    res.status(200).json({ success: true, data: siteVisit });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await siteVisitService.deleteSiteVisit(getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Site visit deleted' });
  } catch (err) {
    next(err);
  }
}