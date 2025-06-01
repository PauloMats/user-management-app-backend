import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Maria Souza', description: 'Nome completo do usuário' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'maria.souza@example.com', description: 'Endereço de email do usuário' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
  @IsEmail({}, { message: 'Formato de email inválido.' })
  email: string;

  @ApiProperty({ example: 'Senha@123', description: 'Senha do usuário (mínimo 8 caracteres)' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.USER, description: 'Papel do usuário (opcional, padrão user)' })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Papel inválido. Use "admin" ou "user".' })
  role?: UserRole;
}
