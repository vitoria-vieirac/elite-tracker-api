import { Schema, model } from 'mongoose';
import { string } from 'zod';

const focusTimeSchema = new Schema(
  {
    timeFrom: Date,
    timeTo: Date,
    userId: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const focusTimeModel = model('focusTime', focusTimeSchema);
