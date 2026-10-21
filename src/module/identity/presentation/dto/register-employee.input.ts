import { ApiProperty } from '@nestjs/swagger';
import { RegisterUserDto } from './register-user.input';

export class RegisterEmployeeDto extends RegisterUserDto {
  @ApiProperty({ example: 'EMP-1001' })
  employeeCode!: string;

  @ApiProperty({ example: 'Operations' })
  department!: string;
}
