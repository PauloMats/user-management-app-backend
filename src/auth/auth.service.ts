import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await user.comparePassword(pass)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user; // Remove a senha do objeto retornado
      return result;
    }
    return null;
  }

  async login(user: User) { // user aqui já é o usuário validado, sem a senha
    const payload = { email: user.email, sub: user.id, role: user.role };
    await this.usersService.updateLastLogin(user.id); // Atualiza lastLoginAt
    return {
      access_token: this.jwtService.sign(payload),
      user: { // Retorna algumas informações do usuário para o frontend
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
      }
    };
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    // Verifica se o email já existe (UsersService.create também faz isso, mas é bom ter aqui)
    const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Este email já está cadastrado.');
    }
    // Garante que o papel padrão seja 'user' se não especificado ou se um usuário tentar se registrar como admin
    if (!createUserDto.role || createUserDto.role === UserRole.ADMIN) {
        createUserDto.role = UserRole.USER;
    }
    return this.usersService.create(createUserDto);
  }

  // async socialLogin(userFromProvider: any) {
  //   if (!userFromProvider) {
  //     throw new UnauthorizedException('Falha no login social.');
  //   }
  //   let user = await this.usersService.findOneByEmail(userFromProvider.email);
  //   if (!user) {
  //     // Criar usuário se não existir
  //     const newUserDto: CreateUserDto = {
  //       email: userFromProvider.email,
  //       name: userFromProvider.name,
  //       // Senha não é necessária para OAuth, mas o DTO pode exigir.
  //       // A entidade User deve permitir password nulo.
  //       password: Math.random().toString(36).slice(-8), // Senha aleatória, não será usada
  //       role: UserRole.USER, // Papel padrão
  //     };
  //     user = await this.usersService.create(newUserDto);
  //   }
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { password, ...userPayload } = user;
  //   return this.login(userPayload as User); // Reutiliza o método login
  // }
}