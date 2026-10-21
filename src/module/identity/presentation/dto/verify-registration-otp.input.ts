import { ApiProperty } from '@nestjs/swagger';

export class VerifyRegistrationOtpDto {
  @ApiProperty({ example: 'ada@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: '123456', minLength: 6, maxLength: 6 })
  otp!: string;

  @ApiProperty({ description: 'The otpHash returned by registration or resend.' })
  otpHash!: string;
}
