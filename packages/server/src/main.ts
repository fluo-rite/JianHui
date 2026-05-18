import 'reflect-metadata';
import { createApp } from './app';
import { env } from './config/env';

async function bootstrap() {
  const { app } = await createApp();
  app.listen(env.port, () => {
    console.log(`server listening on ${env.port}`);
  });
}

bootstrap();
