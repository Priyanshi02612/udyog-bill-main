/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { INestApplication } from '@nestjs/common';
import { createApp } from '../src/bootstrap';

let cachedApp: INestApplication | null = null;

async function getApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await createApp();
  await app.init();
  cachedApp = app;

  return app;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}
