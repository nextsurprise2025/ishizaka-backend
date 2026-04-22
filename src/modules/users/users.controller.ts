import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationQueryDto } from '@/common/dtos/pagination.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'ユーザー作成' })
  async create(@Body() dto: CreateUserDto): Promise<UserEntity> {
    return new UserEntity(await this.usersService.create(dto));
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'ユーザー一覧取得' })
  async findAll(@Query() query: PaginationQueryDto) {
    const result = await this.usersService.findAll(query);
    return {
      ...result,
      items: result.items.map((u) => new UserEntity(u)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'ユーザー取得' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserEntity> {
    return new UserEntity(await this.usersService.findOne(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ユーザー更新' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserEntity> {
    return new UserEntity(await this.usersService.update(id, dto));
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'ユーザー削除' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<UserEntity> {
    return new UserEntity(await this.usersService.remove(id));
  }
}
