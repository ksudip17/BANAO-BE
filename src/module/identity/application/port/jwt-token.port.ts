import { UserType } from "src/infrastructure/prisma/generated/prisma/enums";

export interface JwtTokenPayload {
  sub: string;
  email: string;
  userType: UserType;
}

export interface JwtTokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  // expiresIn: number;
  // refreshExpiresIn: number;
}

export interface VerifiedRefreshToken {
  sub: string;
  email: string;
}

export interface JwtTokenServicePort {
  issueTokenPair(payload: JwtTokenPayload): Promise<JwtTokenPair>;
  verifyRefreshToken(token: string): Promise<VerifiedRefreshToken>;
}

export const JWT_TOKEN_SERVICE = Symbol('JWT_TOKEN_SERVICE');
