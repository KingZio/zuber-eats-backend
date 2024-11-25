import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { CreateAccountInput, CreateAccountOutput } from "./dto/create-account.dto";
import {LoginInput, LoginOutput} from "./dto/login.dto";
import { Query } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { UserProfileInput, UserProfileOutput } from "./dto/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dto/edit-profile.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dto/verify-email.dto";
import { Code } from "typeorm";

@Resolver(() => User)
export class UsersResolver {
    constructor(
        private readonly usersService: UsersService,
    ){}

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

    @Query(type => User)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User) {
        return authUser;
    } 

    @UseGuards(AuthGuard)
    @Query(returns => UserProfileOutput)
    async userProfile(
        @Args() userProfileInput: UserProfileInput,
    ): Promise<UserProfileOutput> {
        try {
        const user = await this.usersService.findById(userProfileInput.userId);
        if (!user) {
            throw Error();
        }
        return {
            ok: true,
            user,
        };
        } catch (e) {
        return {
            error: 'User Not Found',
            ok: false,
        };
        }
    }

    @UseGuards(AuthGuard)
    @Mutation(returns => EditProfileOutput)
    async editProfile(
        @AuthUser() authUser: User, // 인증된 사용자
        @Args('input') input: EditProfileInput // 입력값 DTO
    ): Promise<EditProfileOutput> {
        return this.usersService.editProfile(authUser.id, input);
    } 

    @Mutation(returns => VerifyEmailOutput)
    async verifyEmail(
        @Args('input') { code }: VerifyEmailInput,
      ): Promise<VerifyEmailOutput> {
        try {
          await this.usersService.verifyEmail(code);
          return {
            ok: true,
          };
        } catch (error) {
          return {
            ok: false,
            error,
          };
        }
    }
}