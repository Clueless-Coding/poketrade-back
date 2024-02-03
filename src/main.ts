import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from './infra/config/env.config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AppExceptionFilter } from './api/filters/app-exception.filter';

const GLOBAL_PREFIX = 'api';
const PUBLIC_PATH = './public';

function initializeSwaggerDocumentation(app: INestApplication) {
  const swaggerDocs = new DocumentBuilder()
    .setTitle('Poketrade API')
    .addSecurity('AccessToken', {
      type: 'apiKey',
      in: 'header',
      name: 'x-access-token',
    })
    .addSecurity('RefreshToken', {
      type: 'apiKey',
      in: 'header',
      name: 'x-refresh-token',
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerDocs);
  SwaggerModule.setup(`/${GLOBAL_PREFIX}/docs`, app, document);

  if (!fs.existsSync(PUBLIC_PATH)) {
    fs.mkdirSync(PUBLIC_PATH);
  }

  fs.writeFileSync(path.join(PUBLIC_PATH, 'swagger.json'), JSON.stringify(document, null, 2));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService<EnvVariables>);

  app.setGlobalPrefix(GLOBAL_PREFIX);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AppExceptionFilter(httpAdapter));

  initializeSwaggerDocumentation(app);

  await app.listen(configService.getOrThrow('PORT'), configService.getOrThrow('HOST'));
}

bootstrap();
