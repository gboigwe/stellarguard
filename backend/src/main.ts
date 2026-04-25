import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { config } from './config';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const wildcardCors =
    config.corsOrigin === '*' ||
    (Array.isArray(config.corsOrigin) && config.corsOrigin.includes('*'));
  if (config.nodeEnv === 'production' && wildcardCors) {
    Logger.warn(
      "CORS_ORIGIN is '*' in production. Restrict it before exposing this service.",
      'Bootstrap',
    );
  }

  app.enableCors({
    origin: config.corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  Logger.log(`StellarGuard API Server running on: http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap().catch((err) => {
  Logger.error(`Error starting server: ${err.message}`, 'Bootstrap');
  process.exit(1);
});
