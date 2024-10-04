import { Schema, model } from 'mongoose';

const focusTimeSchema = new Schema(
  {
    timeFrom: {
      type: Date,
      required: true,
    },
    timeTo: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const focusTimeModel = model('focusTime', focusTimeSchema);
