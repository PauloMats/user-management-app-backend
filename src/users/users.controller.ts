import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cria um novo usuário (Admin only)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  createByAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lista todos os usuários (Admin only)' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false, description: 'Filtra usuários por papel' })
  @ApiQuery({ name: 'sortBy', type: String, required: false, description: 'Campo para ordenação (ex: name, createdAt)' })
  @ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false, description: 'Ordem da ordenação (ASC ou DESC)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.'})
  findAll(
    @Query('role') role?: UserRole,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
  ) {
    const normalizedOrder = order ? order.toLowerCase() as 'asc' | 'desc' : undefined;
    return this.usersService.findAll({ role, sortBy, order: normalizedOrder });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtém o perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário retornado com sucesso.'})
  @ApiResponse({ status: 401, description: 'Não autorizado.'})
  getProfile(@Req() req: { user: JwtPayload }) {
    const userId = req.user.userId;
    if (!userId) {
      throw new Error('User ID is missing from JWT payload.');
    }
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtém um usuário específico por ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID (UUID)'})
  @ApiResponse({ status: 200, description: 'Usuário retornado com sucesso.'})
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.'})
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualiza o perfil do usuário logado' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.'})
  @ApiResponse({ status: 400, description: 'Dados inválidos.'})
  @ApiResponse({ status: 401, description: 'Não autorizado.'})
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.'})
  updateProfile(@Req() req: { user: JwtPayload }, @Body() updateUserDto: UpdateUserDto) {
    if (!req.user.userId) {
      throw new Error('User ID is missing from JWT payload.');
    }
    const currentUserDetails = { userId: req.user.userId, role: req.user.role, name: req.user.name };
    if (updateUserDto.role && req.user.role !== UserRole.ADMIN) {
        delete updateUserDto.role;
    }
    return this.usersService.update(req.user.userId, updateUserDto, currentUserDetails);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualiza um usuário específico por ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID (UUID)'})
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.'})
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.'})
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: { user: JwtPayload }) {
    const currentUserDetails = { userId: req.user.userId as string, role: req.user.role, name: req.user.name };
    return this.usersService.update(id, updateUserDto, currentUserDetails);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 em caso de sucesso
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Exclui um usuário específico por ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID (UUID)'})
  @ApiResponse({ status: 204, description: 'Usuário excluído com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.'})
  async remove(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    if (!req.user.userId) {
      throw new Error('User ID is missing from JWT payload.');
    }
    const currentUserDetails = { userId: req.user.userId as string, role: req.user.role, name: req.user.name };
    await this.usersService.remove(id, currentUserDetails);
  }

  @Get('inactive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List inactive users (not logged in for the last 30 days, Admin only)'})
  @ApiResponse({ status: 200, description: 'List of inactive users returned successfully.'})
  findInactiveUsers() {
      return this.usersService.findInactiveUsers();
  }
}