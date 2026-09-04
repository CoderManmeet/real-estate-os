import { Request, Response, NextFunction } from 'express';
import { getParam } from '../utils/getParam';
import {
  propertyRefSchema,
  feedbackSchema,
  commentSchema,
  trackSchema,
  visitRequestSchema,
} from '../validators/portal.validator';
import * as portalService from '../services/portal.service';

export async function getPortal(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await portalService.getPortalData(getParam(req, 'token'));
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await portalService.getCollectionData(getParam(req, 'token'));
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

export async function setFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const input = feedbackSchema.parse(req.body);
    const data = await portalService.setPortalFeedback(getParam(req, 'token'), input);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction) {
  try {
    const input = commentSchema.parse(req.body);
    const data = await portalService.addPortalComment(getParam(req, 'token'), input);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function track(req: Request, res: Response, next: NextFunction) {
  try {
    const input = trackSchema.parse(req.body);
    const data = await portalService.trackPortalEvent(getParam(req, 'token'), input);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function requestVisit(req: Request, res: Response, next: NextFunction) {
  try {
    const input = visitRequestSchema.parse(req.body);
    const data = await portalService.requestSiteVisit(getParam(req, 'token'), input);
    res.status(201).json({ success: true, data });
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