import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service'; // Para validar se o usuário ainda existe/está ativo

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService, // Opcional: para verificar se o usuário ainda existe
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // O payload é o objeto que foi assinado no token JWT (email, sub, role)
    // Você pode adicionar mais verificações aqui, como consultar o banco de dados
    // para garantir que o usuário ainda existe ou não está bloqueado.
    const user = await this.usersService.findOne(payload.sub); // payload.sub é o userId
    if (!user) {
        throw new UnauthorizedException('Usuário não encontrado ou token inválido.');
    }
    // O que for retornado aqui será anexado ao objeto `req.user` nas rotas protegidas
    return { userId: payload.sub, email: payload.email, role: payload.role, name: user.name };
  }
}