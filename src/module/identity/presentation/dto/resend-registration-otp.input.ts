import { ApiProperty } from '@nestjs/swagger';

export class ResendRegistrationOtpDto {
  @ApiProperty({ example: 'ada@example.com', format: 'email' })
  email!: string;
}
