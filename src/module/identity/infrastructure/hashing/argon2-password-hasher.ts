import argon2 from 'argon2';
import { PasswordHasher } from '../../application/port/password-hasher.port';

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return argon2.hash(password,{
      type: argon2.argon2id,
      memoryCost: 65536,     // 64 MiB (OWASP compliant)
      timeCost: 3,           // 3 iterations
      parallelism: 4         // 4 lanes
    }
    );
  }

  async compare(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}