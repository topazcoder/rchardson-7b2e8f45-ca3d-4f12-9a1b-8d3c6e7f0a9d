/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
// Load environment variables for the API from apps/api/.env
import './env-config';

// Keep a reference to the Nest application so global error handlers can
// attempt a graceful shutdown before exiting the process.
let nestApp: INestApplication | null = null;

const handleFatalError = async (err: unknown, origin = 'uncaughtException') => {
  try {
    Logger.error(`Fatal ${origin}:`, (err as Error)?.stack || String(err));
    if (nestApp && typeof nestApp.close === 'function') {
      // attempt graceful shutdown
      // eslint-disable-next-line no-console
      console.log('Attempting graceful Nest shutdown...');
      await nestApp.close();
    }
  } catch (closeErr) {
    // eslint-disable-next-line no-console
    console.error('Error during shutdown', closeErr);
  } finally {
    // ensure we exit (allow logs to flush)
    setTimeout(() => process.exit(1), 100);
  }
};

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  handleFatalError(err, 'uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  // convert reason to Error when possible
  const err = reason instanceof Error ? reason : new Error(String(reason));
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  handleFatalError(err, 'unhandledRejection');
});

// graceful termination on signals
process.on('SIGTERM', async () => {
  Logger.log('SIGTERM received — shutting down gracefully');
  try {
    if (nestApp) await nestApp.close();
  } finally {
    process.exit(0);
  }
});

process.on('SIGINT', async () => {
  Logger.log('SIGINT received — shutting down gracefully');
  try {
    if (nestApp) await nestApp.close();
  } finally {
    process.exit(0);
  }
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  nestApp = app;
  // Enable CORS for the frontend (adjust CLIENT_URL in env if needed)
  const corsOrigin = process.env.CLIENT_URL || 'http://localhost:4300';
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
