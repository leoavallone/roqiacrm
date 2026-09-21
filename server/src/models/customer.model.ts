import { Schema, model, type InferSchemaType } from 'mongoose';

const customerSchema = new Schema(
  {
    photo: { type: String, default: '' },
    name: { type: String, default: '', trim: true },
    contact: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    contractDuration: { type: String, default: '', trim: true },
    monthlyValue: { type: Number, default: 0, min: 0 },
    dueDay: { type: Number, default: 0, min: 0, max: 31 },
    nextDueDate: { type: Date, default: null },
    status: { type: String, enum: ['Ativa', 'Inativo', 'Pendente', 'Vencida'], default: 'Ativa' },
    serviceMode: { type: String, enum: ['solo', 'partnership'], default: 'solo' },
  },
  { timestamps: true },
);

export type CustomerDocument = InferSchemaType<typeof customerSchema>;
export const CustomerModel = model('Customer', customerSchema);
