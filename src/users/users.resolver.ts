import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { CreateAccountInput, CreateAccountOutput } from "./dto/create-account.dto";
import { LoginInput, LoginOutput } from "./dto/login.dto";
import { Query } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { UserProfileInput, UserProfileOutput } from "./dto/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dto/edit-profile.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dto/verify-email.dto";

@Resolver(() => User)
export class UsersResolver {
    constructor(
        private readonly usersService: UsersService,
    ){}

    @Mutation(returns => CreateAccountOutput)
    async createAccount(
        @Args('input') createAccountInput: CreateAccountInput
    ): Promise<CreateAccountOutput> {
        return this.usersService.createAccount(createAccountInput);
    }

    @Mutation(returns => LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
        return this.usersService.login(loginInput);
    }

    @Query(type => User)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User) {
        return authUser;
    } 

    @UseGuards(AuthGuard)
    @Query(returns => UserProfileOutput)
    async userProfile(
        @AuthUser() AuthUser: User,
        @Args() userProfileInput: UserProfileInput,
    ): Promise<UserProfileOutput> {
        return this.usersService.findById(userProfileInput.userId);
    }

    @Mutation(returns => EditProfileOutput)
    async editProfile(
        @AuthUser() authUser: User,
        @Args('input') editProfileInput: EditProfileInput,
    ): Promise<EditProfileOutput> {
        return this.usersService.editProfile(authUser.id, editProfileInput);
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