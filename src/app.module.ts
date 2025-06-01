import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from '../user-management-backend/src/users/users.module';
import { User } from '../user-management-backend/src/users/entities/user.entity'; // Importar entidade User

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis de ambiente disponíveis globalmente
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // ou 'mysql'
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User], // Adicionar todas as entidades aqui
      synchronize: process.env.NODE_ENV !== 'production', // true em dev para criar tabelas automaticamente (cuidado em produção)
      // Em produção, use migrations:
      // migrationsRun: true,
      // migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
      // cli: {
      //   migrationsDir: 'src/migrations',
      // },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}