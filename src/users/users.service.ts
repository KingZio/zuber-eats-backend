import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import {CreateAccountInput} from "./dto/create-account.dto";
import { LoginInput } from "./dto/login.dto";
import { InternalServerErrorException } from "@nestjs/common";
import * as jwt from 'jsonwebtoken'
import { ConfigService } from "@nestjs/config";
import { JwtService } from "src/jwt/jwt.service";

export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        private readonly config: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    async createAccount({email, password, role,}: CreateAccountInput): Promise<[boolean, string?]> {
        try {
            const exists = await this.users.findOne({email})
            if (exists) {
                return [false, "There is a user with the email"];
            }
            await this.users.save(this.users.create({email, password, role}))
            return [true]
        } catch (e) {
            return [false, "Couldn't create account"];
        }
    }

    async login({email, password}: LoginInput): Promise<{ok: boolean, error?: string, token?: string}> {
        try {
            const user = await this.users.findOne({email})
            if (!user) {
                return {
                    ok: false,
                    error: "User not found"
                }
            }
            const passwordCorrect = await user.checkPassword(password)
            console.log(passwordCorrect)
            if(!passwordCorrect) {
                return {
                    ok: false,
                    error: "Password not correct"
                }
            }
            const token: string = jwt.sign({id: user.id}, this.config.get("SECRET_KEY"));
            return {
                ok: true,
                token
            }
        } catch (e) {
            console.log(e)
            throw new InternalServerErrorException();
        }
    }
}