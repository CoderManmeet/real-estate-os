import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  createBuilderSchema,
  updateBuilderSchema,
  listBuildersQuerySchema,
} from '../validators/builder.validator';
import {
  createBuilder,
  listBuilders,
  getBuilderById,
  updateBuilder,
  deleteBuilder,
} from '../services/builder.service';

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = createBuilderSchema.parse(req.body);
    const builder = await createBuilder(input);
    res.status(201).json({ success: true, data: builder });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = listBuildersQuerySchema.parse(req.query);
    const result = await listBuilders(query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const builder = await getBuilderById(req.params.id);
    res.status(200).json({ success: true, data: builder });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updateBuilderSchema.parse(req.body);
    const builder = await updateBuilder(req.params.id, input);
    res.status(200).json({ success: true, data: builder });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteBuilder(req.params.id);
    res.status(200).json({ success: true, message: 'Builder deleted' });
  } catch (err) {
    next(err);
  }
}