import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Admin-only endpoint to create a new user.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  createByAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

/**
 * Admin-only endpoint to list all users.
 */
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'List all users (Admin only)' })
@ApiQuery({ name: 'role', enum: UserRole, required: false, description: 'Filter users by role' })
@ApiQuery({ name: 'sortBy', type: String, required: false, description: 'Field to sort by (e.g., name, createdAt)' })
@ApiQuery({ name: 'order', enum: ['ASC', 'DESC'], required: false, description: 'Sort order (ASC or DESC)' })
@ApiResponse({ status: 200, description: 'List of users returned successfully.'})
findAll(
  @Query('role') role?: UserRole,
  @Query('sortBy') sortBy?: string,
  @Query('order') order?: 'ASC' | 'DESC',
) {
  return this.usersService.findAll({ role, sortBy, order });
}

  /**
   * Endpoint to get the profile of the logged-in user.
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the profile of the logged-in user' })
  @ApiResponse({ status: 200, description: 'User profile returned successfully.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  getProfile(@Req() req: { user: { userId: string } }) {
    const userId = req.user.userId;
    return this.usersService.findOne(userId);
  }

  /**
   * Admin-only endpoint to get a user by ID.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID (UUID)'})
  @ApiResponse({ status: 200, description: 'User returned successfully.'})
  @ApiResponse({ status: 404, description: 'User not found.'})
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Endpoint to update the profile of the logged-in user.
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update the profile of the logged-in user' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.'})
  @ApiResponse({ status: 400, description: 'Invalid data.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @ApiResponse({ status: 404, description: 'User not found.'})
  updateProfile(@Req() req: { user: User }, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.userId;
    const currentUser = req.user as User;
    if (updateUserDto.role) delete updateUserDto.role;
    return this.usersService.update(userId, updateUserDto, currentUser);
  }

  /**
   * Admin-only endpoint to update any user by ID.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a specific user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID (UUID)'})
  @ApiResponse({ status: 200, description: 'User updated successfully.'})
  @ApiResponse({ status: 404, description: 'User not found.'})
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: { user: User }) {
    const currentUser = req.user as User;
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  /**
   * Admin-only endpoint to delete a user by ID.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a specific user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID (UUID)'})
  @ApiResponse({ status: 204, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.'})
  remove(@Param('id') id: string, @Req() req: { user: User }) {
    const currentUser = req.user as User;
    return this.usersService.remove(id, currentUser);
  }

  /**
   * Admin-only endpoint to list inactive users (not logged in for the last 30 days).
   */
  @Get('inactive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List inactive users (not logged in for the last 30 days, Admin only)'})
  @ApiResponse({ status: 200, description: 'List of inactive users returned successfully.'})
  findInactiveUsers() {
      return this.usersService.findInactiveUsers();
  }
}