import { NestFactory } from '@nestjs/core';
import { createApp } from './bootstrap';

async function bootstrap() {
  // Keep a direct Nest import in this entrypoint for Vercel Nest preset detection.
  void NestFactory;
  const app = await createApp();
  await app.listen(process.env.PORT ?? 8080);
}

void bootstrap();
