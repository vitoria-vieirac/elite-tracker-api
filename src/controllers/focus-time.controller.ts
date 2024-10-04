import { Request, Response } from 'express';
import { z } from 'zod';
import { buildValidationErrorMessage } from '../utils/build-validation-error-message.util';
import dayjs from 'dayjs';
import { focusTimeModel } from '../models/focus-time.model';

export class FocusTimeController {
  store = async (request: Request, response: Response) => {
    const schema = z.object({
      timeFrom: z.coerce.date(),
      timeTo: z.coerce.date(),
    });

    const focusTime = schema.safeParse(request.body);

    if (!focusTime.success) {
      const errors = buildValidationErrorMessage(focusTime.error.issues);

      return response.status(422).json({ message: errors });
    }

    const timeFrom = dayjs(focusTime.data.timeFrom);
    const timeTo = dayjs(focusTime.data.timeTo);

    const isTimeToBeforeTimeFrom = timeTo.isBefore(timeFrom);

    if (isTimeToBeforeTimeFrom) {
      return response
        .status(400)
        .json({ message: 'Time to cannot be in the past.' });
    }

    const createFocusTime = await focusTimeModel.create({
      timeFrom: timeFrom.toDate(),
      timeTo: timeTo.toDate(),
    });

    return response.status(201).json(createFocusTime);
  };

  metricsByMonth = async (request: Request, response: Response) => {
    const schema = z.object({
      date: z.coerce.date(),
    });

    const validated = schema.safeParse(request.query);

    if (!validated.success) {
      const errors = buildValidationErrorMessage(validated.error.issues);

      return response.status(422).json({ message: errors });
    }

    const startDate = dayjs(validated.data.date).startOf('month');
    const endDate = dayjs(validated.data.date).endOf('month');

    const focusTimesMetrics = await focusTimeModel
      .aggregate()
      .match({
        timeFrom: {
          $gte: startDate.toDate(),
          $lte: endDate.toDate(),
        },
      })
      .project({
        year: {
          $year: '$timeFrom',
        },
        month: {
          $month: '$timeFrom',
        },
        day: {
          $dayOfMonth: '$timeFrom',
        },
      })
      .group({
        _id: ['$year', '$month', '$day'],
        cont: {
          $sum: 1,
        },
      })
      .sort({
        _id: 1,
      });

    return response.status(200).json(focusTimesMetrics);
  };
}
