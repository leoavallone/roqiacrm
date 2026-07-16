import { Schema, model, type InferSchemaType } from 'mongoose';

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Cliente', 'RoqIA', 'Prototipo', 'Melhoria'], default: 'RoqIA', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', default: null },
    ownerId: { type: Schema.Types.ObjectId, ref: 'TeamMember', required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Pendente', 'Em andamento', 'Impedimento', 'Concluida'], default: 'Pendente', required: true },
    description: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export type TaskDocument = InferSchemaType<typeof taskSchema>;
export const TaskModel = model('Task', taskSchema);
