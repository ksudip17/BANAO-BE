export const OTP_SERVICE = Symbol('OTP_SERVICE');

export interface OtpService {
    generateOtp(length: number): string;
    createHash(otp: string): Promise<string>;
    createOtpHash(email: string, otp: string): Promise<string>;
    verifyOtp(email:string, otp: string, hash: string): Promise<boolean>;
}