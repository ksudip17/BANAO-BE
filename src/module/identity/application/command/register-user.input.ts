import { User } from "../../domain/entity/user.entity";

export interface RegisterUserInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}


export interface RegisterUserResult {
  user: User;
  otpHash: string;
}

export interface CustomerAddressInput {
  label: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
}

export interface RegisterCustomerInput extends RegisterUserInput {
  address: CustomerAddressInput;
}

export interface RegisterEmployeeInput extends RegisterUserInput {
  employeeCode: string;
  department: string;
}

export interface RegisterProviderInput extends RegisterUserInput {
  experience: string;
  workingLocationAddress?: string;
  serviceRadiusKm?: number;
  hourlyRate?: number;
  workingLocationLatitude?: number;
  workingLocationLongitude?: number;
}
