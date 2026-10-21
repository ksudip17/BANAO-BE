import { ApiProperty } from '@nestjs/swagger';
import { RegisterUserDto } from './register-user.input';

export class CustomerAddressDto {
  @ApiProperty({ example: 'Home' })
  label!: string;

  @ApiProperty({ example: '123 Example Street, Kathmandu' })
  fullAddress!: string;

  @ApiProperty({ example: 27.7172, minimum: -90, maximum: 90 })
  latitude!: number;

  @ApiProperty({ example: 85.324, minimum: -180, maximum: 180 })
  longitude!: number;
}

export class RegisterCustomerDto extends RegisterUserDto {
  @ApiProperty({ type: CustomerAddressDto })
  address!: CustomerAddressDto;
}
