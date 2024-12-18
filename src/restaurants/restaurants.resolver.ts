import {Args, Mutation, Query, Resolver} from "@nestjs/graphql";
import {Restaurant} from "./entity/restaurant.entity";
import {CreateRestaurantDto} from "./dto/create-restaurant.dto";
import {RestaurantService} from "./restaurants.service";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";

@Resolver(of => Restaurant)
export class RestaurantResolver {
    constructor(private readonly restaurantService: RestaurantService){

    }
    @Query(returns => [Restaurant])
    restaurants(): Promise<Restaurant[]> {
        return this.restaurantService.getAll();
    }
    @Mutation(returns => Boolean)
    async createRestaurant(@Args('input') createRestaurantDto: CreateRestaurantDto
        ): Promise<boolean> {
        try {
            await this.restaurantService.createRestaurant(createRestaurantDto)
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
    @Mutation(returns => Boolean)
    async updateRestaurant(
        @Args('input') updateRestaurantDto: UpdateRestaurantDto
    ): Promise<boolean> {
        try {
            await this.restaurantService.updateRestaurant(updateRestaurantDto);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}