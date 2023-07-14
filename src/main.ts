import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  app.setGlobalPrefix('api');
  enableSwaggerConfig(app);
  const port = process.env.PORT || 80;
  await app.listen(port);
}
bootstrap();

const enableSwaggerConfig = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Eclipseworks Balcão de Ofertas API')
    .setDescription('Documentation for Eclipseworks Balcão de Ofertas API')
    .setVersion(process.env.npm_package_version || '1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
};
