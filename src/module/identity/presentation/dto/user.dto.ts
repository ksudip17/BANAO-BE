import { ApiProperty } from '@nestjs/swagger';
import { User } from "../../domain/entity/user.entity";

export class UserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  fullName!: string;

  @ApiProperty({ example: 'ada@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: '+15551234567' })
  phone!: string;

  @ApiProperty({ type: String, nullable: true })
  avatar!: string | null;

  @ApiProperty()
  twoFactorAuthEnabled!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export function toPublicUser(user: User): UserDto {
  const {
    id,
    fullName,
    email,
    phone,
    avatar,
    twoFactorAuthEnabled,
    createdAt,
    updatedAt,
  } = user.properties;

  return {
    id,
    fullName,
    email,
    phone,
    avatar,
    twoFactorAuthEnabled,
    createdAt,
    updatedAt,
  } satisfies UserDto;
}
