import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, User, UserProfile, UserStatus } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserProfileEntity implements Omit<UserProfile, 'userId'> {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  username!: string | null;

  @ApiProperty({ nullable: true })
  displayName!: string | null;

  @ApiProperty({ nullable: true })
  address!: string | null;

  @ApiProperty({ nullable: true })
  phoneNumber!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @Exclude()
  userId?: string;

  constructor(partial: Partial<UserProfile>) {
    Object.assign(this, partial);
  }
}

export class UserEntity implements Omit<User, 'password' | 'refreshToken'> {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  rankId!: string | null;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ nullable: true })
  deletedAt!: Date | null;

  @ApiPropertyOptional({ type: () => UserProfileEntity, nullable: true })
  profile?: UserProfileEntity | null;

  @Exclude()
  password?: string;

  @Exclude()
  refreshToken?: string | null;

  constructor(partial: Partial<User> & { profile?: UserProfile | null }) {
    const { profile, ...rest } = partial;
    Object.assign(this, rest);
    this.profile = profile ? new UserProfileEntity(profile) : null;
  }
}
