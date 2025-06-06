import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client'; // Tipos do Prisma
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private safeReturnUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const { email, password: plainPassword, ...restData } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Este email já está cadastrado.');
    }

    const hashedPassword = await this.hashPassword(plainPassword);

    const user = await this.prisma.user.create({
      data: {
        ...restData,
        email,
        password: hashedPassword,
        role: createUserDto.role || UserRole.USER,
      },
    });
    return this.safeReturnUser(user);
  }

  async findAll(query?: { role?: UserRole; sortBy?: string; order?: 'asc' | 'desc' }): Promise<SafeUser[]> {
    const users = await this.prisma.user.findMany({
      where: query?.role ? { role: query.role } : undefined,
      orderBy: query?.sortBy ? { [query.sortBy]: query.order || 'asc' } : { createdAt: 'desc' },
    });
    return users.map(user => this.safeReturnUser(user));
  }

  async findOne(id: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
    return this.safeReturnUser(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserDetails: { userId: string, role: UserRole, name?: string }): Promise<SafeUser> {
    const userToUpdate = await this.prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    if (currentUserDetails.role !== UserRole.ADMIN && currentUserDetails.userId !== id) {
      throw new ForbiddenException('Você não tem permissão para atualizar este usuário.');
    }

    const dataToUpdate: Partial<User> & { password?: string } = {};

    if (updateUserDto.name) {
        dataToUpdate.name = updateUserDto.name;
    }

    if (updateUserDto.password) {
        if (currentUserDetails.userId === id) {
            if (!updateUserDto.currentPassword) {
                throw new BadRequestException('Senha atual é obrigatória para alterar a senha.');
            }
            const isCurrentPasswordValid = userToUpdate.password ? await bcrypt.compare(updateUserDto.currentPassword, userToUpdate.password) : false;
            if (!isCurrentPasswordValid) {
                throw new BadRequestException('Senha atual incorreta.');
            }
        } else if (currentUserDetails.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Você não tem permissão para alterar a senha deste usuário.');
        }
        dataToUpdate.password = await this.hashPassword(updateUserDto.password);
    }

    if (updateUserDto.role) {
        if (currentUserDetails.role !== UserRole.ADMIN) {
            if (currentUserDetails.userId === id) {
                 console.warn(`Usuário ${currentUserDetails.userId} tentou alterar o próprio papel para ${updateUserDto.role}. Ação ignorada.`);
            } else {
                throw new ForbiddenException('Você não tem permissão para alterar o papel de usuários.');
            }
        } else {
            dataToUpdate.role = updateUserDto.role;
        }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });
    return this.safeReturnUser(updatedUser);
  }

  async remove(id: string, currentUserDetails: { userId: string, role: UserRole, name?: string }): Promise<void> {
    const userToDelete = await this.prisma.user.findUnique({ where: { id } });
     if (!userToDelete) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    if (currentUserDetails.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Apenas administradores podem excluir usuários.');
    }
    if (currentUserDetails.userId === id) {
        throw new BadRequestException('Administradores não podem excluir a própria conta por esta rota.');
    }

    await this.prisma.user.delete({ where: { id } });
  }

  async findInactiveUsers(): Promise<SafeUser[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactiveUsers = await this.prisma.user.findMany({
      where: {
        OR: [
          { lastLoginAt: { lt: thirtyDaysAgo } },
          { lastLoginAt: null, createdAt: { lt: thirtyDaysAgo } },
        ],
      },
    });
    return inactiveUsers.map(user => this.safeReturnUser(user));
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}