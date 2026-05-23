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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcrypt");
const JWT_SECRET = 'emba-super-secret-jwt-key-2024';
const JWT_REFRESH_SECRET = 'emba-refresh-secret-2024';
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async register(createUserDto) {
        const user = await this.usersService.create(createUserDto);
        return this.generateTokens(user.id, user.email);
    }
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user)
            throw new common_1.UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
        const isValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isValid)
            throw new common_1.UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
        if (!user.isActive)
            throw new common_1.UnauthorizedException('비활성화된 계정입니다.');
        return {
            ...this.generateTokens(user.id, user.email),
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }
    generateTokens(userId, email) {
        const payload = { sub: userId, email };
        return {
            accessToken: this.jwtService.sign(payload, { secret: JWT_SECRET, expiresIn: '7d' }),
            refreshToken: this.jwtService.sign(payload, { secret: JWT_REFRESH_SECRET, expiresIn: '30d' }),
        };
    }
    async refreshAccessToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, { secret: JWT_REFRESH_SECRET });
            return this.generateTokens(payload.sub, payload.email);
        }
        catch {
            throw new common_1.UnauthorizedException('리프레시 토큰이 만료되었습니다.');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map