import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { CreateAccountInput, CreateAccountOutput } from "./dto/create-account.dto";
import {LoginInput, LoginOutput} from "./dto/login.dto";
import { error } from "console";

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService){}

    @Mutation(returns => CreateAccountOutput)
    async createAccount(
        @Args('input') createAccountInput: CreateAccountInput
    ): Promise<CreateAccountOutput> {
        try {
            const [ok, error] = await this.usersService.createAccount(createAccountInput);
            if (error) {
                return {
                    ok,
                    error,
                };
            }
            return {
                ok: true,
                error: null,
            };
        } catch (error) {
            return {
                ok: false,
                error: error.message,
            };
        }
    }

    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
        try {
            return this.usersService.login(loginInput)
        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }
}