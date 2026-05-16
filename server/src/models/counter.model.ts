import { Schema, model } from 'mongoose';

const counterSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 1000 },
});

export const CounterModel = model('Counter', counterSchema);
