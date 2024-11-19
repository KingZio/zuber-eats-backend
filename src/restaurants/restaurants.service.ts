import {Injectable} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "./entity/restaurant.entity";
import { Repository } from "typeorm";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";

@Injectable()
export class RestaurantService {
    
    constructor(
        @InjectRepository(Restaurant) private readonly restaurants: Repository<Restaurant>
    ) {}

    getAll(): Promise<Restaurant[]>{
        return this.restaurants.find();
    }

    createRestaurant(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
        const newRestaurant = this.restaurants.create(createRestaurantDto)
        return this.restaurants.save(newRestaurant);
    }

    async updateRestaurant({id, data}: UpdateRestaurantDto) {
        const updateData = {};
        
        if (data.name !== undefined && data.name !== '') 
            updateData['name'] = data.name;
        if (data.isVegan !== undefined) 
            updateData['isVegan'] = data.isVegan;
        if (data.address !== undefined && data.address !== '') 
            updateData['address'] = data.address;
     
        return this.restaurants.update({id: id}, {...updateData});
     }
}