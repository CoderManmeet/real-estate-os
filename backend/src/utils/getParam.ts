import { Request } from 'express';

/**
 * Express 5's types allow route params to be string | string[]
 * (to support array-style paths). For a normal "/:id" route this
 * is always a single string at runtime — this helper asserts that
 * safely in one place instead of casting everywhere params are used.
 */
export function getParam(req: Request, key: string): string {
  const value = req.params[key];
  return Array.isArray(value) ? value[0] : value;
}