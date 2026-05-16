import type { Request, Response } from 'express';
import { TeamMemberModel } from '../models/teamMember.model.js';
import { teamMemberSchema } from '../validators/schemas.js';
import { HttpError } from '../utils/httpError.js';

export async function listTeamMembers(_req: Request, res: Response) {
  const team = await TeamMemberModel.find().sort({ createdAt: -1 });
  res.json({ team });
}

export async function createTeamMember(req: Request, res: Response) {
  const data = teamMemberSchema.parse(req.body);
  const member = await TeamMemberModel.create(data);
  res.status(201).json({ member });
}

export async function updateTeamMember(req: Request, res: Response) {
  const data = teamMemberSchema.partial().parse(req.body);
  const member = await TeamMemberModel.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  if (!member) {
    throw new HttpError(404, 'Responsavel nao encontrado.');
  }

  res.json({ member });
}

export async function deleteTeamMember(req: Request, res: Response) {
  const member = await TeamMemberModel.findByIdAndDelete(req.params.id);

  if (!member) {
    throw new HttpError(404, 'Responsavel nao encontrado.');
  }

  res.status(204).send();
}
