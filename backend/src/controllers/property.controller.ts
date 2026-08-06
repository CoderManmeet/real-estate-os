import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  listPropertiesQuerySchema,
} from '../validators/property.validator';
import {
  createProperty,
  listProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '../services/property.service';
import { AppError } from '../utils/AppError';

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const input = createPropertySchema.parse(req.body);
    const property = await createProperty(input, req.user.userId);
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = listPropertiesQuerySchema.parse(req.query);
    const result = await listProperties(query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const property = await getPropertyById(req.params.id);
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updatePropertySchema.parse(req.body);
    const property = await updateProperty(req.params.id, input);
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteProperty(req.params.id);
    res.status(200).json({ success: true, message: 'Property deleted' });
  } catch (err) {
    next(err);
  }
}