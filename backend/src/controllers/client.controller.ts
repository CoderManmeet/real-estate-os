import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { getParam } from '../utils/getParam';
import {
  createClientSchema,
  updateClientSchema,
  listClientsQuerySchema,
  createRequirementSchema,
  createNoteSchema,
  createTimelineEventSchema,
  propertyRefSchema,
} from '../validators/client.validator';
import * as clientService from '../services/client.service';
import { getOrCreatePortalLink } from '../services/client.service';


function requireUser(req: AuthRequest) {
  if (!req.user) throw new AppError('Not authenticated', 401);
  return req.user;
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createClientSchema.parse(req.body);
    const client = await clientService.createClient(input, user.userId);
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = listClientsQuerySchema.parse(req.query);
    const result = await clientService.listClients(query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const client = await clientService.getClientById(getParam(req, 'id'));
    res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = updateClientSchema.parse(req.body);
    const client = await clientService.updateClient(getParam(req, 'id'), input, user.userId);
    res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await clientService.deleteClient(getParam(req, 'id'));
    res.status(200).json({ success: true, message: 'Client deleted' });
  } catch (err) {
    next(err);
  }
}

export async function addRequirement(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = createRequirementSchema.parse(req.body);
    const requirement = await clientService.addRequirement(getParam(req, 'id'), input);
    res.status(201).json({ success: true, data: requirement });
  } catch (err) {
    next(err);
  }
}

export async function addNote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createNoteSchema.parse(req.body);
    const note = await clientService.addNote(getParam(req, 'id'), input, user.userId);
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
}

export async function addTimelineEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const input = createTimelineEventSchema.parse(req.body);
    const event = await clientService.addTimelineEvent(getParam(req, 'id'), input, user.userId);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { propertyId } = propertyRefSchema.parse(req.body);
    const favorite = await clientService.addFavorite(getParam(req, 'id'), propertyId);
    res.status(201).json({ success: true, data: favorite });
  } catch (err) {
    next(err);
  }
}

export async function removeFavorite(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await clientService.removeFavorite(getParam(req, 'id'), getParam(req, 'propertyId'));
    res.status(200).json({ success: true, message: 'Favorite removed' });
  } catch (err) {
    next(err);
  }
}

export async function shareProperty(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = requireUser(req);
    const { propertyId } = propertyRefSchema.parse(req.body);
    const shared = await clientService.shareProperty(getParam(req, 'id'), propertyId, user.userId);
    res.status(201).json({ success: true, data: shared });
  } catch (err) {
    next(err);
  }
}

export async function getPortalLink(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = await getOrCreatePortalLink(getParam(req, 'id'));
    res.status(200).json({ success: true, data: { token } });
  } catch (err) {
    next(err);
  }
}