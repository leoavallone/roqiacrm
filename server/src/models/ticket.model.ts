import { Schema, model, type InferSchemaType } from 'mongoose';

const ticketHistorySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, _id: true },
);

const ticketSchema = new Schema(
  {
    number: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    category: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['Baixa', 'Media', 'Alta', 'Urgente'], default: 'Media', required: true },
    status: { type: String, enum: ['Aberto', 'Em andamento', 'Resolvido'], default: 'Aberto', required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedToId: { type: Schema.Types.ObjectId, ref: 'TeamMember', default: null },
    history: { type: [ticketHistorySchema], default: [] },
  },
  { timestamps: true },
);

export type TicketDocument = InferSchemaType<typeof ticketSchema>;
export const TicketModel = model('Ticket', ticketSchema);
