import type { Request } from 'express';
import type { FilterQuery } from 'mongoose';
import type { CustomerDocument } from '../models/customer.model.js';

export const internalRoles = ['superAdmin', 'admin', 'collaborator'] as const;

export function canManageAll(req: Request) {
  return req.user?.role === 'superAdmin';
}

export function canManagePartnership(req: Request) {
  return req.user?.role === 'superAdmin' || req.user?.role === 'admin';
}

export function getCustomerScope(req: Request): FilterQuery<CustomerDocument> | null {
  if (req.user?.role === 'superAdmin') {
    return {};
  }

  if (req.user?.role === 'admin') {
    return { serviceMode: 'partnership' };
  }

  if (req.user?.role === 'client') {
    return req.user.customerId ? { _id: req.user.customerId } : null;
  }

  return null;
}
