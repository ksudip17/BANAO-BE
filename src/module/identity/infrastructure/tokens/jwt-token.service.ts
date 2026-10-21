import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type {
  JwtTokenPair,
  JwtTokenPayload,
  JwtTokenServicePort,
  VerifiedRefreshToken,
} from '../../application/port/jwt-token.port';
import type { StringValue } from 'ms';

interface RefreshClaims extends JwtTokenPayload {
  tokenUse: 'refresh';
}

function asJwtDuration(value: string): StringValue {
  // jsonwebtoken parses a unitless string as milliseconds ("3600" = 3.6s).
  // Treat numeric environment values as seconds, while preserving explicit
  // durations such as "15m" and "30d".
  return (/^\d+$/.test(value) ? `${value}s` : value) as StringValue;
}

@Injectable()
export class JwtTokenService implements JwtTokenServicePort {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async issueTokenPair(payload: JwtTokenPayload): Promise<JwtTokenPair> {
    // const expiresIn = this.getPositiveInteger('JWT_EXPIRES_IN', 3600);
    const expiresIn = asJwtDuration(
      this.config.getOrThrow<string>('JWT_EXPIRES_IN'),
    );
    const secret = this.config.getOrThrow<string>('JWT_SECRET');
    // const refreshExpiresIn = this.getPositiveInteger(
    //   'JWT_REFRESH_EXPIRES_IN',
    //   2_592_000,
    // );
    const refreshExpiresIn = asJwtDuration(
      this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    );
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET')
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret, expiresIn }),
      this.jwt.signAsync(
        { ...payload, tokenUse: 'refresh' },
        { secret: refreshSecret, expiresIn: refreshExpiresIn },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  async verifyRefreshToken(token: string): Promise<VerifiedRefreshToken> {
    try {
      const claims = await this.jwt.verifyAsync<RefreshClaims>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      if (
        claims.tokenUse !== 'refresh' ||
        typeof claims.sub !== 'string' ||
        typeof claims.email !== 'string'
      ) {
        throw new UnauthorizedException('Invalid refresh token.');
      }
      return { sub: claims.sub, email: claims.email };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }
}
