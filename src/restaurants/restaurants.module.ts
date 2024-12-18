import { Module } from '@nestjs/common';
import {RestaurantResolver} from "./restaurants.resolver";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Restaurant} from "./entity/restaurant.entity";
import {RestaurantService} from "./restaurants.service";

@Module({
    imports: [
      TypeOrmModule.forFeature([Restaurant]),
    ],
    providers: [
        RestaurantResolver,
        RestaurantService,
    ]
})
export class RestaurantsModule {}
