import { ApiProperty } from '@nestjs/swagger';

export class ChangeUserEmailInput {
  @ApiProperty({ example: 'ada.new@example.com', format: 'email' })
  newEmail!: string;

  @ApiProperty({ example: 'correct-horse-battery', writeOnly: true })
  currentPassword!: string;
}
