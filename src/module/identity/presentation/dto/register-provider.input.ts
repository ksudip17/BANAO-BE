import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RegisterUserDto } from './register-user.input';

export class RegisterProviderDto extends RegisterUserDto {
  @ApiProperty({ example: '5 years' })
  experience!: string;

  @ApiPropertyOptional({ example: 'Kathmandu, Nepal' })
  workingLocationAddress?: string;

  @ApiPropertyOptional({ example: 15, minimum: 1 })
  serviceRadiusKm?: number;

  @ApiPropertyOptional({ example: 25, minimum: 0 })
  hourlyRate?: number;

  @ApiPropertyOptional({ example: 27.7172, minimum: -90, maximum: 90 })
  workingLocationLatitude?: number;

  @ApiPropertyOptional({ example: 85.324, minimum: -180, maximum: 180 })
  workingLocationLongitude?: number;
}
