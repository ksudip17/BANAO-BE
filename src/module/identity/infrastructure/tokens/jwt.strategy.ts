import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from 'src/infrastructure/prisma/generated/prisma/enums';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

interface AccessJwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: AccessJwtPayload) {
    console.log("comminSLEJFSLEJF")
    const user = await this.prisma.client.user.findFirst({
      where: {
        id: payload.sub,
        email: payload.email,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true, email: true },
    });
    if (!user) throw new UnauthorizedException();

    return {
      userId: user.id,
      email: user.email,
    };
  }
}
