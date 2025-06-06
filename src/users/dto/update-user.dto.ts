import { PartialType } from '@nestjs/swagger'; // Ou @nestjs/mapped-types
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';


// PartialType torna todos os campos de CreateUserDto opcionais
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'Novo Nome', description: 'Novo nome completo do usuário' })
  @IsOptional()
  @IsString()
  name?: string;

  // Email geralmente não é atualizado ou requer verificação especial
  // Se permitir, adicione validações:
  // @ApiPropertyOptional({ example: 'novo.email@example.com', description: 'Novo endereço de email do usuário' })
  // @IsOptional()
  // @IsEmail({}, { message: 'Formato de email inválido.' })
  // email?: string;

  @ApiPropertyOptional({ example: 'NovaSenha@123', description: 'Nova senha do usuário (mínimo 8 caracteres)' })
  @IsOptional()
  @MinLength(8, { message: 'A nova senha deve ter no mínimo 8 caracteres.' })
  password?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.ADMIN, description: 'Novo papel do usuário (apenas para admins)' })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Papel inválido. Use "admin" ou "user".' })
  role?: UserRole;
}