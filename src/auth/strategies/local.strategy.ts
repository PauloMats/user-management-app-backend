import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Diz ao Passport para usar 'email' como campo de username
  }

  async validate(email: string, passwordInput: string): Promise<Omit<User, 'password'>> {
    const user = await this.authService.validateUser(email, passwordInput);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    return user; // Este retorno será colocado em req.user pelo LocalAuthGuard
  }
}