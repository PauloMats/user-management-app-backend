import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, MoreThan } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto; // Senha será hasheada pelo hook @BeforeInsert na entidade

    // Verifica se o email já existe
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Este email já está cadastrado.');
    }

    const user = this.usersRepository.create(createUserDto);
    // O hook BeforeInsert/BeforeUpdate na entidade User irá hashear a senha
    return this.usersRepository.save(user);
  }

  async findAll(query?: { role?: UserRole; sortBy?: string; order?: 'ASC' | 'DESC' }): Promise<User[]> {
    const options: FindManyOptions<User> = {};
    if (query?.role) {
      options.where = { role: query.role };
    }
    if (query?.sortBy) {
      options.order = { [query.sortBy]: query.order || 'ASC' };
    }
    // Remove a senha do retorno
    const users = await this.usersRepository.find(options);
    return users.map(user => {
      delete user.password;
      return user;
    });
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
    delete user.password; // Nunca retorne a senha hasheada diretamente
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    // Este método é útil para autenticação, então pode retornar a senha
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<User> {
    const userToUpdate = await this.usersRepository.findOne({ where: { id } });
    if (!userToUpdate) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    // Regras de permissão
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('Você não tem permissão para atualizar este usuário.');
    }

    // Admin pode mudar o role, usuário normal não
    if (updateUserDto.role && currentUser.role !== UserRole.ADMIN) {
      delete updateUserDto.role; // Ignora a tentativa de mudar o role
    }

    // Se a senha está sendo atualizada, ela será hasheada pelo hook @BeforeUpdate
    Object.assign(userToUpdate, updateUserDto);
    const updatedUser = await this.usersRepository.save(userToUpdate);
    delete updatedUser.password;
    return updatedUser;
  }

  async remove(id: string, currentUser: User): Promise<void> {
    // Regra: Admin não pode se auto-deletar (ou precisa de lógica especial)
    if (currentUser.id === id) {
        throw new BadRequestException('Você não pode excluir sua própria conta como administrador por esta rota.');
    }

    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
  }

  async findInactiveUsers(): Promise<User[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Considera inativo quem não logou nos últimos 30 dias
    // OU quem foi criado há mais de 30 dias e nunca logou (lastLoginAt é null)
    const inactiveUsers = await this.usersRepository.createQueryBuilder("user")
        .where("user.lastLoginAt < :thirtyDaysAgo", { thirtyDaysAgo })
        .orWhere("(user.lastLoginAt IS NULL AND user.createdAt < :thirtyDaysAgo)", { thirtyDaysAgo })
        .getMany();

    return inactiveUsers.map(user => {
        delete user.password;
        return user;
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { lastLoginAt: new Date() });
  }
}
