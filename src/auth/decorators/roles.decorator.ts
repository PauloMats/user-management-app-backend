import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
// Este decorador é usado para definir quais roles são necessárias para acessar um determinado endpoint.
// Ele utiliza o SetMetadata do NestJS para armazenar as roles no metadata do handler, que podem ser verificadas posteriormente por guards.
// Exemplo de uso:
// @Roles(UserRole.ADMIN, UserRole.USER)
// @Get('some-endpoint')
// findSomeData() {
//   return this.someService.findData();
// }
// Neste exemplo, o endpoint só será acessível para usuários com os papéis ADMIN ou USER.