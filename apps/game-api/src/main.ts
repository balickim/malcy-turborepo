import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from '~/app.module';
import { TransformInterceptor } from '~/common/interceptors/response.interceptor';
import { AuthService } from '~/modules/auth/auth.service';
import { SessionGuard } from '~/modules/auth/guards/session.guard';
import { AppConfig } from '~/modules/config/appConfig';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfig);

  const allowedOrigins = [
    configService.get().FE_APP_HOST.replace(/\/$/, ''),
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
  app.useGlobalGuards(
    new SessionGuard(app.get(AuthService), app.get(Reflector)),
  );
  app.useGlobalInterceptors(new TransformInterceptor(new Reflector()));
  app.useGlobalPipes(new ValidationPipe());

  const port = configService.get().PORT;

  const environment = configService.get().NODE_ENV;
  if (environment === 'development') {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const config = new DocumentBuilder().build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // Uncomment this to generate nestjs modules dependency graph

    // const { SpelunkerModule } = await import('nestjs-spelunker');
    // const tree = SpelunkerModule.explore(app);
    // const root = SpelunkerModule.graph(tree);
    // const edges = SpelunkerModule.findGraphEdges(root);
    // console.log('graph LR');
    // const mermaidEdges = edges.map(
    //   ({ from, to }) => `  ${from.module.name}-->${to.module.name}`,
    // );
    // console.log(mermaidEdges.join('\n'));
  }

  if (environment === 'production') {
    Logger.overrideLogger(['warn', 'error']);
  }

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
