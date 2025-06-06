import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'Novo Nome', description: 'Novo nome completo do usuário' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'NovaSenha@123', description: 'Nova senha do usuário (mínimo 8 caracteres)' })
  @IsOptional()
  @MinLength(8, { message: 'A nova senha deve ter no mínimo 8 caracteres.' })
  password?: string;

  @ApiPropertyOptional({ description: 'Senha atual, necessária para alterar a senha.' })
  @IsOptional()
  @IsString()
  currentPassword?: string;


  @ApiPropertyOptional({ enum: UserRole, example: UserRole.ADMIN, description: 'Novo papel do usuário (apenas para admins)' })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Papel inválido. Use "ADMIN" ou "USER".' })
  role?: UserRole;
}
