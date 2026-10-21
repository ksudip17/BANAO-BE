import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { User } from '../entity/user.entity';

export interface EmployeeProfile {
  employeeCode: string;
  department: string;
}

export interface ProviderProfile {
  experience: string;
  workingLocationAddress?: string;
  serviceRadiusKm?: number;
  hourlyRate?: number;
  workingLocationLatitude?: number;
  workingLocationLongitude?: number;
}

export interface CustomerAddressProfile {
  label: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  markEmailVerified(id: string): Promise<User>;
  create(user: User): Promise<User>;
  createCustomer(user: User, address: CustomerAddressProfile): Promise<User>;
  createEmployee(user: User, profile: EmployeeProfile): Promise<User>;
  createProvider(user: User, profile: ProviderProfile): Promise<User>;
  updateEmail(id: string, email: string): Promise<User>;
  delete(id: string): Promise<void>;
}


export class EmailAlreadyExistsError extends ConflictException {
  constructor() {
    super('An account with this email already exists.');
    this.name = 'EmailAlreadyExistsError';
  }
}

export class PhoneAlreadyExistsError extends ConflictException {
  constructor() {
    super('An account with this phone number already exists.');
    this.name = 'PhoneAlreadyExistsError';
  }
}

export class UserNotFoundError extends NotFoundException {
  constructor() {
    super('User not found.');
    this.name = 'UserNotFoundError';
  }
}

export class InvalidRegistrationError extends BadRequestException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRegistrationError';
  }
}

export class InvalidEmailOrPasswordError extends BadRequestException {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidEmailPasswordError';
  }
}
