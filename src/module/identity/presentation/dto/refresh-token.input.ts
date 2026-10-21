import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'A valid refresh token returned by login.' })
  refreshToken!: string;
}
