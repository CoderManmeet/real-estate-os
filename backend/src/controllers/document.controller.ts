import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import * as documentService from '../services/document.service';

export async function upload(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    if (!req.file) throw new AppError('No file uploaded', 400);

    const { propertyId, docType, title } = req.body;
    if (!propertyId || !docType || !title) {
      throw new AppError('propertyId, docType, and title are required', 400);
    }

    const document = await documentService.uploadDocument(
      req.file,
      propertyId,
      docType,
      title,
      req.user.userId
    );
    res.status(201).json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
}

export async function listByProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const documents = await documentService.listDocumentsByProperty(getParam(req, 'propertyId'));
    res.status(200).json({ success: true, data: documents });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await documentService.deleteDocument(getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
}