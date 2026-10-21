import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { successResponse } from 'src/module/shared/common/http/success-response';
import { toPublicUser } from '../dto/user.dto';
import { AuthService } from '../../application/services/auth.service';
import { RegisterEmployeeDto } from '../dto/register-employee.input';
import { RegisterProviderDto } from '../dto/register-provider.input';
import { RegisterCustomerDto } from '../dto/register-customer.input';
import { LoginDto } from '../dto/login.input';
import { RefreshTokenDto } from '../dto/refresh-token.input';
import { VerifyRegistrationOtpDto } from '../dto/verify-registration-otp.input';
import { ResendRegistrationOtpDto } from '../dto/resend-registration-otp.input';
import { Public } from '../authorization/authorization.decorator';
import { UserTypes } from '../authorization/authorization.decorator';
import { UserType } from 'src/infrastructure/prisma/generated/prisma/enums';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller('auth/users')
export class IdentityController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Log in with email and password' })
  async login(@Body() input: LoginDto) {
    const result = await this.authService.login(input.email, input.password);
    return successResponse('Login successful.', {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenType: result.tokenType,
      user: toPublicUser(result.user),
    });
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  async refresh(@Body() input: RefreshTokenDto) {
    const result = await this.authService.refreshTokens(input.refreshToken);
    return successResponse('Tokens refreshed successfully.', {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenType: result.tokenType,
      user: toPublicUser(result.user),
    });
  }

  @Post('registrations/verification')
  @Public()
  @ApiOperation({ summary: 'Verify a registration email OTP' })
  async verifyRegistrationOtp(@Body() input: VerifyRegistrationOtpDto) {
    const user = await this.authService.verifyRegistrationOtp(
      input.email,
      input.otp,
      input.otpHash,
    );
    return successResponse('Email verified successfully.', toPublicUser(user));
  }

  @Post('registrations/resend')
  @Public()
  @ApiOperation({ summary: 'Resend the registration email OTP' })
  async resendRegistrationOtp(@Body() input: ResendRegistrationOtpDto) {
    const otpHash = await this.authService.resendRegistrationOtp(input.email);
    return successResponse('Verification code sent.', { otpHash });
  }

  @Post('customers')
  @Public()
  @ApiOperation({ summary: 'Register a customer' })
  async registerCustomer(@Body() input: RegisterCustomerDto) {
    const result = await this.authService.customerRegister(input);
    return successResponse('Customer registered successfully.', {
      user: toPublicUser(result.user),
      otpHash: result.otpHash,
    });
  }

  @Post('employees')
  @UserTypes(UserType.ADMIN)
  @ApiOperation({ summary: 'Register an employee' })
  async registerEmployee(@Body() input: RegisterEmployeeDto) {
    const result = await this.authService.employeeRegister(input);
    return successResponse('Employee registered successfully.', {
      user: toPublicUser(result.user),
      otpHash: result.otpHash,
    });
  }

  @Post('providers')
  @Public()
  @ApiOperation({ summary: 'Register a provider' })
  async registerProvider(@Body() input: RegisterProviderDto) {
    const result = await this.authService.providerRegister(input);
    return successResponse('Provider registered successfully.', {
      user: toPublicUser(result.user),
      otpHash: result.otpHash,
    });
  }
}
