import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users') // Nome da tabela no banco de dados
export class User {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'Identificador único do usuário (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'João da Silva', description: 'Nome completo do usuário' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ example: 'joao.silva@example.com', description: 'Endereço de email único do usuário' })
  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ nullable: true }) // Senha pode ser nula se usar OAuth, mas para registro normal é obrigatória
  password?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER, description: 'Papel do usuário no sistema' })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({ description: 'Data de criação do registro do usuário' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização do registro do usuário' })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt?: Date;

  // Hook para criptografar a senha antes de salvar/atualizar
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  // Método para comparar senhas (usado no login)
  async comparePassword(attempt: string): Promise<boolean> {
    if (!this.password) return false; // Se não há senha (ex: OAuth user), não compara
    return bcrypt.compare(attempt, this.password);
  }
}