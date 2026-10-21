import { Inject, Injectable } from "@nestjs/common";
import { IRegistrationStrategy } from "./registration.strategy";
import { USER_REPOSITORY } from "../../domain/repositories/user.repository";
import type { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entity/user.entity";
import { RegisterEmployeeInput } from "../command/register-user.input";


@Injectable()
export class EmployeeRegistrationStrategy
  implements IRegistrationStrategy<RegisterEmployeeInput>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  createProfile(user: User, input: RegisterEmployeeInput): Promise<User> {
    return this.userRepository.createEmployee(user, {
      employeeCode: input.employeeCode.trim(),
      department: input.department.trim(),
    });
  }
}