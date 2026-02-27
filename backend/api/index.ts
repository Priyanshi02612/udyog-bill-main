/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { Request, Response } from 'express';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

const server = express();
let isInitialized = false;

async function bootstrap() {
  if (isInitialized) {
    return;
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.init();
  isInitialized = true;
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  return server(req, res);
}
