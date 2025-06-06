import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, SafeUser } from '../users/users.service';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result as SafeUser;
    }
    return null;
  }

  async login(user: SafeUser) { // user aqui já é o SafeUser
    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role, name: user.name, userId: user.id };
    await this.usersService.updateLastLogin(user.id);
    return {
      access_token: this.jwtService.sign(payload),
      user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
      }
    };
  }

  async register(createUserDto: CreateUserDto): Promise<SafeUser> {
    const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Este email já está cadastrado.');
    }
    if (!createUserDto.role || createUserDto.role === UserRole.ADMIN) {
        createUserDto.role = UserRole.USER;
    }
    return this.usersService.create(createUserDto);
  }
}