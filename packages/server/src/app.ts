import express = require('express');
import type { Express } from 'express';
import type { DataSource } from 'typeorm';
import { createDataSource } from './config/db';
import { AliOssService } from './config/oss';
import { createAuthMiddleware } from './middlewares/auth';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { Component } from './entities/component.entity';
import { Page } from './entities/page.entity';
import { Resources } from './entities/resources.entity';
import { SubmissionAnswer } from './entities/submission-answer.entity';
import { Submission } from './entities/submission.entity';
import { User } from './entities/user.entity';
import { createLowCodeRouter } from './modules/low-code/low-code.routes';
import { LowCodeService } from './modules/low-code/low-code.service';
import { createResourcesRouter } from './modules/resources/resources.routes';
import { ResourcesService } from './modules/resources/resources.service';
import { createUserRouter } from './modules/user/user.routes';
import { UserService } from './modules/user/user.service';

export async function createApp(): Promise<{
  app: Express;
  dataSource: DataSource;
}> {
  const dataSource = createDataSource();
  await dataSource.initialize();

  const app = express();
  app.set('trust proxy', true);

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    return next();
  });
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  const authMiddleware = createAuthMiddleware(dataSource);
  const userService = new UserService(dataSource.getRepository(User));
  const lowCodeService = new LowCodeService(
    dataSource,
    dataSource.getRepository(Page),
    dataSource.getRepository(Component),
    dataSource.getRepository(Submission),
    dataSource.getRepository(SubmissionAnswer),
  );
  const resourcesService = new ResourcesService(
    new AliOssService(),
    dataSource.getRepository(Resources),
  );

  app.get('/api/healthz', (_req, res) => {
    res.status(200).send('ok');
  });

  app.use('/api/user', createUserRouter(userService));
  app.use('/api/low_code', createLowCodeRouter(lowCodeService, authMiddleware));
  app.use(
    '/api/resources',
    createResourcesRouter(resourcesService, authMiddleware),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, dataSource };
}
