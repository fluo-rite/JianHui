import { DataSource } from 'typeorm';
import { env } from './env';
import { Component } from '../entities/component.entity';
import { ComponentData } from '../entities/component-data.entity';
import { Page } from '../entities/page.entity';
import { Resources } from '../entities/resources.entity';
import { User } from '../entities/user.entity';

export function createDataSource() {
  return new DataSource({
    type: 'mysql',
    host: env.dbHost,
    port: env.dbPort,
    username: env.dbUsername,
    password: env.dbPassword,
    database: env.dbDatabase,
    entities: [User, Page, Component, ComponentData, Resources],
  });
}
