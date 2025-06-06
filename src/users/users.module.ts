import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Registra a entidade User para este módulo
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporta UsersService para ser usado em outros módulos (ex: AuthModule)
})
export class UsersModule {}
