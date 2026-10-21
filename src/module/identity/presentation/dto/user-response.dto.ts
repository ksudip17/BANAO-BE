import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class UserSuccessResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ example: 'User Registered Successfully.' })
  message!: string;

  @ApiProperty({ type: UserDto })
  data!: UserDto;
}

export class DeleteUserSuccessResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ example: 'User deleted successfully.' })
  message!: string;

  @ApiProperty({ type: String, nullable: true, example: null })
  data!: null;
}
