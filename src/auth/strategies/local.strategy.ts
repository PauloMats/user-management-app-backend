import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { SafeUser } from '../../users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, passwordInput: string): Promise<SafeUser> {
    const user = await this.authService.validateUser(email, passwordInput);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    return user;
  }
}