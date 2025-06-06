import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { User } from '../src/users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis de ambiente disponíveis globalmente
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // ou 'mysql'
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT ?? '3001', 10), // Padrão para 3001 se não definido
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