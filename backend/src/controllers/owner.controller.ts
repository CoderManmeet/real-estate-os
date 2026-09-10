// src/controllers/owner.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  createOwnerSchema,
  updateOwnerSchema,
  listOwnersQuerySchema,
  linkPropertySchema,
} from '../validators/owner.validator';
import * as ownerService from '../services/owner.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createOwnerSchema.parse(req.body);
    const owner = await ownerService.createOwner(input, user.userId);
    res.status(201).json({ success: true, data: owner });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = listOwnersQuerySchema.parse(req.query);
    const data = await ownerService.listOwners(query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const owner = await ownerService.getOwnerById(getParam(req, 'id'));
    res.status(200).json({ success: true, data: owner });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updateOwnerSchema.parse(req.body);
    const owner = await ownerService.updateOwner(getParam(req, 'id'), input);
    res.status(200).json({ success: true, data: owner });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await ownerService.deleteOwner(getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Owner deleted' });
  } catch (err) {
    next(err);
  }
}

export async function linkProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = linkPropertySchema.parse(req.body);
    const owner = await ownerService.linkProperty(getParam(req, 'id'), input.propertyId);
    res.status(200).json({ success: true, data: owner });
  } catch (err) {
    next(err);
  }
}

export async function unlinkProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const owner = await ownerService.unlinkProperty(
      getParam(req, 'id'),
      getParam(req, 'propertyId')
    );
    res.status(200).json({ success: true, data: owner });
  } catch (err) {
    next(err);
  }
}