import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

app.use(errorMiddleware);

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});