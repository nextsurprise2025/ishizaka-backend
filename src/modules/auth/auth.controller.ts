import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

import { CurrentUser, RequestUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { UserEntity } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ユーザー登録' })
  async register(@Body() dto: RegisterDto) {
    const { user, accessToken, refreshToken } = await this.authService.register(dto);
    return { user: new UserEntity(user), accessToken, refreshToken };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ログイン' })
  async login(@Body() dto: LoginDto) {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);
    return { user: new UserEntity(user), accessToken, refreshToken };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'リフレッシュトークンでアクセストークン更新' })
  async refresh(
    @CurrentUser() user: RequestUser & { refreshToken: string },
    @Body() _dto: RefreshTokenDto,
  ) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'ログアウト' })
  async logout(@CurrentUser() user: RequestUser) {
    await this.authService.logout(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '現在のユーザー取得' })
  async me(@CurrentUser() current: RequestUser): Promise<UserEntity> {
    const user = await this.usersService.findOne(current.sub);
    return new UserEntity(user);
  }
}
