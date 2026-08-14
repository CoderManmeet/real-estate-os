import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getParam } from '../utils/getParam';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator';
import {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from '../services/project.service';

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = createProjectSchema.parse(req.body);
    const project = await createProject(input);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const project = await getProjectById(getParam(req, 'id'));
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = updateProjectSchema.parse(req.body);
    const project = await updateProject(getParam(req, 'id'), input);
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteProject(getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
}