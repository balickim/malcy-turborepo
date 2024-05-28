import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from '~/app.module';
import { TransformInterceptor } from '~/common/interceptors/response.interceptor';
import { JwtGuard } from '~/modules/auth/guards/jwt.guard';
import { ConfigService } from '~/modules/config/config.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors = require('cors');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const allowedOrigins = [
    configService.appConfig.FE_APP_HOST,
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

  const port = configService.appConfig.PORT;

  const config = new DocumentBuilder().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
