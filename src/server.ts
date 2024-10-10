import 'dotenv/config';
import express from 'express';
import { routes } from './routes';
import { setupMongo } from './database';

const app = express();

setupMongo()
  .then(() => {
    app.use(express.json());
    app.use(routes);

    app.get('/', (request, response) => {
      return response.send('Hello Express!');
    });

    app.listen(4000, () => console.log(`🚀 Server is running at port 4000!`));
  })
  .catch((err) => {
    console.error(err.message);
  });
