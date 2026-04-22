import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 8080);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const corsOrigin = configService.get<string>('app.corsOrigin', '*');
  const swaggerEnabled = configService.get<boolean>('app.swagger.enabled', true);

  // Security middlewares
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global prefix + versioning
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get<string>('app.apiVersion', '1').replace(/^v/, ''),
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  if (swaggerEnabled) {
    setupSwagger(app, configService);
  }

  app.enableShutdownHooks();

  await app.listen(port);
  const url = await app.getUrl();

  Logger.log(`🚀 Application running on: ${url}/${apiPrefix}`, 'Bootstrap');
  if (swaggerEnabled) {
    const docsPath = configService.get<string>('app.swagger.path', 'docs');
    Logger.log(`📚 Swagger docs: ${url}/${docsPath}`, 'Bootstrap');
  }
}

bootstrap();
