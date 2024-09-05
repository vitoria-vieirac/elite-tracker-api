import { Router, request } from 'express';
import packageJson from '../package.json';
import { HabitsController } from './controllers/habits.controller';

export const routes = Router();

routes.get('/', (request, response) => {
  const { name, description, version } = packageJson;
  return response.status(200).json({ name, description, version });
});

const habitsController = new HabitsController();

routes.get('/habits', habitsController.index);

routes.post('/habits', habitsController.store);

routes.delete('/habits/:id', habitsController.remove);

routes.patch('/habits/:id/toggle', habitsController.toggle);
