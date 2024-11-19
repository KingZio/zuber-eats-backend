import {Field, InputType, ObjectType} from "@nestjs/graphql";
import { IsBoolean, IsNumber, IsOptional, IsString, Length } from "class-validator";
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@ObjectType()
@Entity()
export class Restaurant {

    @PrimaryGeneratedColumn()
    @Field(type => Number)
    id: number

    @Field(type => String)
    @Column()
    @Length(5)
    @IsString()
    name: string;

    @Field(type => Boolean, {defaultValue: true})
    @Column({default: true})
    @IsOptional()
    @IsBoolean()
    isVegan: boolean;

    @Field(type => String, {defaultValue: "강남"})
    @Column({default: "강남"})
    @IsString()
    address: string;
}