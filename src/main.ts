import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true, 
    transform: true, 
  }));

  const config = new DocumentBuilder()
    .setTitle('Conectar API - Gerenciamento de Usuários')
    .setDescription('Documentação da API para o sistema Conectar.')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); 

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Aplicação rodando na porta: ${port}`);
  console.log(`Documentação da API disponível em: http://localhost:${port}/api-docs`);
}
bootstrap();