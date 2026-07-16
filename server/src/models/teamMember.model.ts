import { Schema, model, type InferSchemaType } from 'mongoose';

const teamMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type TeamMemberDocument = InferSchemaType<typeof teamMemberSchema>;
export const TeamMemberModel = model('TeamMember', teamMemberSchema);
