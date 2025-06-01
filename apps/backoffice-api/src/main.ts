import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from '~/app.module';
import { TransformInterceptor } from '~/common/interceptors/response.interceptor';
import { ApiKeyAuthGuard } from '~/modules/auth/guards/apiKey.guard';
import { AppConfig } from '~/modules/config/appConfig';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfig);

  const allowedOrigins = [
    configService.get().FE_APP_HOST,
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.use(cookieParser());
  app.useGlobalGuards(new ApiKeyAuthGuard(app.get(Reflector)));
  app.useGlobalInterceptors(new TransformInterceptor(new Reflector()));

  const port = configService.get().PORT;

  const config = new DocumentBuilder().build();

  const environment = configService.get().NODE_ENV;
  if (environment === 'development') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
