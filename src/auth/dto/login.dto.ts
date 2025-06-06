import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario@example.com', description: 'Email do usuário' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.'})
  @IsEmail({}, { message: 'Formato de email inválido.'})
  email: string;

  @ApiProperty({ example: 'Senha@123', description: 'Senha do usuário' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.'})
  @IsString()
  password: string;
}
