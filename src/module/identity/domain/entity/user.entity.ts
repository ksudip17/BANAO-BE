import { randomUUID } from "crypto";
import { InvalidEmailOrPasswordError } from "../repositories/user.repository";
import { User as PrismaUser, UserStatus, UserType } from "src/infrastructure/prisma/generated/prisma/client";

export class User {
  constructor(public readonly properties: PrismaUser) {}

  static create(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    userType: UserType;
  }): User {
    const now = new Date();

    return new User({
      id: randomUUID(),
      fullName: data.fullName,
      email: data.email.trim().toLowerCase(),
      phone: data.phone,
      password: data.password,
      avatar: null,
      status: UserStatus.INACTIVE,
      userType: data.userType,
      twoFactorAuthEnabled: false,
      emailVerifiedAt: null,
      phoneVerifiedAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  get id(): string {
    return this.properties.id;
  }

  get email(): string {
    return this.properties.email;
  }

  changeEmail(email: string): void {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      throw new InvalidEmailOrPasswordError();
    }

    if (this.properties.email === normalizedEmail) {
      return;
    }

    this.properties.email = normalizedEmail;
    this.properties.emailVerifiedAt = null;
    this.properties.updatedAt = new Date();
  }
}


