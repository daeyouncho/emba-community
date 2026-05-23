import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existing) throw new ConflictException('이미 사용 중인 이메일입니다.');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({ ...createUserDto, password: hashedPassword });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email }, select: ['id', 'email', 'password', 'name', 'role', 'isActive', 'notificationEnabled'] });
  }

  async findByBirthYear(birthYear: number): Promise<User[]> {
    return this.usersRepository.find({ where: { birthYear, isActive: true } });
  }

  async updateLocation(userId: string, dto: UpdateLocationDto): Promise<void> {
    await this.usersRepository.update(userId, {
      latitude: dto.latitude,
      longitude: dto.longitude,
      locationUpdatedAt: new Date(),
    });
  }

  // 반경 내 사용자 조회 (Haversine 공식)
  async findNearbyUsers(lat: number, lng: number, radiusKm: number): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where(`
        (6371 * acos(
          cos(radians(:lat)) * cos(radians(user.latitude)) *
          cos(radians(user.longitude) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(user.latitude))
        )) < :radius
      `, { lat, lng, radius: radiusKm })
      .andWhere('user.isActive = true')
      .andWhere('user.locationUpdatedAt > :since', { since: new Date(Date.now() - 3600000) }) // 1시간 이내
      .getMany();
  }

  async updateGoogleRefreshToken(userId: string, token: string): Promise<void> {
    await this.usersRepository.update(userId, { googleRefreshToken: token });
  }

  async updateKakaoId(userId: string, kakaoId: string): Promise<void> {
    await this.usersRepository.update(userId, { kakaoId });
  }
}
