import { Schema, model, type InferSchemaType } from 'mongoose';

const financeTransactionSchema = new Schema(
  {
    type: { type: String, enum: ['Entrada', 'Saida'], required: true },
    description: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

export type FinanceTransactionDocument = InferSchemaType<typeof financeTransactionSchema>;
export const FinanceTransactionModel = model('FinanceTransaction', financeTransactionSchema);
