import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto'; // Usado para registro
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registra um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado.' })
  async register(@Body() createUserDto: CreateUserDto) {
    // Por padrão, o role será 'user' conforme definido na entidade ou DTO
    const user = await this.authService.register(createUserDto);
    // Não retorne a senha, mesmo hasheada, na resposta do registro
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(LocalAuthGuard) // LocalAuthGuard irá chamar validateUser do LocalStrategy
  @Post('login')
  @HttpCode(HttpStatus.OK) // Retorna 200 OK em vez de 201 Created
  @ApiOperation({ summary: 'Autentica um usuário e retorna um token JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido, token JWT retornado.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Req() req) {
    // req.user é populado pelo LocalAuthGuard (retorno do validateUser do LocalStrategy)
    return this.authService.login(req.user as User); // req.user aqui é o objeto User validado
  }

  // Endpoints para OAuth (Google, Microsoft) seriam adicionados aqui
  // Exemplo:
  // @Get('google')
  // @UseGuards(AuthGuard('google'))
  // async googleAuth(@Req() req) {}

  // @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  // googleAuthRedirect(@Req() req) {
  //   return this.authService.socialLogin(req.user);
  // }
}