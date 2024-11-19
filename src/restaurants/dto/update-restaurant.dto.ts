import { ArgsType, Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./create-restaurant.dto";

@InputType()
class UpdateRestaurantInputType extends PartialType(
    CreateRestaurantDto
){
    @Field(type => Boolean, { nullable: true, defaultValue: undefined })
    isVegan?: boolean;

    @Field(type => String, { nullable: true, defaultValue: undefined })
    address?: string;
}

@InputType()
export class UpdateRestaurantDto {
    @Field(type => Number)
    id: number;

    @Field(type => UpdateRestaurantInputType)
    data: UpdateRestaurantInputType;
}
