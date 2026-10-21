import { Inject, Injectable } from "@nestjs/common";
import { IRegistrationStrategy } from "./registration.strategy";
import { RegisterProviderInput } from "../command/register-user.input";
import { USER_REPOSITORY } from "../../domain/repositories/user.repository";
import type { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entity/user.entity";

@Injectable()
export class ProviderRegistrationStrategy implements IRegistrationStrategy<RegisterProviderInput> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  createProfile(user: User, input: RegisterProviderInput): Promise<User> {
    return this.userRepository.createProvider(user, {
      experience: input.experience.trim(),
      workingLocationAddress: input.workingLocationAddress?.trim(),
      serviceRadiusKm: input.serviceRadiusKm,
      hourlyRate: input.hourlyRate,
      workingLocationLatitude: input.workingLocationLatitude,
      workingLocationLongitude: input.workingLocationLongitude,
    });
  }
}