import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getParam } from '../utils/getParam';
import * as portalService from '../services/portal.service';

const propertyRefSchema = z.object({ propertyId: z.string().uuid() });

export async function getPortal(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await portalService.getPortalData(getParam(req, 'token'));
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const { propertyId } = propertyRefSchema.parse(req.body);
    const favorite = await portalService.addPortalFavorite(getParam(req, 'token'), propertyId);
    res.status(201).json({ success: true, data: favorite });
  } catch (err) {
    next(err);
  }
}

export async function removeFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    await portalService.removePortalFavorite(getParam(req, 'token'), getParam(req, 'propertyId'));
    res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
}

export async function confirmVisit(req: Request, res: Response, next: NextFunction) {
  try {
    const visit = await portalService.confirmSiteVisitAsClient(
      getParam(req, 'token'),
      getParam(req, 'visitId')
    );
    res.status(200).json({ success: true, data: visit });
  } catch (err) {
    next(err);
  }
}