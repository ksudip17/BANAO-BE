import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'Ada Lovelace', minLength: 1 })
  fullName!: string;

  @ApiProperty({ example: 'ada@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: '+15551234567' })
  phone!: string;

  @ApiProperty({ example: 'correct-horse-battery', minLength: 8, writeOnly: true })
  password!: string;
}
