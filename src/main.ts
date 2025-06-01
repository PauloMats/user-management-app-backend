import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS (Cross-Origin Resource Sharing) - ajuste conforme necessário para produção
  app.enableCors();

  // Pipe global para validação de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove propriedades não definidas no DTO
    forbidNonWhitelisted: true, // Lança erro se propriedades não definidas forem enviadas
    transform: true, // Transforma o payload para o tipo do DTO
  }));

  // Configuração do Swagger para documentação da API
  const config = new DocumentBuilder()
    .setTitle('Conectar API - Gerenciamento de Usuários')
    .setDescription('Documentação da API para o sistema Conectar.')
    .setVersion('1.0')
    .addBearerAuth() // Para autenticação JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // Endpoint da documentação: /api-docs

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Aplicação rodando na porta: ${port}`);
  console.log(`Documentação da API disponível em: http://localhost:${port}/api-docs`);
}
bootstrap();