import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateAccountInput, CreateAccountOutput } from "./dto/create-account.dto";
import { LoginInput, LoginOutput } from "./dto/login.dto";
import { JwtService } from "src/jwt/jwt.service";
import * as bcrypt from 'bcrypt';
import { EditProfileInput, EditProfileOutput } from "./dto/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { UserProfileOutput } from "./dto/user-profile.dto";
import { MailService } from "src/mail/mail.service";

export class UsersService {
    usersService: any;
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
    ) {}

    async createAccount({email, password, role,}: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
          const exists = await this.users.findOne({ email });
          if (exists) {
            return { ok: false, error: 'There is a user with that email already' };
          }
          const user = await this.users.save(
            this.users.create({ email, password, role }),
          );
          const verification = await this.verifications.save(this.verifications.create({ user }));
          await this.mailService.verifySendEmail("인증코드", verification.code, user.email)
          return { ok: true };
        } catch (e) {
          return { ok: false, error: "Couldn't create account" };
        }
      }

      async login({ email, password }: LoginInput): Promise<LoginOutput> {
        try {
            const user = await this.users.findOne({email}, {select: ["id", "email", "password"]})
            if (!user) {
                return {
                    ok: false,
                    error: "User not found"
                }
            }
            const passwordCorrect = await user.checkPassword(password);
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

    async findById(id: number): Promise<UserProfileOutput> {
        try {
          const user = await this.users.findOne({ id }, {select: ['id', 'email', 'password', 'verified']});
          if (user) {
            return {
              ok: true,
              user: user,
            };
          }
        } catch (error) {
          return { ok: false, error: 'User Not Found' };
        }
      }

    async comparePwd(inputPwd: string, storedPwd: string): Promise<boolean> {
        try {
          return await bcrypt.compare(inputPwd, storedPwd); // 비밀번호 비교
        } catch {
          return false;
        }
      }

      generateVerificationCode(): string {
        return Math.random().toString(36).substring(2, 8); // 6자리 랜덤 문자열 생성
      }
    
    
      async editProfile(
        id: number,
        { currentPwd, newPwd, email }: EditProfileInput
    ): Promise<EditProfileOutput> {
        try {
            const user = await this.users.findOne(
                { id }, 
                { select: ["id", "password", "email"] }
            );

            if (!user) {
                return { ok: false, error: "User not found" };
            }
    
            // 비밀번호 검증
            const isPasswordCorrect = await this.comparePwd(currentPwd, user.password);
            if (!isPasswordCorrect) {
                return { ok: false, error: "Current password is incorrect" };
            }
    
            // 비밀번호만 변경
            if (newPwd && !email) {
                user.password = await bcrypt.hash(newPwd, 10);
                await this.users.save(user);
                return { ok: true };
            }
    
            if (email && !newPwd) {
              user.email = email;
              user.verified = false;
              await this.users.save(user);
        
              // 기존 verification 삭제
              await this.verifications.delete({ user });
        
              // 새로운 verification 생성
              const verification = await this.verifications.save(
                this.verifications.create({ user })
              );
        
              // 인증 메일 발송
              await this.mailService.verifySendEmail(
                '인증코드',
                verification.code,
                email,
              );
        
              return { ok: true };
            }

    
            if (email && newPwd) {
              user.password = await bcrypt.hash(newPwd, 10);;
              user.email = email;
              user.verified = false;
              await this.users.save(user);
        
              // 기존 verification 삭제
              await this.verifications.delete({ user });
        
              // 새로운 verification 생성
              const verification = await this.verifications.save(
                this.verifications.create({ user })
              );
        
              // 인증 메일 발송
              await this.mailService.verifySendEmail(
                '인증코드',
                verification.code,
                email,
              );
        
              return { ok: true };
            }
    
            return { ok: false, error: "Nothing to update" };
        } catch (error) {
          console.log(error)
          return { ok: false, error: "Could not update profile" };
        }
    }

    async verifyEmail(code: string): Promise<boolean> {
        try {
            const verification = await this.verifications.findOne(
                { code },
                { relations: ['user'] },
            );
            if (verification) {
                verification.user.verified = true;
                await this.users.save(verification.user);
                await this.verifications.delete(verification.id);
                return true;
            }
            throw new Error();
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}