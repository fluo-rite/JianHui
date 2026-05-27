import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

async function initSchema() {
  const schemaPath = resolve(__dirname, 'init-schema.sql');
  const schemaSql = readFileSync(schemaPath, 'utf8');

  const rootConnection = await mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUsername,
    password: env.dbPassword,
    multipleStatements: true,
  });

  try {
    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.dbDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await rootConnection.end();
  }

  const dbConnection = await mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUsername,
    password: env.dbPassword,
    database: env.dbDatabase,
    multipleStatements: true,
  });

  try {
    await dbConnection.query(schemaSql);
    console.log(`database schema initialized: ${env.dbDatabase}`);
  } finally {
    await dbConnection.end();
  }
}

initSchema().catch((error) => {
  console.error('failed to initialize schema', error);
  process.exit(1);
});
