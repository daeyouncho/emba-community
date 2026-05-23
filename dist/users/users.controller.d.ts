import { UsersService } from './users.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { User } from './user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<User[]>;
    findByBirthYear(year: string): Promise<User[]>;
    findOne(id: string): Promise<User>;
    updateLocation(user: User, dto: UpdateLocationDto): Promise<void>;
    findNearby(user: User, radiusKm: string): Promise<User[]>;
}
