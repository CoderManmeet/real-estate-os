// src/controllers/dealDocument.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import * as dealDocumentService from '../services/dealDocument.service';

function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function upload(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    if (!req.file) throw new AppError('No file uploaded', 400);

    const { dealId, docType, title } = req.body;
    if (!dealId || !docType || !title) {
      throw new AppError('dealId, docType, and title are required', 400);
    }

    const document = await dealDocumentService.uploadDealDocument(
      req.file,
      dealId,
      docType,
      title,
      user
    );
    res.status(201).json({ success: true, data: document });
  } catch (err) {
    next(err);
  }
}

export async function listByDeal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const documents = await dealDocumentService.listDealDocuments(getParam(req, 'dealId'), user);
    res.status(200).json({ success: true, data: documents });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    await dealDocumentService.deleteDealDocument(getParam(req, 'id'), user);
    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
}