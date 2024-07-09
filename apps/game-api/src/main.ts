import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from '~/app.module';
import { TransformInterceptor } from '~/common/interceptors/response.interceptor';
import { JwtGuard } from '~/modules/auth/guards/jwt.guard';
import { AppConfig } from '~/modules/config/appConfig';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfig);

  const allowedOrigins = [
    configService.get().FE_APP_HOST,
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:5173',
    'http://localhost:8090',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Origin not allowed by CORS'), false);
        }
      },
      credentials: true,
    }),
  );

  app.use(cookieParser());
  app.useGlobalGuards(new JwtGuard(app.get(Reflector)));
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
