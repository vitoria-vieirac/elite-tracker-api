import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { routes } from './routes';
import { setupMongo } from './database';

const app = express();

setupMongo()
  .then(() => {
    app.use(
      cors({
        origin: true,
      }),
    );
    app.use(express.json());
    app.use(routes);

    app.listen(4000, () => console.log(`🚀 Server is running at port 4000!`));
  })
  .catch((err) => {
    console.error(err.message);
  });
