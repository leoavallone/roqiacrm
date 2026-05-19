import { Schema, model, type InferSchemaType } from 'mongoose';

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    plan: { type: String, required: true, trim: true },
    monthlyValue: { type: Number, required: true, min: 0 },
    dueDay: { type: Number, required: true, min: 1, max: 31 },
    nextDueDate: { type: Date, required: true },
    status: { type: String, enum: ['Ativa', 'Pendente', 'Vencida'], default: 'Ativa', required: true },
    serviceMode: { type: String, enum: ['solo', 'partnership'], default: 'solo', required: true },
  },
  { timestamps: true },
);

export type CustomerDocument = InferSchemaType<typeof customerSchema>;
export const CustomerModel = model('Customer', customerSchema);
