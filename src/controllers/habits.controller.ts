import { Request, Response } from 'express';
import { habitModel } from '../models/habit.model';
import { z } from 'zod';
import { buildValidationErrorMessage } from '../utils/build-validation-error-message.util';
import dayjs from 'dayjs';
import mongoose from 'mongoose';

export class HabitsController {
  store = async (request: Request, response: Response): Promise<Response> => {
    const schema = z.object({
      name: z.string(),
    });

    const habit = schema.safeParse(request.body);

    if (!habit.success) {
      const errors = buildValidationErrorMessage(habit.error.issues);

      return response.status(422).json({ message: errors });
    }

    const findHabit = await habitModel.findOne({
      name: habit.data.name,
    });

    if (findHabit) {
      return response.status(400).json({ message: 'Habit already exists' });
    }

    const newHabit = await habitModel.create({
      name: habit.data.name,
      completedDates: [],
    });

    return response.status(201).json(newHabit);
  };

  index = async (request: Request, response: Response) => {
    //.sort = name: 1 vai deixar em ordem alfabética
    const habits = await habitModel.find().sort({ name: 1 });

    return response.status(200).json(habits);
  };

  remove = async (request: Request, response: Response) => {
    const schema = z.object({
      id: z.string(),
    });

    const habit = schema.safeParse(request.params);

    if (!habit.success) {
      const errors = buildValidationErrorMessage(habit.error.issues);

      return response.status(422).json({ message: errors });
    }

    const findHabit = await habitModel.findOne({
      _id: habit.data.id,
    });

    if (!findHabit) {
      return response.status(404).json({ message: 'Habit not found.' });
    }

    await habitModel.deleteOne({
      _id: habit.data.id,
    });

    return response.status(204).send();
  };

  toggle = async (request: Request, response: Response) => {
    const schema = z.object({
      id: z.string(),
    });

    const validated = schema.safeParse(request.params);

    if (!validated.success) {
      const errors = buildValidationErrorMessage(validated.error.issues);

      return response.status(422).json({ message: errors });
    }

    const findHabit = await habitModel.findOne({
      _id: validated.data.id,
    });

    if (!findHabit) {
      return response.status(404).json({ message: 'Habit not found.' });
    }

    const now = dayjs().startOf('day').toISOString();

    const isHabitCompletedOnDate = findHabit
      .toObject()
      ?.completedDates.find(
        (item) => dayjs(String(item)).toISOString() === now,
      );

    if (isHabitCompletedOnDate) {
      const habitUpdate = await habitModel.findByIdAndUpdate(
        {
          _id: validated.data.id,
        },

        {
          $pull: {
            completedDates: now,
          },
        },
        {
          returnDocument: 'after',
        },
      );
      return response.status(200).json(habitUpdate);
    }

    const habitUpdate = await habitModel.findByIdAndUpdate(
      {
        _id: validated.data.id,
      },

      {
        $push: {
          completedDates: now,
        },
      },
      {
        returnDocument: 'after',
      },
    );

    return response.json(habitUpdate);
  };

  metrics = async (request: Request, response: Response) => {
    const schema = z.object({
      id: z.string(),
      date: z.coerce.date(),
    });

    const validated = schema.safeParse({ ...request.params, ...request.body });

    if (!validated.success) {
      const errors = buildValidationErrorMessage(validated.error.issues);

      return response.status(422).json({ message: errors });
    }

    const dateFrom = dayjs(validated.data.date).startOf('month');
    const dateTo = dayjs(validated.data.date).endOf('month');

    const [habitMetrics] = await habitModel
      .aggregate()
      .match({
        _id: new mongoose.Types.ObjectId(validated.data.id),
      })
      .project({
        _id: 1,
        name: 1,
        completedDates: {
          $filter: {
            input: '$completedDates',
            as: 'completedDate',
            cond: {
              $and: [
                {
                  $gte: ['$$completedDate', dateFrom.toDate()],
                },
                {
                  $lte: ['$$completedDate', dateTo.toDate()],
                },
              ],
            },
          },
        },
      });

    if (!habitMetrics) {
      return response.status(404).json({ message: 'Habit not found.' });
    }

    return response.status(200).json(habitMetrics);
  };
}
