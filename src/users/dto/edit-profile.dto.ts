import { Field, InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { string } from "joi";
import { CoreOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";

@InputType()
export class EditProfileInput {

    @Field(type => String, {nullable: true})
    email: string;

    @Field(type => String)
    currentPwd: string;

    @Field(type => String, {nullable: true})
    newPwd?: string;
}

@ObjectType()
export class EditProfileOutput extends CoreOutput {}