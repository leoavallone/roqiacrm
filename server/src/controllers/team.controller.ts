import type { Request, Response } from 'express';
import { TeamMemberModel } from '../models/teamMember.model.js';
import { UserModel } from '../models/user.model.js';
import { teamMemberSchema } from '../validators/schemas.js';
import { HttpError } from '../utils/httpError.js';

const roleLabels = {
  superAdmin: 'Super administrador',
  admin: 'Administrador',
  collaborator: 'Colaborador',
} as const;

export async function listTeamMembers(_req: Request, res: Response) {
  const users = await UserModel.find({ role: { $in: Object.keys(roleLabels) } }).select('_id name role');

  if (users.length > 0) {
    await TeamMemberModel.bulkWrite(
      users.map((user) => ({
        updateOne: {
          filter: { userId: user._id },
          update: {
            $set: {
              name: user.name,
              role: roleLabels[user.role as keyof typeof roleLabels],
              active: true,
            },
            $setOnInsert: { userId: user._id },
          },
          upsert: true,
        },
      })),
    );
  }

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
