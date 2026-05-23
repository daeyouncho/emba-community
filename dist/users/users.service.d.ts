import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByBirthYear(birthYear: number): Promise<User[]>;
    updateLocation(userId: string, dto: UpdateLocationDto): Promise<void>;
    findNearbyUsers(lat: number, lng: number, radiusKm: number): Promise<User[]>;
    updateGoogleRefreshToken(userId: string, token: string): Promise<void>;
    updateKakaoId(userId: string, kakaoId: string): Promise<void>;
}
