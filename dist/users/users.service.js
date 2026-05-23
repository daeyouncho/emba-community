"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(createUserDto) {
        const existing = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
        if (existing)
            throw new common_1.ConflictException('이미 사용 중인 이메일입니다.');
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.usersRepository.create({ ...createUserDto, password: hashedPassword });
        return this.usersRepository.save(user);
    }
    async findAll() {
        return this.usersRepository.find({ where: { isActive: true } });
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다.');
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email }, select: ['id', 'email', 'password', 'name', 'role', 'isActive', 'notificationEnabled'] });
    }
    async findByBirthYear(birthYear) {
        return this.usersRepository.find({ where: { birthYear, isActive: true } });
    }
    async updateLocation(userId, dto) {
        await this.usersRepository.update(userId, {
            latitude: dto.latitude,
            longitude: dto.longitude,
            locationUpdatedAt: new Date(),
        });
    }
    async findNearbyUsers(lat, lng, radiusKm) {
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
            .andWhere('user.locationUpdatedAt > :since', { since: new Date(Date.now() - 3600000) })
            .getMany();
    }
    async updateGoogleRefreshToken(userId, token) {
        await this.usersRepository.update(userId, { googleRefreshToken: token });
    }
    async updateKakaoId(userId, kakaoId) {
        await this.usersRepository.update(userId, { kakaoId });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map