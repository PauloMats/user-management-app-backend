import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UserRole } from '@prisma/client'; // Renomeado para evitar conflito local

export interface JwtPayload {
  email: string;
  sub: string; // userId
  role: UserRole; // Usar o UserRole importado do prisma
  name: string;
  userId: string; // Adicionado para ser explícito, é o mesmo que 'sub'
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: string; email: string; role: UserRole; name: string; }): Promise<JwtPayload> {
    const userExists = await this.usersService.findOne(payload.sub);
    if (!userExists) {
        throw new UnauthorizedException('Usuário do token não encontrado.');
    }
    return { userId: payload.sub, email: payload.email, role: payload.role, name: payload.name, sub: payload.sub };
  }
}
