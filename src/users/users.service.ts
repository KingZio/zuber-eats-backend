import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import {CreateAccountInput} from "./dto/create-account.dto";
import { LoginInput } from "./dto/login.dto";
import { JwtService } from "src/jwt/jwt.service";
import * as bcrypt from 'bcrypt';
import { EditProfileInput, EditProfileOutput } from "./dto/edit-profile.dto";

export class UsersService {
    usersService: any;
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
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
            const token = this.jwtService.sign(user.id);
            return {
                ok: true,
                token
            }
        } catch (e) {
            return {
                ok: false,
                error: e
            }
        }
    }

    async findById(id: number): Promise<User> {
        return this.users.findOne({ id });
    }

    async comparePwd(inputPwd: string, storedPwd: string): Promise<boolean> {
        try {
          return await bcrypt.compare(inputPwd, storedPwd); // 비밀번호 비교
        } catch {
          return false;
        }
      }
    
    async editProfile(
        userId: number,
        { currentPwd, newPwd, email }: EditProfileInput
    ): Promise<EditProfileOutput> {
        try {
            const user = await this.findById(userId);
            if (!user) {
                return { ok: false, error: "User not found" };
            }
      
            // 현재 비밀번호 검증 (항상 필요)
            const isPasswordCorrect = await this.comparePwd(currentPwd, user.password);
            if (!isPasswordCorrect) {
                return { ok: false, error: "Current password is incorrect" };
            }
        
            // 새 비밀번호 업데이트
            if (newPwd) {
                user.password = await bcrypt.hash(newPwd, 10); // 새 비밀번호 해싱
            }
        
            // 이메일 업데이트
            if (email) {
                user.email = email;
            }
        
            // 업데이트된 사용자 정보 저장
            await this.users.save(user);
        
            return { ok: true };
        } catch (error) {
            return { ok: false, error: "Could not update profile" };
        }
    }
}