import { Schema, model } from 'mongoose';

const HabitSchema = new Schema(
  {
    name: String,
    completedDates: [Date],
    userId: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const habitModel = model('Habit', HabitSchema);
