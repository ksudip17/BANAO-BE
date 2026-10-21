import { Inject, Injectable } from "@nestjs/common";
import { IRegistrationStrategy } from "./registration.strategy";
import { RegisterCustomerInput } from "../command/register-user.input";
import { USER_REPOSITORY } from "../../domain/repositories/user.repository";
import type { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entity/user.entity";


@Injectable()
export class CustomerRegistrationStrategy implements IRegistrationStrategy<RegisterCustomerInput> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository
    ) {}


    createProfile(user: User, input: RegisterCustomerInput): Promise<User> {
        return this.userRepository.createCustomer(user, {
            fullAddress: input.address.fullAddress,
            label: input.address.label,
            latitude: input.address.latitude,
            longitude: input.address.longitude
        })
    }
}