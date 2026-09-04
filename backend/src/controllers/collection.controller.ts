import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  createCollectionSchema,
  updateCollectionSchema,
  addPropertySchema,
  regenerateAccessSchema,
  listCollectionsQuerySchema,
} from '../validators/collection.validator';
import * as collectionService from '../services/collection.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createCollectionSchema.parse(req.body);
    const collection = await collectionService.createCollection(input, user.userId);
    res.status(201).json({ success: true, data: collection });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = listCollectionsQuerySchema.parse(req.query);
    const collections = await collectionService.listCollections(query);
    res.status(200).json({ success: true, data: collections });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const collection = await collectionService.getCollectionById(getParam(req, 'id'));
    res.status(200).json({ success: true, data: collection });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updateCollectionSchema.parse(req.body);
    const collection = await collectionService.updateCollection(getParam(req, 'id'), input);
    res.status(200).json({ success: true, data: collection });
  } catch (err) {
    next(err);
  }
}

export async function addProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const { propertyId } = addPropertySchema.parse(req.body);
    const collection = await collectionService.addPropertyToCollection(
      getParam(req, 'id'),
      propertyId,
      user.userId
    );
    res.status(201).json({ success: true, data: collection });
  } catch (err) {
    next(err);
  }
}

export async function removeProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const collection = await collectionService.removePropertyFromCollection(
      getParam(req, 'id'),
      getParam(req, 'propertyId')
    );
    res.status(200).json({ success: true, data: collection });
  } catch (err) {
    next(err);
  }
}

export async function revoke(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const collection = await collectionService.revokeCollectionAccess(getParam(req, 'id'));
    res.status(200).json({ success: true, data: collection });
  } catch (err) {
    next(err);
  }
}

export async function regenerate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = regenerateAccessSchema.parse(req.body);
    const collection = await collectionService.regenerateCollectionAccess(
      getParam(req, 'id'),
      input
    );
    res.status(200).json({ success: true, data: collection });
  } catch (err) {
    next(err);
  }
}