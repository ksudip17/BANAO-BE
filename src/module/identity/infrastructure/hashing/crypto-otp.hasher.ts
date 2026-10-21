import * as crypto from 'node:crypto';
import { OtpService } from '../../application/port/otp-service.port';
import { randomInt } from 'node:crypto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

export class NodeCryptoOtpService implements OtpService {
    generateOtp = (length: number): string => {
        if (length <= 0) throw new Error('OTP length must be greater than zero');
        if (length > 10) throw new Error('OTP length too large');

        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        
        return randomInt(min, max + 1).toString();
    };

    async createHash(payload: string): Promise<string> {
        const OTP_SECRET = process.env.OTP_SECRET;
        if (!OTP_SECRET) {
            throw new InternalServerErrorException('OTP_SECRET environment variable is not set');
        }
        return crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');
    }

    async createOtpHash(email: string, otp: string): Promise<string> {
        const EXPIRY_MINUTES = Number(process.env.EXPIRY_MINUTES) || 10;
        if (!EXPIRY_MINUTES) {
            throw new InternalServerErrorException('EXPIRY_MINUTES environment variable is not set');
        }
        const expires = Date.now() + EXPIRY_MINUTES * 60 * 1000;
        const payload = `${email}.${otp}.${expires}`;
        const hash = await this.createHash(payload);
        return `${hash}.${expires}`;
    }

    async verifyOtp(email: string, otp: string, hash: string): Promise<boolean> {
        const [hashValue, expiresStr] = hash.split('.');
        const expires = Number(expiresStr);
        const now = Date.now();
        if (!Number.isFinite(expires) || !/^[a-f0-9]{64}$/i.test(hashValue ?? '')) {
            return false;
        }
        if (now > expires) throw new BadRequestException('OTP has expired');
        const OTP_SECRET = process.env.OTP_SECRET;
        if (!OTP_SECRET) {
            throw new InternalServerErrorException('OTP_SECRET environment variable is not set');
        }
        const payload = `${email}.${otp}.${expires}`;
        const newHash = await this.createHash(payload);
        return crypto.timingSafeEqual(
            Buffer.from(newHash, 'hex'),
            Buffer.from(hashValue, 'hex'),
        );
    }
}
